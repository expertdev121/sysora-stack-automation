"use server";

import { revalidatePath } from "next/cache";

import { requireOwner, requireStaff } from "./auth";
import { salesDb } from "@/lib/supabase/admin";
import { createPasswordToken } from "@/lib/auth/session";
import { siteUrl } from "@/lib/site-url";
import type { RequestStatus } from "@/lib/sales/types";
import type { StaffRole } from "./types";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Records who changed what.
 *
 * Uses the service role because staff may read the audit log but must not
 * be able to write or doctor it — the only way a row appears is through
 * this function.
 */
async function audit(input: {
  actorId: string;
  actorEmail: string;
  action: string;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}) {
  try {
    await salesDb().from("audit_log").insert({
      actor_id: input.actorId,
      actor_email: input.actorEmail,
      action: input.action,
      entity: input.entity,
      entity_id: input.entityId,
      before: input.before ?? null,
      after: input.after ?? null,
    });
  } catch (error) {
    console.error("[audit] could not record", input.action, error);
  }
}

/* ---- Requests ---------------------------------------------- */

export async function updateRequestStatus(
  reference: string,
  status: RequestStatus,
): Promise<ActionResult> {
  const session = await requireStaff();
  const db = salesDb();

  const { data: before } = await db
    .from("requests")
    .select("id, status")
    .eq("reference", reference)
    .maybeSingle();

  if (!before) return { ok: false, error: "We couldn't find that request." };

  // paid_at is a data point, not a label — moving the status shouldn't
  // invent or erase a payment time.
  const patch: Record<string, unknown> = { status };
  if (status === "completed") patch.completed_at = new Date().toISOString();

  const { error } = await db.from("requests").update(patch).eq("id", before.id);
  if (error) return { ok: false, error: error.message };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "request.status_changed",
    entity: "request",
    entityId: reference,
    before: { status: before.status },
    after: { status },
  });

  revalidatePath(`/admin/requests/${reference}`);
  revalidatePath("/admin/requests");
  return { ok: true };
}

export async function assignRequest(
  reference: string,
  userId: string | null,
): Promise<ActionResult> {
  const session = await requireStaff();
  const db = salesDb();

  const { data: before } = await db
    .from("requests")
    .select("id, assigned_to")
    .eq("reference", reference)
    .maybeSingle();

  if (!before) return { ok: false, error: "We couldn't find that request." };

  const { error } = await db
    .from("requests")
    .update({ assigned_to: userId })
    .eq("id", before.id);

  if (error) return { ok: false, error: error.message };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: userId ? "request.assigned" : "request.unassigned",
    entity: "request",
    entityId: reference,
    before: { assigned_to: before.assigned_to },
    after: { assigned_to: userId },
  });

  revalidatePath(`/admin/requests/${reference}`);
  revalidatePath("/admin/requests");
  return { ok: true };
}

export async function saveRequestNotes(
  reference: string,
  notes: string,
): Promise<ActionResult> {
  const session = await requireStaff();
  const db = salesDb();

  const { error } = await db
    .from("requests")
    .update({ internal_notes: notes })
    .eq("reference", reference);

  if (error) return { ok: false, error: error.message };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "request.notes_saved",
    entity: "request",
    entityId: reference,
  });

  revalidatePath(`/admin/requests/${reference}`);
  return { ok: true };
}

/* ---- Settings ---------------------------------------------- */

export async function saveSetting(key: string, value: string): Promise<ActionResult> {
  const session = await requireStaff();
  const db = salesDb();

  const { data: before } = await db
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  // Settings are jsonb. Text fields are stored as JSON strings; anything
  // that parses as JSON (a list of emails, say) is stored as that value.
  let parsed: unknown = value;
  try {
    const candidate = JSON.parse(value);
    if (typeof candidate === "object" && candidate !== null) parsed = candidate;
  } catch {
    // Plain string — leave it as is.
  }

  const { error } = await db
    .from("settings")
    .update({ value: parsed, updated_by: session.userId })
    .eq("key", key);

  if (error) return { ok: false, error: error.message };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "setting.updated",
    entity: "setting",
    entityId: key,
    before: before?.value,
    after: parsed,
  });

  revalidatePath("/admin/settings");
  return { ok: true };
}

/* ---- Plans ------------------------------------------------- */

export async function saveOffer(
  slug: string,
  patch: { name?: string; tagline?: string; price_amount?: number; price_note?: string; is_active?: boolean },
): Promise<ActionResult> {
  const session = await requireOwner();
  const db = salesDb();

  const { data: before } = await db
    .from("offers")
    .select("name, tagline, price_amount, price_note, is_active")
    .eq("slug", slug)
    .maybeSingle();

  if (!before) return { ok: false, error: "We couldn't find that plan." };
  if (patch.price_amount !== undefined && (!Number.isInteger(patch.price_amount) || patch.price_amount < 0)) {
    return { ok: false, error: "Price must be a whole number of cents, zero or more." };
  }

  const { error } = await db.from("offers").update(patch).eq("slug", slug);
  if (error) return { ok: false, error: error.message };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "offer.updated",
    entity: "offer",
    entityId: slug,
    before,
    after: patch,
  });

  revalidatePath("/admin/plans");
  return { ok: true };
}

/* ---- Questions --------------------------------------------- */

export async function saveQuestion(
  id: string,
  patch: {
    label?: string;
    help_text?: string | null;
    placeholder?: string | null;
    is_required?: boolean;
    sort_order?: number;
    is_active?: boolean;
  },
): Promise<ActionResult> {
  const session = await requireStaff();
  const db = salesDb();

  const { data: before } = await db
    .from("survey_questions")
    .select("survey_id, question_key, label, help_text, placeholder, is_required, sort_order, is_active")
    .eq("id", id)
    .maybeSingle();

  if (!before) return { ok: false, error: "We couldn't find that question." };
  if (patch.label !== undefined && !patch.label.trim()) {
    return { ok: false, error: "A question needs a label." };
  }

  const { error } = await db.from("survey_questions").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "question.updated",
    entity: "survey_question",
    entityId: before.question_key,
    before,
    after: patch,
  });

  revalidatePath("/admin/surveys");
  return { ok: true };
}

/* ---- Team (super admin only) ------------------------------- */

export async function setStaffActive(userId: string, isActive: boolean): Promise<ActionResult> {
  const session = await requireOwner();

  if (userId === session.userId && !isActive) {
    return { ok: false, error: "You can't deactivate your own account." };
  }

  const db = salesDb();
  const { error } = await db.from("users").update({ is_active: isActive }).eq("id", userId);
  if (error) return { ok: false, error: error.message };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: isActive ? "staff.activated" : "staff.deactivated",
    entity: "staff",
    entityId: userId,
  });

  revalidatePath("/admin/staff");
  return { ok: true };
}

export async function setStaffRole(
  userId: string,
  role: StaffRole,
): Promise<ActionResult> {
  const session = await requireOwner();

  if (userId === session.userId && role !== "owner") {
    return { ok: false, error: "You can't step yourself down from owner." };
  }

  const db = salesDb();
  const { error } = await db.from("users").update({ role }).eq("id", userId);
  if (error) return { ok: false, error: error.message };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "staff.role_changed",
    entity: "staff",
    entityId: userId,
    after: { role },
  });

  revalidatePath("/admin/staff");
  return { ok: true };
}

/**
 * Adds a teammate and returns a one-time link for them to set a password.
 *
 * We never set a password on someone else's behalf: the link is the only
 * way in, it expires, and using it burns it.
 */
export async function inviteStaff(
  email: string,
  role: StaffRole,
  fullName: string,
): Promise<ActionResult & { link?: string }> {
  const session = await requireOwner();
  const address = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(address)) {
    return { ok: false, error: "That doesn't look like an email address." };
  }

  const db = salesDb();

  const { data: existing } = await db
    .from("users")
    .select("id")
    .eq("email_normalized", address)
    .maybeSingle();

  let userId = existing?.id as string | undefined;

  if (!userId) {
    const { data: created, error } = await db
      .from("users")
      .insert({ email: address, full_name: fullName.trim() || null, role, is_active: true })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };
    userId = created.id;
  } else {
    await db
      .from("users")
      .update({ role, is_active: true, full_name: fullName.trim() || null })
      .eq("id", userId);
  }

  if (!userId) return { ok: false, error: "Could not create that account." };

  const token = await createPasswordToken(userId, "invite", 72);

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: existing ? "staff.updated" : "staff.invited",
    entity: "user",
    entityId: userId,
    after: { email: address, role },
  });

  revalidatePath("/admin/staff");
  return { ok: true, link: `${siteUrl()}/admin/set-password?token=${token}` };
}

/** A fresh set-password link for someone who lost theirs. */
export async function resetStaffPassword(userId: string): Promise<ActionResult & { link?: string }> {
  const session = await requireOwner();

  const { data: user } = await salesDb()
    .from("users")
    .select("id, email")
    .eq("id", userId)
    .maybeSingle();

  if (!user) return { ok: false, error: "We couldn't find that account." };

  const token = await createPasswordToken(user.id, "reset", 24);

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "staff.reset_link_created",
    entity: "user",
    entityId: user.id,
  });

  return { ok: true, link: `${siteUrl()}/admin/set-password?token=${token}` };
}
