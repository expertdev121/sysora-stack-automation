"use server";

import { revalidatePath } from "next/cache";

import { requireFinance, requireOwner } from "./auth";
import { salesDb } from "@/lib/supabase/admin";
import { audit, friendly } from "./audit";
import { toMinorUnits } from "@/lib/money";
import type { ActionResult } from "./types";

/**
 * Every cost: the Connects that win work and the salaries that run it.
 *
 * Same conventions as the revenue side — guard, re-validate, audit,
 * revalidate — and the same two-currency rule. Salaries are paid in
 * rupees and have no dollar figure; Connects are billed in dollars and
 * carry the rupees your card was actually charged. Nothing is
 * converted between them.
 */

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z][a-z0-9_]*$/;

/* ---- Entries ------------------------------------------------ */

export type ExpenseInput = {
  id?: string;
  categoryId: string;
  description: string;
  /** Who was paid. Salaries are one line per person per month. */
  paidTo: string;
  /** Major units. Either may be blank, but not both. */
  amountUsd: number | null;
  amountInr: number | null;
  spentOn: string;
  /** Optional: the lead measure this money bought. */
  activityTypeId: string | null;
};

export async function saveExpense(input: ExpenseInput): Promise<ActionResult> {
  const session = await requireFinance();

  if (!input.categoryId) return { ok: false, error: "Pick what the money went on." };
  if (!DATE.test(input.spentOn)) return { ok: false, error: "Pick the date it was spent." };

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
    category_id: input.categoryId,
    description: input.description.trim() || null,
    paid_to: input.paidTo.trim() || null,
    amount_usd: usd === null ? null : toMinorUnits(usd),
    amount_inr: inr === null ? null : toMinorUnits(inr),
    spent_on: input.spentOn,
    activity_type_id: input.activityTypeId || null,
    created_by: session.userId,
  };

  if (input.id) {
    const { data: before } = await db
      .from("expenses")
      .select("category_id, description, paid_to, amount_usd, amount_inr, spent_on, activity_type_id")
      .eq("id", input.id)
      .maybeSingle();

    if (!before) return { ok: false, error: "We couldn't find that entry." };

    const { error } = await db.from("expenses").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendly(error) };

    await audit({
      actorId: session.userId,
      actorEmail: session.email,
      action: "expense.updated",
      entity: "expense",
      entityId: input.id,
      before,
      after: row,
    });
  } else {
    const { data, error } = await db.from("expenses").insert(row).select("id").single();
    if (error) return { ok: false, error: friendly(error) };

    await audit({
      actorId: session.userId,
      actorEmail: session.email,
      action: "expense.recorded",
      entity: "expense",
      entityId: data.id,
      after: row,
    });
  }

  revalidateSpend();
  return { ok: true };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const session = await requireFinance();
  const db = salesDb();

  const { data: before } = await db
    .from("expenses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!before) return { ok: false, error: "We couldn't find that entry." };

  const { error } = await db.from("expenses").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "expense.deleted",
    entity: "expense",
    entityId: id,
    before,
  });

  revalidateSpend();
  return { ok: true };
}

/* ---- Categories --------------------------------------------- */

export type SpendCategoryInput = {
  id?: string;
  slug: string;
  label: string;
  isAcquisition: boolean;
  sortOrder: number;
};

/** Owner only: what the business counts as a kind of spend is structural. */
export async function saveSpendCategory(input: SpendCategoryInput): Promise<ActionResult> {
  const session = await requireOwner();

  const slug = input.slug.trim().toLowerCase();
  const label = input.label.trim();

  if (!label) return { ok: false, error: "Give the category a name." };
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
    is_acquisition: input.isAcquisition,
    sort_order: Number.isFinite(input.sortOrder) ? Math.trunc(input.sortOrder) : 0,
  };

  if (input.id) {
    const { error } = await db.from("spend_categories").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendly(error) };
  } else {
    const { error } = await db.from("spend_categories").insert(row);
    if (error) return { ok: false, error: friendly(error) };
  }

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: input.id ? "spend_category.updated" : "spend_category.created",
    entity: "spend_category",
    entityId: input.id ?? slug,
    after: row,
  });

  revalidateSpend();
  return { ok: true };
}

/**
 * Retire a category without erasing what it paid for.
 *
 * No delete: entries point at these rows, and the foreign key is
 * `restrict` for exactly that reason.
 */
export async function setSpendCategoryActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const session = await requireOwner();

  const { error } = await salesDb()
    .from("spend_categories")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: isActive ? "spend_category.activated" : "spend_category.retired",
    entity: "spend_category",
    entityId: id,
    after: { is_active: isActive },
  });

  revalidateSpend();
  return { ok: true };
}

function revalidateSpend() {
  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/targets");
}
