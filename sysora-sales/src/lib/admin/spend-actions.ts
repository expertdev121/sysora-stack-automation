"use server";

import { revalidatePath } from "next/cache";

import { requireFinance, requireOwner } from "./auth";
import { salesDb } from "@/lib/supabase/admin";
import { audit, friendly } from "./audit";
import type { ActionResult } from "./types";

/**
 * What winning the work costs.
 *
 * Same conventions as the revenue side: guard first, re-validate on the
 * server whatever the form already checked, write an audit row, then
 * revalidate. Amounts are minor units and attribution is by date, so a
 * spend row lands in a target window by exactly the rule revenue does.
 */

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z][a-z0-9_]*$/;

function toMinorUnits(major: number): number {
  return Math.round(major * 100);
}

/* ---- Entries ------------------------------------------------ */

export type SpendInput = {
  id?: string;
  categoryId: string;
  description: string;
  /** Major units, as typed. */
  amount: number;
  spentOn: string;
  /** Optional: the lead measure this money bought. */
  activityTypeId: string | null;
};

export async function saveSpend(input: SpendInput): Promise<ActionResult> {
  const session = await requireFinance();

  if (!input.categoryId) return { ok: false, error: "Pick what the money went on." };
  if (!DATE.test(input.spentOn)) return { ok: false, error: "Pick the date it was spent." };
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "The amount must be more than zero." };
  }

  const db = salesDb();
  const row = {
    category_id: input.categoryId,
    description: input.description.trim() || null,
    amount: toMinorUnits(input.amount),
    spent_on: input.spentOn,
    activity_type_id: input.activityTypeId || null,
    created_by: session.userId,
  };

  if (input.id) {
    const { data: before } = await db
      .from("acquisition_spend")
      .select("category_id, description, amount, spent_on, activity_type_id")
      .eq("id", input.id)
      .maybeSingle();

    if (!before) return { ok: false, error: "We couldn't find that entry." };

    const { error } = await db.from("acquisition_spend").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendly(error) };

    await audit({
      actorId: session.userId,
      actorEmail: session.email,
      action: "spend.updated",
      entity: "acquisition_spend",
      entityId: input.id,
      before,
      after: row,
    });
  } else {
    const { data, error } = await db.from("acquisition_spend").insert(row).select("id").single();
    if (error) return { ok: false, error: friendly(error) };

    await audit({
      actorId: session.userId,
      actorEmail: session.email,
      action: "spend.recorded",
      entity: "acquisition_spend",
      entityId: data.id,
      after: row,
    });
  }

  revalidateSpend();
  return { ok: true };
}

export async function deleteSpend(id: string): Promise<ActionResult> {
  const session = await requireFinance();
  const db = salesDb();

  const { data: before } = await db
    .from("acquisition_spend")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!before) return { ok: false, error: "We couldn't find that entry." };

  const { error } = await db.from("acquisition_spend").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error) };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "spend.deleted",
    entity: "acquisition_spend",
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
  revalidatePath("/spend");
  revalidatePath("/targets");
}
