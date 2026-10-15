"use server";

import { requireClient } from "@/lib/portal/auth";
import { startPayment, type PaymentSession } from "@/lib/sales/payments";
import { getOffer } from "@/lib/sales/queries";
import { salesDb } from "@/lib/supabase/admin";

/**
 * Buying hours from inside the portal.
 *
 * A signed-in client has already told us their name, email, company and
 * timezone, so the public checkout's details step is three screens of
 * asking them again. This creates the order straight from the session
 * and opens its PaymentIntent, leaving only the card.
 *
 * The price still comes from the offer row, never from the browser —
 * the client picks a pack, not an amount.
 */

export type PurchaseResult =
  | { ok: true; reference: string; session: PaymentSession }
  | { ok: false; error: string };

/**
 * Completes a simulated payment, for environments with no Stripe keys.
 * Scoped to the signed-in client so it cannot be aimed at another
 * customer's order.
 */
export async function completePortalSimulated(
  reference: string,
): Promise<{ ok: boolean; error?: string }> {
  const { customerId } = await requireClient();

  const { data: request } = await salesDb()
    .from("requests")
    .select("id")
    .eq("reference", reference)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (!request) return { ok: false, error: "That order is not on your account." };

  const { completeSimulatedPayment } = await import("@/lib/sales/payments");
  return completeSimulatedPayment(reference);
}

export async function purchaseHours(input: {
  hours: number;
  billing: "once" | "monthly";
}): Promise<PurchaseResult> {
  const { customerId } = await requireClient();

  const offer = await getOffer(`hours-${input.hours}`);
  if (!offer) {
    return { ok: false, error: "That package isn't available right now." };
  }

  const db = salesDb();

  // Everything the public form collects is already on the customer row.
  const { data: customer } = await db
    .from("customers")
    .select("timezone, company_name")
    .eq("id", customerId)
    .maybeSingle();

  const { data: request, error } = await db
    .from("requests")
    .insert({
      customer_id: customerId,
      offer_id: offer.id,
      kind: offer.kind,
      status: "awaiting_payment",
      amount: offer.price_amount,
      currency: offer.currency,
      title: `${input.hours} prepaid hours`,
      metadata: {
        source: "portal",
        hours: input.hours,
        billing: input.billing,
        timezone: customer?.timezone ?? null,
      },
    })
    .select("reference")
    .maybeSingle();

  if (error || !request) {
    console.error("[purchaseHours]", error);
    return { ok: false, error: "Could not start the order. Please try again." };
  }

  const session = await startPayment(request.reference);
  return { ok: true, reference: request.reference, session };
}
