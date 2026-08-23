"use server";

import { revalidatePath } from "next/cache";

import { canEditAnyEod, requireStaff } from "./auth";
import { salesDb } from "@/lib/supabase/admin";
import { audit, friendly } from "./audit";
import type { ActionResult } from "./actions";

/**
 * The end-of-day report.
 *
 * One per person per day, which the database enforces with
 * eod_reports_one_per_day. This function never has to wonder whether a
 * second tab already filed one: it upserts, and the constraint decides.
 *
 * Nothing here writes an "achieved" figure anywhere. The counts are the
 * only stored fact; every total on every scoreboard is a view reading
 * them back. That is why correcting Tuesday on Friday simply works.
 */

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** How far back someone may fix their own day. Older needs a manager. */
const SELF_EDIT_DAYS = 1;

/**
 * A count that almost certainly came from a slipped keyboard.
 *
 * Not a limit — people have big days. The form warns above this and
 * still lets it through, because refusing a true number would teach
 * people to round down.
 */
const IMPLAUSIBLE = 500;

export type EodInput = {
  /** Whose day. Only a manager or owner may pass anyone but themselves. */
  userId?: string;
  reportedOn: string;
  notes: string;
  counts: { activityTypeId: string; count: number }[];
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const a = new Date(from + "T00:00:00Z").getTime();
  const b = new Date(to + "T00:00:00Z").getTime();
  return Math.round((b - a) / 86_400_000);
}

export async function submitEod(input: EodInput): Promise<ActionResult & { warning?: string }> {
  const session = await requireStaff();
  const db = salesDb();

  const targetUserId = input.userId ?? session.userId;
  const forSomeoneElse = targetUserId !== session.userId;

  if (forSomeoneElse && !canEditAnyEod(session.role)) {
    return { ok: false, error: "You can only file your own report." };
  }

  if (!DATE.test(input.reportedOn)) {
    return { ok: false, error: "Pick the day this work happened." };
  }

  // The server runs on UTC; a person east of it starts a new day first.
  // One day of slack lets them report their own date without letting
  // anyone report a week of work that hasn't happened.
  const ahead = daysBetween(today(), input.reportedOn);
  if (ahead > 1) {
    return { ok: false, error: "You can't report a day that hasn't happened yet." };
  }

  if (!forSomeoneElse && !canEditAnyEod(session.role)) {
    const age = daysBetween(input.reportedOn, today());
    if (age > SELF_EDIT_DAYS) {
      return {
        ok: false,
        error: "You can only change today's or yesterday's report. Ask a manager to fix anything older.",
      };
    }
  }

  const counts = input.counts.filter((c) => c.activityTypeId);
  if (counts.length === 0) {
    return { ok: false, error: "There's nothing to report — no activities are assigned to you." };
  }

  for (const entry of counts) {
    if (!Number.isInteger(entry.count) || entry.count < 0) {
      return { ok: false, error: "Every count must be a whole number, zero or more." };
    }
  }

  // Someone may only report activities they are actually assigned,
  // unless a manager is filing on their behalf.
  const { data: assigned } = await db
    .from("user_activities")
    .select("activity_type_id")
    .eq("user_id", targetUserId);

  const allowed = new Set((assigned ?? []).map((r) => r.activity_type_id));
  if (!forSomeoneElse && counts.some((c) => !allowed.has(c.activityTypeId))) {
    return { ok: false, error: "That activity isn't assigned to you." };
  }

  const { data: existing } = await db
    .from("eod_reports")
    .select("id")
    .eq("user_id", targetUserId)
    .eq("reported_on", input.reportedOn)
    .maybeSingle();

  let reportId = existing?.id as string | undefined;
  let before: unknown = null;

  if (reportId) {
    const { data: previous } = await db
      .from("eod_entries")
      .select("activity_type_id, count")
      .eq("report_id", reportId);
    before = { notes: input.notes, entries: previous ?? [] };

    const { error } = await db
      .from("eod_reports")
      .update({ notes: input.notes.trim() || null, submitted_at: new Date().toISOString() })
      .eq("id", reportId);
    if (error) return { ok: false, error: friendly(error) };
  } else {
    const { data, error } = await db
      .from("eod_reports")
      .insert({
        user_id: targetUserId,
        reported_on: input.reportedOn,
        notes: input.notes.trim() || null,
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: friendly(error) };
    reportId = data.id;
  }

  if (!reportId) return { ok: false, error: "Could not save that report." };

  // Replace the counts wholesale. The form always sends every activity
  // the person is assigned, so a partial update would leave yesterday's
  // number sitting under today's report.
  const { error: cleared } = await db.from("eod_entries").delete().eq("report_id", reportId);
  if (cleared) return { ok: false, error: friendly(cleared) };

  const { error: inserted } = await db.from("eod_entries").insert(
    counts.map((c) => ({
      report_id: reportId,
      activity_type_id: c.activityTypeId,
      count: c.count,
    })),
  );
  if (inserted) return { ok: false, error: friendly(inserted) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: existing ? "eod.updated" : "eod.submitted",
    entity: "eod_report",
    entityId: reportId,
    before,
    after: { user_id: targetUserId, reported_on: input.reportedOn, entries: counts },
  });

  revalidateEod();

  const biggest = Math.max(...counts.map((c) => c.count));
  return biggest > IMPLAUSIBLE
    ? { ok: true, warning: `${biggest} is a big number — worth a second look before you move on.` }
    : { ok: true };
}

/** Manager or owner only: removing a day changes everyone's totals. */
export async function deleteEod(reportId: string): Promise<ActionResult> {
  const session = await requireStaff();
  if (!canEditAnyEod(session.role)) {
    return { ok: false, error: "Only a manager or owner can remove a report." };
  }

  const db = salesDb();
  const { data: before } = await db
    .from("eod_reports")
    .select("id, user_id, reported_on, notes")
    .eq("id", reportId)
    .maybeSingle();

  if (!before) return { ok: false, error: "We couldn't find that report." };

  const { data: entries } = await db
    .from("eod_entries")
    .select("activity_type_id, count")
    .eq("report_id", reportId);

  const { error } = await db.from("eod_reports").delete().eq("id", reportId);
  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "eod.deleted",
    entity: "eod_report",
    entityId: reportId,
    before: { ...before, entries: entries ?? [] },
  });

  revalidateEod();
  return { ok: true };
}

function revalidateEod() {
  revalidatePath("/admin");
  revalidatePath("/admin/today");
  revalidatePath("/admin/scoreboard");
  revalidatePath("/admin/reports");
}
