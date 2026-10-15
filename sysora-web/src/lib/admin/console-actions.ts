"use server";

import { revalidatePath } from "next/cache";

import { requirePipeline } from "@/lib/admin/auth";
import { salesDb } from "@/lib/supabase/admin";

/**
 * The console's write side.
 *
 * Logging time is the one that matters: it is how an hour leaves a
 * client's balance, and it is the entry the client sees in their ledger
 * the moment it lands. Everything is written against the ledger rather
 * than against a stored balance, so the two can never disagree.
 */

export type Result = { ok: true; message: string } | { ok: false; error: string };

export async function logTime(form: FormData): Promise<Result> {
  const session = await requirePipeline();

  const customerId = String(form.get("customerId") ?? "");
  const description = String(form.get("description") ?? "").trim();
  const kind = String(form.get("kind") ?? "build");
  const hours = Number(form.get("hours"));
  const billable = form.get("billable") !== "off";
  const entryDate = String(form.get("entryDate") ?? "") || undefined;

  if (!customerId) return { ok: false, error: "Pick a client." };
  if (!description) return { ok: false, error: "Say what the time was spent on." };
  if (!Number.isFinite(hours) || hours <= 0) return { ok: false, error: "Hours must be above zero." };
  if (hours > 24) return { ok: false, error: "That is more than a day in one entry." };

  const { error } = await salesDb().from("time_entries").insert({
    customer_id: customerId,
    description,
    kind,
    hours,
    billable,
    entry_date: entryDate,
    logged_by: session.userId,
  });

  if (error) {
    console.error("[logTime]", error);
    return { ok: false, error: "Could not log the time." };
  }

  revalidatePath("/admin/clients");
  revalidatePath("/admin");
  return { ok: true, message: `${hours}h logged${billable ? " and deducted" : " (not billed)"}` };
}

/** A manual grant: a goodwill top-up, or hours sold outside the checkout. */
export async function grantHours(form: FormData): Promise<Result> {
  const session = await requirePipeline();

  const customerId = String(form.get("customerId") ?? "");
  const hours = Number(form.get("hours"));
  const note = String(form.get("note") ?? "").trim() || null;
  const source = String(form.get("source") ?? "manual");

  if (!customerId) return { ok: false, error: "Pick a client." };
  if (!Number.isFinite(hours) || hours <= 0) return { ok: false, error: "Hours must be above zero." };

  const { error } = await salesDb().from("hour_entitlements").insert({
    customer_id: customerId,
    hours,
    source: source === "goodwill" ? "goodwill" : "manual",
    note,
    created_by: session.userId,
  });

  if (error) {
    console.error("[grantHours]", error);
    return { ok: false, error: "Could not add the hours." };
  }

  revalidatePath("/admin/clients");
  return { ok: true, message: `${hours}h added` };
}

export async function setTicketStatus(form: FormData): Promise<Result> {
  await requirePipeline();

  const id = String(form.get("ticketId") ?? "");
  const status = String(form.get("status") ?? "");
  const allowed = ["open", "in_progress", "waiting_on_client", "resolved"];
  if (!id || !allowed.includes(status)) return { ok: false, error: "Unknown status." };

  const { error } = await salesDb()
    .from("support_tickets")
    .update({
      status,
      updated_at: new Date().toISOString(),
      resolved_at: status === "resolved" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) return { ok: false, error: "Could not update the ticket." };

  revalidatePath("/admin/tickets");
  revalidatePath("/admin");
  return { ok: true, message: `Ticket set to ${status.replace(/_/g, " ")}` };
}

export async function replyToTicket(form: FormData): Promise<Result> {
  const session = await requirePipeline();

  const ticketId = String(form.get("ticketId") ?? "");
  const body = String(form.get("body") ?? "").trim();
  if (!ticketId || body.length < 2) return { ok: false, error: "Write a reply first." };

  const db = salesDb();
  await db.from("ticket_messages").insert({
    ticket_id: ticketId,
    author_kind: "staff",
    author_user_id: session.userId,
    body,
  });

  // Replying hands the ball back to the client.
  await db
    .from("support_tickets")
    .update({ status: "waiting_on_client", updated_at: new Date().toISOString() })
    .eq("id", ticketId)
    .in("status", ["open", "in_progress"]);

  revalidatePath("/admin/tickets");
  return { ok: true, message: "Reply sent" };
}

export async function setBuildStage(form: FormData): Promise<Result> {
  await requirePipeline();

  const id = String(form.get("requestId") ?? "");
  const stage = String(form.get("stage") ?? "");
  const allowed = ["new", "scoping", "proposal_sent", "approved"];
  if (!id || !allowed.includes(stage)) return { ok: false, error: "Unknown stage." };

  const { error } = await salesDb()
    .from("requests")
    .update({ build_stage: stage })
    .eq("id", id)
    .eq("kind", "build_request");

  if (error) return { ok: false, error: "Could not move the request." };

  revalidatePath("/admin/builds");
  revalidatePath("/admin");
  return { ok: true, message: `Moved to ${stage.replace(/_/g, " ")}` };
}
