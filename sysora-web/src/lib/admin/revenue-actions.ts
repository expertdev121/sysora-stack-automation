"use server";

import { revalidatePath } from "next/cache";

import { canDeleteTarget, requireFinance } from "./auth";
import { salesDb } from "@/lib/supabase/admin";
import { audit, friendly } from "./audit";
import type { ActionResult } from "./actions";
import type { RevenueSource } from "./types";

/**
 * Targets and outside-source revenue.
 *
 * Kept apart from actions.ts because every function here is gated on
 * finance access, where that file is mostly pipeline work any admin can
 * do. Same conventions otherwise: guard first, validate on the server
 * whatever the form already checked, write an audit row, revalidate.
 */

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Dollars in the form, minor units in the database. */
function toMinorUnits(major: number): number {
  return Math.round(major * 100);
}

/* ---- Targets ----------------------------------------------- */

export type TargetInput = {
  id?: string;
  name: string;
  startsOn: string;
  endsOn: string;
  /** Major units, as typed. */
  revenueTarget: number;
  requestsTarget: number | null;
  notes: string;
};

export async function saveRevenueTarget(
  input: TargetInput,
): Promise<ActionResult & { id?: string }> {
  const session = await requireFinance();

  if (!DATE.test(input.startsOn) || !DATE.test(input.endsOn)) {
    return { ok: false, error: "Pick a start and an end date." };
  }
  if (input.endsOn < input.startsOn) {
    return { ok: false, error: "The end date must be on or after the start date." };
  }
  if (!Number.isFinite(input.revenueTarget) || input.revenueTarget <= 0) {
    return { ok: false, error: "The target must be more than zero." };
  }
  if (
    input.requestsTarget !== null &&
    (!Number.isInteger(input.requestsTarget) || input.requestsTarget < 0)
  ) {
    return { ok: false, error: "The requests target must be a whole number." };
  }

  const db = salesDb();
  let savedId = input.id;
  const row = {
    name: input.name.trim() || null,
    starts_on: input.startsOn,
    ends_on: input.endsOn,
    revenue_target: toMinorUnits(input.revenueTarget),
    requests_target: input.requestsTarget,
    notes: input.notes.trim() || null,
    created_by: session.userId,
  };

  if (input.id) {
    const { data: before } = await db
      .from("revenue_targets")
      .select("name, starts_on, ends_on, revenue_target, requests_target, notes")
      .eq("id", input.id)
      .maybeSingle();

    if (!before) return { ok: false, error: "We couldn't find that target." };

    const { error } = await db.from("revenue_targets").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendly(error) };

    await audit({
      actorId: session.userId,
      actorEmail: session.email,
      action: "target.updated",
      entity: "revenue_target",
      entityId: input.id,
      before,
      after: row,
    });
  } else {
    const { data, error } = await db.from("revenue_targets").insert(row).select("id").single();
    if (error) return { ok: false, error: friendly(error) };
    savedId = data.id;

    await audit({
      actorId: session.userId,
      actorEmail: session.email,
      action: "target.created",
      entity: "revenue_target",
      entityId: data.id,
      after: row,
    });
  }

  revalidatePath("/admin/targets");
  revalidatePath("/admin");
  revalidatePath("/admin/scoreboard");
  return { ok: true, id: savedId };
}

/** Owner only: deleting a target removes history everyone else relies on. */
export async function deleteRevenueTarget(id: string): Promise<ActionResult> {
  const session = await requireFinance();
  if (!canDeleteTarget(session.role)) {
    return { ok: false, error: "Only an owner can delete a target." };
  }

  const db = salesDb();
  const { data: before } = await db
    .from("revenue_targets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!before) return { ok: false, error: "We couldn't find that target." };

  const { error } = await db.from("revenue_targets").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error) };

  // The audit row keeps the whole target, so deleting isn't losing it.
  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "target.deleted",
    entity: "revenue_target",
    entityId: id,
    before,
  });

  revalidatePath("/admin/targets");
  revalidatePath("/admin");
  return { ok: true };
}

/* ---- Outside-source revenue -------------------------------- */

export type ManualRevenueInput = {
  id?: string;
  clientName: string;
  source: RevenueSource;
  description: string;
  /** Major units, as typed. */
  amount: number;
  earnedOn: string;
};

export async function saveManualRevenue(input: ManualRevenueInput): Promise<ActionResult> {
  const session = await requireFinance();

  if (!input.clientName.trim()) return { ok: false, error: "The client needs a name." };
  if (!DATE.test(input.earnedOn)) return { ok: false, error: "Pick the date this was earned." };
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "The amount must be more than zero." };
  }
  if (!["upwork", "off_source", "other"].includes(input.source)) {
    return { ok: false, error: "Pick a source." };
  }

  const db = salesDb();
  const row = {
    client_name: input.clientName.trim(),
    source: input.source,
    description: input.description.trim() || null,
    amount: toMinorUnits(input.amount),
    earned_on: input.earnedOn,
    created_by: session.userId,
  };

  if (input.id) {
    const { data: before } = await db
      .from("manual_revenue")
      .select("client_name, source, description, amount, earned_on")
      .eq("id", input.id)
      .maybeSingle();

    if (!before) return { ok: false, error: "We couldn't find that entry." };

    const { error } = await db.from("manual_revenue").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendly(error) };

    await audit({
      actorId: session.userId,
      actorEmail: session.email,
      action: "manual_revenue.updated",
      entity: "manual_revenue",
      entityId: input.id,
      before,
      after: row,
    });
  } else {
    const { data, error } = await db.from("manual_revenue").insert(row).select("id").single();
    if (error) return { ok: false, error: friendly(error) };

    await audit({
      actorId: session.userId,
      actorEmail: session.email,
      action: "manual_revenue.created",
      entity: "manual_revenue",
      entityId: data.id,
      after: row,
    });
  }

  revalidatePath("/admin/targets");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteManualRevenue(id: string): Promise<ActionResult> {
  const session = await requireFinance();
  const db = salesDb();

  const { data: before } = await db.from("manual_revenue").select("*").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "We couldn't find that entry." };

  const { error } = await db.from("manual_revenue").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "manual_revenue.deleted",
    entity: "manual_revenue",
    entityId: id,
    before,
  });

  revalidatePath("/admin/targets");
  revalidatePath("/admin");
  return { ok: true };
}

/**
 * Warns when a manually entered client already exists as a contact.
 *
 * Advisory only. Someone who paid through the checkout and is also
 * entered by hand would be counted twice, and no constraint can tell
 * the difference — so the interface asks rather than the schema refusing.
 */
export async function findMatchingContact(clientName: string): Promise<{ email: string } | null> {
  await requireFinance();
  const name = clientName.trim();
  if (name.length < 3) return null;

  const { data } = await salesDb()
    .from("customers")
    .select("email")
    .or(`full_name.ilike.%${name}%,company_name.ilike.%${name}%`)
    .limit(1)
    .maybeSingle();

  return data ?? null;
}
