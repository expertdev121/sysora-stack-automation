"use server";

import { revalidatePath } from "next/cache";

import { requireFinance } from "./auth";
import { audit, friendly } from "./audit";
import { salesDb } from "@/lib/supabase/admin";
import { toMinorUnits } from "@/lib/money";
import type { ActionResult, ProposalOutcome } from "./types";

/**
 * Connects bought, and the jobs they were spent on.
 *
 * No per-connect rate is ever written. It is derived from what was actually
 * paid, so a price change, a bulk purchase or a free grant all land correctly
 * without anybody editing a constant.
 */

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const OUTCOMES: ProposalOutcome[] = [
  "sent",
  "viewed",
  "replied",
  "interviewing",
  "hired",
  "declined",
  "expired",
];

/* ---- Connects bought ---------------------------------------- */

export type ConnectPurchaseInput = {
  id?: string;
  purchasedOn: string;
  connects: number;
  /** Major units, as typed. Ignored when isFree. */
  amountUsd: number | null;
  taxUsd: number | null;
  amountInr: number | null;
  isFree: boolean;
  note: string;
};

export async function saveConnectPurchase(input: ConnectPurchaseInput): Promise<ActionResult> {
  const session = await requireFinance();

  if (!DATE.test(input.purchasedOn)) return { ok: false, error: "Pick the date you bought them." };
  if (!Number.isInteger(input.connects) || input.connects <= 0) {
    return { ok: false, error: "How many connects? A whole number above zero." };
  }

  // A free grant costs nothing by definition; anything else has to have a
  // price, or the rate it feeds would be quietly wrong.
  if (!input.isFree && !input.amountInr && !input.amountUsd) {
    return { ok: false, error: "Put in what you paid — rupees, dollars, or both." };
  }

  const row = {
    purchased_on: input.purchasedOn,
    connects: input.connects,
    amount_usd: input.isFree || input.amountUsd === null ? null : toMinorUnits(input.amountUsd),
    tax_usd: input.isFree || input.taxUsd === null ? null : toMinorUnits(input.taxUsd),
    amount_inr: input.isFree || input.amountInr === null ? null : toMinorUnits(input.amountInr),
    is_free: input.isFree,
    note: input.note.trim() || null,
    created_by: session.userId,
  };

  const db = salesDb();

  if (input.id) {
    const { error } = await db.from("connect_purchases").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendly(error) };
    await audit({
      actorId: session.userId,
      actorEmail: session.email,
      action: "connects.updated",
      entity: "connect_purchase",
      entityId: input.id,
      after: row,
    });
  } else {
    const { data, error } = await db.from("connect_purchases").insert(row).select("id").single();
    if (error) return { ok: false, error: friendly(error) };
    await audit({
      actorId: session.userId,
      actorEmail: session.email,
      action: "connects.bought",
      entity: "connect_purchase",
      entityId: data.id,
      after: row,
    });
  }

  revalidateAcquisition();
  return { ok: true };
}

export async function deleteConnectPurchase(id: string): Promise<ActionResult> {
  const session = await requireFinance();
  const db = salesDb();

  const { data: before } = await db
    .from("connect_purchases")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!before) return { ok: false, error: "We couldn't find that purchase." };

  const { error } = await db.from("connect_purchases").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "connects.deleted",
    entity: "connect_purchase",
    entityId: id,
    before,
  });

  revalidateAcquisition();
  return { ok: true };
}

/* ---- Proposals ---------------------------------------------- */

export type ProposalInput = {
  id?: string;
  submittedOn: string;
  jobTitle: string;
  jobUrl: string;
  clientName: string;
  connectsSpent: number;
  connectsRefunded: number;
  outcome: ProposalOutcome;
  submittedBy: string | null;
  notes: string;
};

export async function saveProposal(input: ProposalInput): Promise<ActionResult> {
  const session = await requireFinance();

  if (!DATE.test(input.submittedOn)) return { ok: false, error: "Pick the date you bid." };
  if (!input.jobTitle.trim()) return { ok: false, error: "What was the job?" };
  if (!Number.isInteger(input.connectsSpent) || input.connectsSpent < 0) {
    return { ok: false, error: "Connects spent must be a whole number." };
  }
  if (!Number.isInteger(input.connectsRefunded) || input.connectsRefunded < 0) {
    return { ok: false, error: "Connects refunded must be a whole number." };
  }
  if (input.connectsRefunded > input.connectsSpent) {
    return { ok: false, error: "You can't get back more connects than you spent." };
  }
  if (!OUTCOMES.includes(input.outcome)) return { ok: false, error: "Unknown outcome." };

  const row = {
    submitted_on: input.submittedOn,
    job_title: input.jobTitle.trim(),
    job_url: input.jobUrl.trim() || null,
    client_name: input.clientName.trim() || null,
    connects_spent: input.connectsSpent,
    connects_refunded: input.connectsRefunded,
    outcome: input.outcome,
    // Only a settled outcome gets a date; "sent" is still in flight.
    outcome_on:
      input.outcome === "sent" ? null : new Date().toISOString().slice(0, 10),
    submitted_by: input.submittedBy,
    notes: input.notes.trim() || null,
    created_by: session.userId,
  };

  const db = salesDb();

  if (input.id) {
    const { error } = await db.from("proposals").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendly(error) };
    await audit({
      actorId: session.userId,
      actorEmail: session.email,
      action: "proposal.updated",
      entity: "proposal",
      entityId: input.id,
      after: row,
    });
  } else {
    const { data, error } = await db.from("proposals").insert(row).select("id").single();
    if (error) return { ok: false, error: friendly(error) };
    await audit({
      actorId: session.userId,
      actorEmail: session.email,
      action: "proposal.created",
      entity: "proposal",
      entityId: data.id,
      after: row,
    });
  }

  revalidateAcquisition();
  return { ok: true };
}

/** Just the outcome — the common edit, made one click instead of a form. */
export async function setProposalOutcome(
  id: string,
  outcome: ProposalOutcome,
): Promise<ActionResult> {
  const session = await requireFinance();
  if (!OUTCOMES.includes(outcome)) return { ok: false, error: "Unknown outcome." };

  const { error } = await salesDb()
    .from("proposals")
    .update({
      outcome,
      outcome_on: outcome === "sent" ? null : new Date().toISOString().slice(0, 10),
    })
    .eq("id", id);

  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "proposal.outcome",
    entity: "proposal",
    entityId: id,
    after: { outcome },
  });

  revalidateAcquisition();
  return { ok: true };
}

export async function deleteProposal(id: string): Promise<ActionResult> {
  const session = await requireFinance();
  const db = salesDb();

  const { data: before } = await db.from("proposals").select("*").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "We couldn't find that proposal." };

  const { error } = await db.from("proposals").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "proposal.deleted",
    entity: "proposal",
    entityId: id,
    before,
  });

  revalidateAcquisition();
  return { ok: true };
}

/* ---- The budget --------------------------------------------- */

/**
 * Rupees, always — even on a target whose revenue goal is in dollars. Spend
 * leaves the account in rupees, so the budget governing it is in rupees.
 */
export async function setAcquisitionBudget(
  targetId: string,
  budgetRupees: number | null,
): Promise<ActionResult> {
  const session = await requireFinance();

  if (budgetRupees !== null && (!Number.isFinite(budgetRupees) || budgetRupees < 0)) {
    return { ok: false, error: "A budget can't be negative." };
  }

  const { error } = await salesDb()
    .from("revenue_targets")
    .update({ acquisition_budget: budgetRupees === null ? null : toMinorUnits(budgetRupees) })
    .eq("id", targetId);

  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "target.budget_set",
    entity: "revenue_target",
    entityId: targetId,
    after: { acquisition_budget: budgetRupees },
  });

  revalidateAcquisition();
  return { ok: true };
}

function revalidateAcquisition() {
  revalidatePath("/");
  revalidatePath("/acquisition");
  revalidatePath("/expenses");
  revalidatePath("/targets");
}
