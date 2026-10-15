"use server";

import { revalidatePath } from "next/cache";

import { requireClient } from "@/lib/portal/auth";
import { salesDb } from "@/lib/supabase/admin";

/**
 * What a client can do from the portal.
 *
 * Each action re-derives the customer from the session rather than
 * trusting anything the form sent, so a tampered payload cannot file a
 * ticket against somebody else's account.
 */

export type ActionResult = { ok: true; reference?: string } | { ok: false; error: string };

export async function submitTicket(form: FormData): Promise<ActionResult> {
  const { customerId, userId } = await requireClient();

  const subject = String(form.get("subject") ?? "").trim();
  const category = String(form.get("category") ?? "").trim() || null;
  const body = String(form.get("body") ?? "").trim();

  if (subject.length < 4) return { ok: false, error: "Give the ticket a subject." };
  if (body.length < 10) return { ok: false, error: "A sentence or two about the problem." };

  const db = salesDb();

  const { data: ticket, error } = await db
    .from("support_tickets")
    .insert({ customer_id: customerId, subject, category })
    .select("id, reference")
    .maybeSingle();

  if (error || !ticket) {
    console.error("[submitTicket]", error);
    return { ok: false, error: "Could not open the ticket. Please try again." };
  }

  // The first message is the body, so the thread reads in order.
  await db.from("ticket_messages").insert({
    ticket_id: ticket.id,
    author_kind: "client",
    author_user_id: userId,
    body,
  });

  revalidatePath("/portal/support");
  revalidatePath("/portal");
  return { ok: true, reference: ticket.reference };
}

export async function replyToTicket(form: FormData): Promise<ActionResult> {
  const { customerId, userId } = await requireClient();

  const ticketId = String(form.get("ticketId") ?? "");
  const body = String(form.get("body") ?? "").trim();
  if (!ticketId || body.length < 2) return { ok: false, error: "Write a reply first." };

  const db = salesDb();

  // Scoped by customer: a client cannot post into another client's thread
  // by changing the hidden id.
  const { data: ticket } = await db
    .from("support_tickets")
    .select("id")
    .eq("id", ticketId)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (!ticket) return { ok: false, error: "That ticket is not on your account." };

  await db.from("ticket_messages").insert({
    ticket_id: ticket.id,
    author_kind: "client",
    author_user_id: userId,
    body,
  });

  // A client reply reopens a ticket that was waiting on them.
  await db
    .from("support_tickets")
    .update({ status: "open", updated_at: new Date().toISOString() })
    .eq("id", ticket.id)
    .eq("status", "waiting_on_client");

  revalidatePath("/portal/support");
  return { ok: true };
}

export async function submitBuildRequest(form: FormData): Promise<ActionResult> {
  const { customerId } = await requireClient();

  const title = String(form.get("title") ?? "").trim();
  const detail = String(form.get("detail") ?? "").trim();
  const budget = String(form.get("budget") ?? "").trim() || null;
  const timing = String(form.get("timing") ?? "").trim() || null;

  if (title.length < 4) return { ok: false, error: "Give the project a name." };
  if (detail.length < 20) {
    return { ok: false, error: "A few sentences, so we can scope it properly." };
  }

  const db = salesDb();

  // Build requests are free to submit, so they are filed against the
  // build_request offer like the public estimate form does.
  const { data: offer } = await db
    .from("offers")
    .select("id, kind, price_amount, currency")
    .eq("slug", "build-request")
    .maybeSingle();

  if (!offer) {
    console.error("[submitBuildRequest] no build-request offer");
    return { ok: false, error: "Could not file the request. Please contact support." };
  }

  const { data: request, error } = await db
    .from("requests")
    .insert({
      customer_id: customerId,
      offer_id: offer.id,
      kind: offer.kind,
      status: "submitted",
      amount: offer.price_amount ?? 0,
      currency: offer.currency ?? "USD",
      title,
      summary: detail,
      build_stage: "new",
      budget_band: budget,
      metadata: { source: "portal", timing },
    })
    .select("reference")
    .maybeSingle();

  if (error || !request) {
    console.error("[submitBuildRequest]", error);
    return { ok: false, error: "Could not file the request. Please try again." };
  }

  revalidatePath("/portal/build-requests");
  revalidatePath("/portal");
  return { ok: true, reference: request.reference };
}
