"use server";

import { revalidatePath } from "next/cache";

import { requireFinance, requireOwner } from "./auth";
import { salesDb } from "@/lib/supabase/admin";
import { audit, friendly } from "./audit";
import type { ActionResult } from "./types";

/**
 * Lead measures: the activities themselves, who is assigned to them,
 * and the number attached to a revenue target.
 *
 * Same conventions as revenue-actions.ts: guard first, re-validate on
 * the server whatever the form already checked, write an audit row,
 * revalidate the pages that show it.
 */

const SLUG = /^[a-z][a-z0-9_]*$/;

/* ---- Activity types ---------------------------------------- */

export type ActivityTypeInput = {
  id?: string;
  slug: string;
  label: string;
  question: string;
  sortOrder: number;
};

/** Owner only: which activities exist is structural, like pricing. */
export async function saveActivityType(input: ActivityTypeInput): Promise<ActionResult> {
  const session = await requireOwner();

  const slug = input.slug.trim().toLowerCase();
  const label = input.label.trim();
  const question = input.question.trim();

  if (!label) return { ok: false, error: "Give the activity a name." };
  if (!question) return { ok: false, error: "Write the question the daily form should ask." };
  if (!SLUG.test(slug)) {
    return {
      ok: false,
      error: "The key must start with a letter and use only lowercase letters, numbers and underscores.",
    };
  }

  const db = salesDb();
  const row = {
    slug,
    label,
    question,
    sort_order: Number.isFinite(input.sortOrder) ? Math.trunc(input.sortOrder) : 0,
  };

  if (input.id) {
    const { data: before } = await db
      .from("activity_types")
      .select("slug, label, question, sort_order")
      .eq("id", input.id)
      .maybeSingle();

    if (!before) return { ok: false, error: "We couldn't find that activity." };

    const { error } = await db.from("activity_types").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendly(error) };

    await audit({
      actorId: session.userId,
      actorEmail: session.email,
      action: "activity_type.updated",
      entity: "activity_type",
      entityId: input.id,
      before,
      after: row,
    });
  } else {
    const { data, error } = await db.from("activity_types").insert(row).select("id").single();
    if (error) return { ok: false, error: friendly(error) };

    await audit({
      actorId: session.userId,
      actorEmail: session.email,
      action: "activity_type.created",
      entity: "activity_type",
      entityId: data.id,
      after: row,
    });
  }

  revalidateActivity();
  return { ok: true };
}

/**
 * Retire an activity without erasing what it measured.
 *
 * There is no delete. Reports and targets point at these rows, and a
 * scoreboard whose history vanished would be worse than one showing a
 * measure nobody uses any more.
 */
export async function setActivityTypeActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const session = await requireOwner();

  const { error } = await salesDb().from("activity_types").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: isActive ? "activity_type.activated" : "activity_type.retired",
    entity: "activity_type",
    entityId: id,
    after: { is_active: isActive },
  });

  revalidateActivity();
  return { ok: true };
}

/* ---- Assignment -------------------------------------------- */

/**
 * Which activities a person is responsible for.
 *
 * This decides what their end-of-day form asks and which lead measures
 * they can see, so it belongs with the rest of "who is on the team" —
 * owner territory.
 */
export async function setUserActivities(
  userId: string,
  activityTypeIds: string[],
): Promise<ActionResult> {
  const session = await requireOwner();
  const db = salesDb();

  const { data: user } = await db.from("users").select("id, email").eq("id", userId).maybeSingle();
  if (!user) return { ok: false, error: "We couldn't find that person." };

  const { data: before } = await db
    .from("user_activities")
    .select("activity_type_id")
    .eq("user_id", userId);

  const wanted = [...new Set(activityTypeIds)];

  // Replace wholesale: the form always sends the complete list, so a
  // diff would only be a slower way to reach the same state.
  const { error: cleared } = await db.from("user_activities").delete().eq("user_id", userId);
  if (cleared) return { ok: false, error: friendly(cleared) };

  if (wanted.length > 0) {
    const { error } = await db.from("user_activities").insert(
      wanted.map((activity_type_id) => ({
        user_id: userId,
        activity_type_id,
        assigned_by: session.userId,
      })),
    );
    if (error) return { ok: false, error: friendly(error) };
  }

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "staff.activities_assigned",
    entity: "user",
    entityId: userId,
    before: { activity_type_ids: (before ?? []).map((r) => r.activity_type_id) },
    after: { activity_type_ids: wanted },
  });

  revalidatePath("/team");
  revalidateActivity();
  return { ok: true };
}

/* ---- Activity targets -------------------------------------- */

export type ActivityTargetInput = {
  activityTypeId: string;
  /** Zero or blank removes the lead measure from this target. */
  targetCount: number | null;
};

/**
 * Sets every lead measure on one revenue target in a single call.
 *
 * The editor sends the whole set each time, so this reconciles rather
 * than appending: anything at zero is removed, everything else is
 * inserted or updated.
 */
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
      .in(
        "activity_type_id",
        drop.map((r) => r.activityTypeId),
      );
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
  revalidatePath("/activity");
  revalidatePath("/activity");
}
