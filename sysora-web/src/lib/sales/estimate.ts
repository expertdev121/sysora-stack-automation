"use server";

import { salesDb } from "@/lib/supabase/admin";
import { track, type TrackingContext } from "./actions";
import { getOffer } from "./queries";

/**
 * The estimate form has its own fixed fields rather than a survey built in
 * the dashboard, so it does not go through submitIntakeSurvey. It lands in
 * the same place: a customer row and a free build-request, visible in
 * /admin/requests like any other.
 */

/** The free build-request offer every estimate is filed against. */
const OFFER_SLUG = "build-request";

export type EstimateInput = {
  types: string[];
  description: string;
  timing: string;
  fullName: string;
  email: string;
  company: string;
  audience: string;
  context?: TrackingContext;
};

export type EstimateResult =
  | { ok: true; reference: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitEstimate(input: EstimateInput): Promise<EstimateResult> {
  const fieldErrors: Record<string, string> = {};

  const email = input.email.trim();
  const fullName = input.fullName.trim();
  const description = input.description.trim();

  if (!fullName) fieldErrors.fullName = "Tell us who you are.";
  if (!email) fieldErrors.email = "We need an email address to reach you.";
  else if (!EMAIL.test(email)) fieldErrors.email = "That email address doesn't look right.";
  if (description.length < 20) {
    fieldErrors.description = "A sentence or two about the project, so we can price it.";
  }
  if (input.types.length === 0) fieldErrors.types = "Pick at least one kind of work.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Some answers need another look.", fieldErrors };
  }

  const context = input.context ?? {};

  try {
    const offer = await getOffer(OFFER_SLUG);
    if (!offer) {
      return { ok: false, error: "This form isn't set up yet. Please get in touch." };
    }

    const db = salesDb();

    // Existing customer keeps its first-touch attribution; only the details
    // they just gave us are written over.
    const { data: existing } = await db
      .from("customers")
      .select("id")
      .eq("email_normalized", email.toLowerCase())
      .maybeSingle();

    let customerId: string;

    if (existing) {
      customerId = existing.id;
      await db
        .from("customers")
        .update({
          full_name: fullName,
          company_name: input.company.trim() || null,
        })
        .eq("id", customerId);
    } else {
      const { data: created, error } = await db
        .from("customers")
        .insert({
          email,
          full_name: fullName,
          company_name: input.company.trim() || null,
          utm_source: context.utm_source ?? null,
          utm_medium: context.utm_medium ?? null,
          utm_campaign: context.utm_campaign ?? null,
          referrer: context.referrer ?? null,
          landing_path: context.path ?? null,
        })
        .select("id")
        .single();

      if (error) throw new Error(`Could not save your details: ${error.message}`);
      customerId = created.id;
    }

    const { data: request, error: requestError } = await db
      .from("requests")
      .insert({
        customer_id: customerId,
        offer_id: offer.id,
        kind: offer.kind,
        status: "submitted",
        amount: 0,
        currency: offer.currency,
        title: `Project estimate — ${input.types.join(", ")}`,
        summary: description,
        utm_source: context.utm_source ?? null,
        utm_medium: context.utm_medium ?? null,
        utm_campaign: context.utm_campaign ?? null,
        referrer: context.referrer ?? null,
        // The form's own fields have no question rows to hang off, so they
        // travel with the request instead of being lost.
        metadata: {
          source: "request-estimate",
          work_types: input.types,
          timing: input.timing,
          audience: input.audience,
        },
      })
      .select("reference")
      .single();

    if (requestError) {
      throw new Error(`Could not create your request: ${requestError.message}`);
    }

    await track("request.submitted", { customer_id: customerId, offer: offer.slug }, context);

    return { ok: true, reference: request.reference };
  } catch (error) {
    console.error("[submitEstimate]", error);
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
    };
  }
}
