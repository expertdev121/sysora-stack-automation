"use server";

import { salesDb } from "@/lib/supabase/admin";
import { track, type TrackingContext } from "./actions";
import { startPayment, completeSimulatedPayment, type PaymentSession } from "./payments";
import { getOffer } from "./queries";

/**
 * Turns a chosen hour pack into a payable request and opens the payment
 * for it, so the card form can render in place on the checkout rather
 * than sending the customer somewhere else to pay.
 *
 * The card fields themselves are Stripe's Payment Element, which draws in
 * an iframe Stripe controls: the number never reaches our JavaScript, our
 * server or our database. "Embedded" is about where it appears, not about
 * who handles the card.
 */

export type HoursInput = {
  hours: number;
  billing: "once" | "monthly";
  fullName: string;
  email: string;
  company: string;
  audience: string;
  ghl: string;
  tools: string[];
  timezone: string;
  context?: TrackingContext;
};

export type HoursResult =
  | { ok: true; reference: string; session: PaymentSession }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Lets the checkout finish a simulated payment without a page change. */
export async function completeHoursSimulated(reference: string) {
  return completeSimulatedPayment(reference);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function startHourPackCheckout(input: HoursInput): Promise<HoursResult> {
  const fieldErrors: Record<string, string> = {};
  const email = input.email.trim();
  const fullName = input.fullName.trim();

  if (!fullName) fieldErrors.fullName = "Tell us who you are.";
  if (!email) fieldErrors.email = "We need an email address to reach you.";
  else if (!EMAIL.test(email)) fieldErrors.email = "That email address doesn't look right.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Some answers need another look.", fieldErrors };
  }

  const context = input.context ?? {};

  try {
    // The pack's price comes from the offer, never from the browser.
    const offer = await getOffer(`hours-${input.hours}`);
    if (!offer) {
      return {
        ok: false,
        error: "That package isn't available right now. Please get in touch.",
      };
    }

    const db = salesDb();

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
          timezone: input.timezone,
        })
        .eq("id", customerId);
    } else {
      const { data: created, error } = await db
        .from("customers")
        .insert({
          email,
          full_name: fullName,
          company_name: input.company.trim() || null,
          timezone: input.timezone,
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
        status: "awaiting_payment",
        amount: offer.price_amount,
        currency: offer.currency,
        title: `${input.hours} prepaid hours`,
        utm_source: context.utm_source ?? null,
        utm_medium: context.utm_medium ?? null,
        utm_campaign: context.utm_campaign ?? null,
        referrer: context.referrer ?? null,
        metadata: {
          source: "hours-checkout",
          hours: input.hours,
          billing: input.billing,
          audience: input.audience,
          ghl_status: input.ghl,
          tools: input.tools,
          timezone: input.timezone,
        },
      })
      .select("reference")
      .single();

    if (requestError) {
      throw new Error(`Could not create your order: ${requestError.message}`);
    }

    await track(
      "checkout.started",
      { customer_id: customerId, offer: offer.slug, hours: input.hours },
      context,
    );

    // Opens the PaymentIntent now so the card form has something to
    // render against without a second round trip.
    const session = await startPayment(request.reference);

    return { ok: true, reference: request.reference, session };
  } catch (error) {
    console.error("[startHourPackCheckout]", error);
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
    };
  }
}
