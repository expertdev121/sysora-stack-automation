"use server";

import { revalidatePath } from "next/cache";

import { requireFinance, requireOwner } from "./auth";
import { publicDb, salesDb } from "@/lib/supabase/admin";
import { audit, friendly } from "./audit";
import type { ActionResult } from "./types";

/**
 * Lead measures: what is worth counting, who reports it, and the number
 * attached to a target.
 *
 * The catalogue and the assignments live in `public` alongside the
 * people and their end-of-day reports — that is where work happens. The
 * *target* is a sales idea, so it stays in `sales` and reaches across by
 * foreign key. Nothing is duplicated between the two.
 */

const SLUG = /^[a-z][a-z0-9_]*$/;

/* ---- The catalogue ------------------------------------------ */

export type WorkMetricInput = {
  id?: string;
  slug: string;
  label: string;
  question: string;
  unit: string;
  sortOrder: number;
  feedsSales: boolean;
};

/** Owner only: what the business counts is structural, like pricing. */
export async function saveWorkMetric(input: WorkMetricInput): Promise<ActionResult> {
  const session = await requireOwner();

  const slug = input.slug.trim().toLowerCase();
  const label = input.label.trim();
  const question = input.question.trim();

  if (!label) return { ok: false, error: "Give the metric a name." };
  if (!question) return { ok: false, error: "Write the question the daily report should ask." };
  if (!SLUG.test(slug)) {
    return {
      ok: false,
      error: "The key must start with a letter and use only lowercase letters, numbers and underscores.",
    };
  }

  const db = publicDb();
  const row = {
    slug,
    label,
    question,
    unit: input.unit.trim() || "count",
    sort_order: Number.isFinite(input.sortOrder) ? Math.trunc(input.sortOrder) : 0,
    feeds_sales: input.feedsSales,
  };

  if (input.id) {
    const { error } = await db.from("work_metrics").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendly(error) };
  } else {
    const { error } = await db.from("work_metrics").insert(row);
    if (error) return { ok: false, error: friendly(error) };
  }

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: input.id ? "work_metric.updated" : "work_metric.created",
    entity: "work_metric",
    entityId: input.id ?? slug,
    after: row,
  });

  revalidateActivity();
  return { ok: true };
}

/**
 * Retire a metric without erasing what it measured.
 *
 * No delete: reports and targets point at these rows, and the foreign
 * key from eod_metrics is `restrict` for exactly that reason.
 */
export async function setWorkMetricActive(id: string, isActive: boolean): Promise<ActionResult> {
  const session = await requireOwner();

  const { error } = await publicDb().from("work_metrics").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: isActive ? "work_metric.activated" : "work_metric.retired",
    entity: "work_metric",
    entityId: id,
    after: { is_active: isActive },
  });

  revalidateActivity();
  return { ok: true };
}

/* ---- Who reports what --------------------------------------- */

/**
 * Which numbers a person is asked for, keyed by profile.
 *
 * A person does the work whether or not they can sign into this app, so
 * the assignment hangs off their employee record rather than off a
 * dashboard login.
 */
export async function setProfileMetrics(
  profileId: string,
  metricIds: string[],
): Promise<ActionResult> {
  const session = await requireOwner();
  const db = publicDb();

  const { data: profile } = await db
    .from("profiles")
    .select("id, full_name")
    .eq("id", profileId)
    .maybeSingle();

  if (!profile) return { ok: false, error: "We couldn't find that person." };

  const { data: before } = await db
    .from("profile_metrics")
    .select("metric_id")
    .eq("profile_id", profileId);

  const wanted = [...new Set(metricIds)];

  // The form always sends the complete list, so a diff would only be a
  // slower way to reach the same state.
  const { error: cleared } = await db.from("profile_metrics").delete().eq("profile_id", profileId);
  if (cleared) return { ok: false, error: friendly(cleared) };

  if (wanted.length > 0) {
    const { error } = await db
      .from("profile_metrics")
      .insert(wanted.map((metric_id) => ({ profile_id: profileId, metric_id })));
    if (error) return { ok: false, error: friendly(error) };
  }

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "profile.metrics_assigned",
    entity: "profile",
    entityId: profileId,
    before: { metric_ids: (before ?? []).map((r) => r.metric_id) },
    after: { metric_ids: wanted },
  });

  revalidatePath("/team");
  revalidateActivity();
  return { ok: true };
}

/**
 * Join a dashboard login to the person it belongs to.
 *
 * Not one login matched a profile by email, so this is a decision
 * somebody makes rather than something the system can infer. Unique on
 * the column, so one person cannot end up with two logins quietly
 * diverging.
 */
export async function linkLoginToProfile(
  userId: string,
  profileId: string | null,
): Promise<ActionResult> {
  const session = await requireOwner();

  const { error } = await salesDb()
    .from("users")
    .update({ profile_id: profileId })
    .eq("id", userId);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That person already has a login. One person, one login." };
    }
    return { ok: false, error: friendly(error) };
  }

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: profileId ? "login.linked_to_profile" : "login.unlinked",
    entity: "user",
    entityId: userId,
    after: { profile_id: profileId },
  });

  revalidatePath("/team");
  return { ok: true };
}

/* ---- Activity targets --------------------------------------- */

export type ActivityTargetInput = {
  activityTypeId: string;
  /** Zero or blank removes the lead measure from this target. */
  targetCount: number | null;
};

export async function saveActivityTargets(
  revenueTargetId: string,
  rows: ActivityTargetInput[],
): Promise<ActionResult> {
  const session = await requireFinance();
  const db = salesDb();

  const { data: target } = await db
    .from("revenue_targets")
    .select("id, name")
    .eq("id", revenueTargetId)
    .maybeSingle();

  if (!target) return { ok: false, error: "We couldn't find that target." };

  for (const row of rows) {
    if (row.targetCount === null) continue;
    if (!Number.isInteger(row.targetCount) || row.targetCount < 0) {
      return { ok: false, error: "Activity targets must be whole numbers." };
    }
  }

  const keep = rows.filter((r) => r.targetCount !== null && r.targetCount > 0);
  const drop = rows.filter((r) => r.targetCount === null || r.targetCount === 0);

  const { data: before } = await db
    .from("activity_targets")
    .select("activity_type_id, target_count")
    .eq("revenue_target_id", revenueTargetId);

  if (drop.length > 0) {
    const { error } = await db
      .from("activity_targets")
      .delete()
      .eq("revenue_target_id", revenueTargetId)
      .in("activity_type_id", drop.map((r) => r.activityTypeId));
    if (error) return { ok: false, error: friendly(error) };
  }

  if (keep.length > 0) {
    const { error } = await db.from("activity_targets").upsert(
      keep.map((r) => ({
        revenue_target_id: revenueTargetId,
        activity_type_id: r.activityTypeId,
        target_count: r.targetCount as number,
        created_by: session.userId,
      })),
      { onConflict: "revenue_target_id,activity_type_id" },
    );
    if (error) return { ok: false, error: friendly(error) };
  }

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "activity_targets.saved",
    entity: "revenue_target",
    entityId: revenueTargetId,
    before: { activity_targets: before ?? [] },
    after: {
      activity_targets: keep.map((r) => ({
        activity_type_id: r.activityTypeId,
        target_count: r.targetCount,
      })),
    },
  });

  revalidateActivity();
  return { ok: true };
}

function revalidateActivity() {
  revalidatePath("/");
  revalidatePath("/targets");
  revalidatePath("/activity");
  revalidatePath("/metrics");
  revalidatePath("/expenses");
}
