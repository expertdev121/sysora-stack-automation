"use server";

import { revalidatePath } from "next/cache";

import { requireFinance } from "./auth";
import { audit, friendly } from "./audit";
import { salesDb } from "@/lib/supabase/admin";
import { toMinorUnits } from "@/lib/money";
import type { ActionResult, BillingCadence } from "./types";

/**
 * Recurring costs — the things that bill you again next month.
 *
 * Ending one is not deleting it. A tool cancelled in August still cost money
 * in June and July, and a ledger that forgets that cannot be reconciled
 * against a bank statement. So `ended_on` stops future months and leaves the
 * past alone; delete exists only for something entered by mistake.
 */

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const CADENCES: BillingCadence[] = ["monthly", "quarterly", "yearly"];

export type RecurringCostInput = {
  id?: string;
  name: string;
  vendor: string;
  categoryId: string | null;
  cadence: BillingCadence;
  /** Major units, as typed. At least one of the two is required. */
  amountInr: number | null;
  amountUsd: number | null;
  billingDay: number;
  startedOn: string;
  notes: string;
};

export async function saveRecurringCost(input: RecurringCostInput): Promise<ActionResult> {
  const session = await requireFinance();

  if (!input.name.trim()) return { ok: false, error: "Give it a name." };
  if (!CADENCES.includes(input.cadence)) return { ok: false, error: "Pick how often it bills." };
  if (!DATE.test(input.startedOn)) return { ok: false, error: "Pick the date it started." };

  if (!Number.isInteger(input.billingDay) || input.billingDay < 1 || input.billingDay > 28) {
    // Capped at 28 so the charge exists in February too — a "31st" plan would
    // silently skip three months a year.
    return { ok: false, error: "Billing day has to be between 1 and 28." };
  }

  const inr = input.amountInr;
  const usd = input.amountUsd;

  if (!inr && !usd) return { ok: false, error: "Put in what it costs — rupees, dollars, or both." };
  if (inr !== null && (!Number.isFinite(inr) || inr < 0)) {
    return { ok: false, error: "The rupee amount can't be negative." };
  }
  if (usd !== null && (!Number.isFinite(usd) || usd < 0)) {
    return { ok: false, error: "The dollar amount can't be negative." };
  }

  const row = {
    name: input.name.trim(),
    vendor: input.vendor.trim() || null,
    category_id: input.categoryId,
    cadence: input.cadence,
    amount_inr: inr === null ? null : toMinorUnits(inr),
    amount_usd: usd === null ? null : toMinorUnits(usd),
    billing_day: input.billingDay,
    started_on: input.startedOn,
    notes: input.notes.trim() || null,
    created_by: session.userId,
  };

  const db = salesDb();

  if (input.id) {
    const { error } = await db.from("recurring_costs").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendly(error) };
    await audit({
      actorId: session.userId,
      actorEmail: session.email,
      action: "recurring_cost.updated",
      entity: "recurring_cost",
      entityId: input.id,
      after: row,
    });
  } else {
    const { data, error } = await db.from("recurring_costs").insert(row).select("id").single();
    if (error) return { ok: false, error: friendly(error) };
    await audit({
      actorId: session.userId,
      actorEmail: session.email,
      action: "recurring_cost.added",
      entity: "recurring_cost",
      entityId: data.id,
      after: row,
    });
  }

  revalidateCosts();
  return { ok: true };
}

/**
 * Stop it billing from a date, without erasing the months it did bill.
 * Passing null restarts something ended by mistake.
 */
export async function endRecurringCost(id: string, endedOn: string | null): Promise<ActionResult> {
  const session = await requireFinance();
  if (endedOn !== null && !DATE.test(endedOn)) {
    return { ok: false, error: "Pick the date it stops." };
  }

  const { error } = await salesDb()
    .from("recurring_costs")
    .update({ ended_on: endedOn })
    .eq("id", id);

  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: endedOn ? "recurring_cost.ended" : "recurring_cost.restarted",
    entity: "recurring_cost",
    entityId: id,
    after: { ended_on: endedOn },
  });

  revalidateCosts();
  return { ok: true };
}

/** For something entered by mistake. To stop a real one, end it instead. */
export async function deleteRecurringCost(id: string): Promise<ActionResult> {
  const session = await requireFinance();
  const db = salesDb();

  const { data: before } = await db.from("recurring_costs").select("*").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "We couldn't find that." };

  const { count } = await db
    .from("expenses")
    .select("id", { count: "exact", head: true })
    .eq("recurring_cost_id", id);

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      error: `${count} recorded ${count === 1 ? "payment refers" : "payments refer"} to this. End it instead — deleting would orphan them.`,
    };
  }

  const { error } = await db.from("recurring_costs").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "recurring_cost.deleted",
    entity: "recurring_cost",
    entityId: id,
    before,
  });

  revalidateCosts();
  return { ok: true };
}

/**
 * Record that a due charge actually happened.
 *
 * Writes an ordinary expense row pointing back at the commitment, so the month
 * can tell what has been paid from what is merely owed. The amount is
 * editable because the charge and the commitment disagree more often than
 * anyone expects — a price rise, a proration, a different exchange rate.
 */
export async function recordCostPayment(input: {
  recurringCostId: string;
  spentOn: string;
  amountInr: number | null;
  amountUsd: number | null;
  categoryId: string | null;
  description: string;
}): Promise<ActionResult> {
  const session = await requireFinance();

  if (!DATE.test(input.spentOn)) return { ok: false, error: "Pick the date it was charged." };
  if (!input.amountInr && !input.amountUsd) {
    return { ok: false, error: "Put in what was actually charged." };
  }

  const db = salesDb();

  const { data: cost } = await db
    .from("recurring_costs")
    .select("name, category_id")
    .eq("id", input.recurringCostId)
    .maybeSingle<{ name: string; category_id: string | null }>();

  if (!cost) return { ok: false, error: "We couldn't find that commitment." };

  const { error } = await db.from("expenses").insert({
    category_id: input.categoryId ?? cost.category_id,
    recurring_cost_id: input.recurringCostId,
    description: input.description.trim() || cost.name,
    amount_inr: input.amountInr === null ? null : toMinorUnits(input.amountInr),
    amount_usd: input.amountUsd === null ? null : toMinorUnits(input.amountUsd),
    spent_on: input.spentOn,
    created_by: session.userId,
  });

  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "recurring_cost.paid",
    entity: "recurring_cost",
    entityId: input.recurringCostId,
    after: { spent_on: input.spentOn, amount_inr: input.amountInr },
  });

  revalidateCosts();
  return { ok: true };
}

function revalidateCosts() {
  revalidatePath("/");
  revalidatePath("/costs");
  revalidatePath("/expenses");
  revalidatePath("/targets");
}
