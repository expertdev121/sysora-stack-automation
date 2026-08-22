import { NextResponse } from "next/server";
import Stripe from "stripe";

import { markRequestPaid } from "@/lib/sales/payments";
import { salesDb } from "@/lib/supabase/admin";

/**
 * Stripe webhook.
 *
 * Every event is written to sales.webhook_events first. That table is
 * unique on (provider, event_id), so a replayed event is a no-op instead
 * of a double-processed payment.
 */

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const body = await request.text();
  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe webhook] bad signature", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const db = salesDb();

  // Claim the event. A duplicate insert means we've already seen it.
  const { error: insertError } = await db.from("webhook_events").insert({
    provider: "stripe",
    event_id: event.id,
    event_type: event.type,
    payload: event as unknown as Record<string, unknown>,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[stripe webhook] could not record event", insertError);
    return NextResponse.json({ error: "Could not record event." }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object;
        const requestId = intent.metadata?.request_id;
        if (requestId) {
          const charge = intent.latest_charge as string | Stripe.Charge | null;
          const details =
            typeof charge === "string" ? await stripe.charges.retrieve(charge) : charge;

          await markRequestPaid({
            requestId,
            intentId: intent.id,
            chargeId: details?.id ?? null,
            cardBrand: details?.payment_method_details?.card?.brand ?? null,
            cardLast4: details?.payment_method_details?.card?.last4 ?? null,
            receiptUrl: details?.receipt_url ?? null,
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object;
        await db
          .from("payments")
          .update({
            status: "failed",
            failure_code: intent.last_payment_error?.code ?? null,
            failure_message: intent.last_payment_error?.message ?? null,
          })
          .eq("provider_intent_id", intent.id);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        await db
          .from("payments")
          .update({
            status: charge.amount_refunded >= charge.amount ? "refunded" : "partially_refunded",
            amount_refunded: charge.amount_refunded,
            refunded_at: new Date().toISOString(),
          })
          .eq("provider_charge_id", charge.id);
        break;
      }

      default:
        break;
    }

    await db
      .from("webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("provider", "stripe")
      .eq("event_id", event.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe webhook] handler failed", event.type, error);

    await db
      .from("webhook_events")
      .update({
        error: error instanceof Error ? error.message : String(error),
        attempts: 1,
      })
      .eq("provider", "stripe")
      .eq("event_id", event.id);

    // 500 tells Stripe to retry.
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }
}
