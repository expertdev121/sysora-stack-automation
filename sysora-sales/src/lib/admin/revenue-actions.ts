"use server";

import { revalidatePath } from "next/cache";

import { canDeleteTarget, requireFinance, requireOwner } from "./auth";
import { salesDb } from "@/lib/supabase/admin";
import { audit, friendly } from "./audit";
import { toMinorUnits, type Currency } from "@/lib/money";
import type { ActionResult, RevenueSource, TargetLevel } from "./types";

/**
 * Targets and revenue earned outside the checkout.
 *
 * Guard first, re-validate on the server whatever the form already
 * checked, write an audit row, revalidate. Amounts arrive as major
 * units — rupees or dollars as typed — and are stored as integer minor
 * units, because a figure that has been through a float can't be
 * reconciled against a bank statement.
 */

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/* ---- Targets ----------------------------------------------- */

export type TargetInput = {
  id?: string;
  name: string;
  level: TargetLevel;
  currency: Currency;
  startsOn: string;
  endsOn: string;
  /** Major units, as typed. */
  revenueTarget: number;
  requestsTarget: number | null;
  notes: string;
  isLocked: boolean;
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
  if (input.currency !== "INR" && input.currency !== "USD") {
    return { ok: false, error: "A target is set in rupees or dollars." };
  }

  const db = salesDb();
  let savedId = input.id;

  const row = {
    name: input.name.trim() || null,
    level: input.level,
    currency: input.currency,
    starts_on: input.startsOn,
    ends_on: input.endsOn,
    revenue_target: toMinorUnits(input.revenueTarget),
    requests_target: input.requestsTarget,
    notes: input.notes.trim() || null,
    is_locked: input.isLocked,
    created_by: session.userId,
  };

  if (input.id) {
    const { data: before } = await db
      .from("revenue_targets")
      .select("name, level, currency, starts_on, ends_on, revenue_target, requests_target, notes, is_locked")
      .eq("id", input.id)
      .maybeSingle();

    if (!before) return { ok: false, error: "We couldn't find that target." };

    // A locked target is the whole point of locking: the numbers people
    // plan against must not move under them. Everything else on the row
    // — the note, the requests goal — stays editable.
    if (before.is_locked) {
      const movingTheGoalposts =
        row.revenue_target !== before.revenue_target ||
        row.starts_on !== before.starts_on ||
        row.ends_on !== before.ends_on ||
        row.currency !== before.currency;

      if (movingTheGoalposts) {
        return {
          ok: false,
          error: "This target is locked. Unlock it first — that's an owner's decision and it's recorded.",
        };
      }
    }

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

  revalidateMoney();
  return { ok: true, id: savedId };
}

/** Owner only, and loudly recorded: this is how a "fixed" number moves. */
export async function setTargetLocked(id: string, isLocked: boolean): Promise<ActionResult> {
  const session = await requireOwner();

  const { error } = await salesDb()
    .from("revenue_targets")
    .update({ is_locked: isLocked })
    .eq("id", id);

  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: isLocked ? "target.locked" : "target.unlocked",
    entity: "revenue_target",
    entityId: id,
    after: { is_locked: isLocked },
  });

  revalidateMoney();
  return { ok: true };
}

/** Owner only: deleting a target removes history everyone else relies on. */
export async function deleteRevenueTarget(id: string): Promise<ActionResult> {
  const session = await requireFinance();
  if (!canDeleteTarget(session.role)) {
    return { ok: false, error: "Only an owner can delete a target." };
  }

  const db = salesDb();
  const { data: before } = await db.from("revenue_targets").select("*").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "We couldn't find that target." };

  if (before.is_locked) {
    return { ok: false, error: "This target is locked. Unlock it before deleting it." };
  }

  const { error } = await db.from("revenue_targets").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "target.deleted",
    entity: "revenue_target",
    entityId: id,
    before,
  });

  revalidateMoney();
  return { ok: true };
}

/* ---- Revenue from outside the checkout ---------------------- */

export type ManualRevenueInput = {
  id?: string;
  clientName: string;
  source: RevenueSource;
  description: string;
  /** Major units. Either may be blank, but not both. */
  amountUsd: number | null;
  amountInr: number | null;
  earnedOn: string;
};

export async function saveManualRevenue(input: ManualRevenueInput): Promise<ActionResult> {
  const session = await requireFinance();

  if (!input.clientName.trim()) return { ok: false, error: "The client needs a name." };
  if (!DATE.test(input.earnedOn)) return { ok: false, error: "Pick the date this was earned." };
  if (!["upwork", "off_source", "other"].includes(input.source)) {
    return { ok: false, error: "Pick a source." };
  }

  const usd = input.amountUsd ?? null;
  const inr = input.amountInr ?? null;

  if (usd === null && inr === null) {
    return { ok: false, error: "Put in the rupees, the dollars, or both." };
  }
  if (usd !== null && (!Number.isFinite(usd) || usd <= 0)) {
    return { ok: false, error: "The dollar amount must be more than zero." };
  }
  if (inr !== null && (!Number.isFinite(inr) || inr <= 0)) {
    return { ok: false, error: "The rupee amount must be more than zero." };
  }

  const db = salesDb();
  const row = {
    client_name: input.clientName.trim(),
    source: input.source,
    description: input.description.trim() || null,
    amount_usd: usd === null ? null : toMinorUnits(usd),
    amount_inr: inr === null ? null : toMinorUnits(inr),
    earned_on: input.earnedOn,
    created_by: session.userId,
  };

  if (input.id) {
    const { data: before } = await db
      .from("manual_revenue")
      .select("client_name, source, description, amount_usd, amount_inr, earned_on")
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

  revalidateMoney();
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

  revalidateMoney();
  return { ok: true };
}

/**
 * The rupees a Stripe payment actually settled to.
 *
 * Unknown at the moment of payment — the payout lands days later at a
 * rate nobody has yet — so it is entered when it does rather than
 * estimated now.
 */
export async function settlePayment(
  paymentId: string,
  amountInr: number,
  settledOn: string,
): Promise<ActionResult> {
  const session = await requireFinance();

  if (!DATE.test(settledOn)) return { ok: false, error: "Pick the date it landed." };
  if (!Number.isFinite(amountInr) || amountInr <= 0) {
    return { ok: false, error: "The rupee amount must be more than zero." };
  }

  const db = salesDb();
  const { data: before } = await db
    .from("payments")
    .select("id, amount, amount_inr, settled_on")
    .eq("id", paymentId)
    .maybeSingle();

  if (!before) return { ok: false, error: "We couldn't find that payment." };

  const { error } = await db
    .from("payments")
    .update({ amount_inr: toMinorUnits(amountInr), settled_on: settledOn })
    .eq("id", paymentId);

  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "payment.settled",
    entity: "payment",
    entityId: paymentId,
    before,
    after: { amount_inr: toMinorUnits(amountInr), settled_on: settledOn },
  });

  revalidateMoney();
  return { ok: true };
}

/**
 * Warns when a manually entered client already exists as a contact.
 *
 * Advisory only. Someone who paid through the checkout and is also
 * entered by hand would be counted twice, and no constraint can tell
 * the difference — so the interface asks rather than the schema
 * refusing.
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

function revalidateMoney() {
  revalidatePath("/");
  revalidatePath("/revenue");
  revalidatePath("/targets");
  revalidatePath("/expenses");
}
