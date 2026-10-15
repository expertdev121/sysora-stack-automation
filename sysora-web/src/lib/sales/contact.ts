"use server";

import { salesDb } from "@/lib/supabase/admin";
import { track, type TrackingContext } from "./actions";

/**
 * Contact form submissions.
 *
 * Two writes: the message itself, and a customer row upserted by email
 * so the person shows up in /admin/contacts whether they write in first
 * or buy hours first. The message is the one that matters — if the
 * customer upsert fails we still keep the message, because losing
 * somebody's enquiry to a bookkeeping error is the worst outcome here.
 */

export type ContactInput = {
  fullName: string;
  email: string;
  company: string;
  topic: string;
  message: string;
  context?: TrackingContext;
};

export type ContactResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContact(input: ContactInput): Promise<ContactResult> {
  const fieldErrors: Record<string, string> = {};

  const fullName = input.fullName.trim();
  const email = input.email.trim();
  const company = input.company.trim();
  const message = input.message.trim();

  if (!fullName) fieldErrors.fullName = "Tell us who you are.";
  if (!email) fieldErrors.email = "We need an email address to reach you.";
  else if (!EMAIL.test(email)) fieldErrors.email = "That email address doesn't look right.";
  if (message.length < 10) {
    fieldErrors.message = "A sentence or two, so the reply is useful.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Some answers need another look.", fieldErrors };
  }

  const context = input.context ?? {};

  try {
    const db = salesDb();

    // Link to an existing customer where there is one, so a contact who
    // already bought hours does not become a second row.
    let customerId: string | null = null;
    const { data: existing } = await db
      .from("customers")
      .select("id")
      .eq("email_normalized", email.toLowerCase())
      .maybeSingle();

    if (existing) {
      customerId = existing.id;
    } else {
      const { data: created } = await db
        .from("customers")
        .insert({
          email,
          full_name: fullName,
          company_name: company || null,
          utm_source: context.utm_source ?? null,
          utm_medium: context.utm_medium ?? null,
          utm_campaign: context.utm_campaign ?? null,
          referrer: context.referrer ?? null,
          landing_path: context.path ?? null,
        })
        .select("id")
        .maybeSingle();

      customerId = created?.id ?? null;
    }

    const { error } = await db.from("contact_messages").insert({
      customer_id: customerId,
      full_name: fullName,
      email,
      company: company || null,
      topic: input.topic,
      message,
      utm_source: context.utm_source ?? null,
      utm_medium: context.utm_medium ?? null,
      utm_campaign: context.utm_campaign ?? null,
      referrer: context.referrer ?? null,
    });

    if (error) throw new Error(error.message);

    await track("contact.submitted", { topic: input.topic }, context);

    return { ok: true };
  } catch (error) {
    console.error("[submitContact]", error);
    return {
      ok: false,
      error: "Something went wrong. Please try again, or email us directly.",
    };
  }
}
