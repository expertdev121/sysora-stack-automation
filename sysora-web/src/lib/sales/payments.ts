"use server";

import Stripe from "stripe";

import { salesDb } from "@/lib/supabase/admin";
import { track } from "./actions";

/**
 * Payments run through Stripe's Payment Element, embedded in our own
 * checkout page — the customer never leaves the site. Card details go
 * straight from the browser to Stripe inside their iframe, so nothing
 * sensitive touches our servers or our database.
 *
 * Until Stripe keys are configured, checkout runs in simulation mode so
 * the surrounding flow stays testable.
 */

let stripeClient: Stripe | null = null;

function stripe(): Stripe {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  stripeClient = new Stripe(key);
  return stripeClient;
}

export async function isStripeConfigured(): Promise<boolean> {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export async function isSimulationAllowed(): Promise<boolean> {
  return process.env.ALLOW_SIMULATED_PAYMENTS === "true" && process.env.NODE_ENV !== "production";
}

export type PaymentSession =
  | { mode: "stripe"; clientSecret: string; publishableKey: string; amount: number; currency: string }
  | { mode: "simulated"; amount: number; currency: string }
  | { mode: "unavailable"; reason: string };

/**
 * Prepares the payment for a request. Reuses an open PaymentIntent rather
 * than creating a new one each time the page is refreshed.
 */
export async function startPayment(reference: string): Promise<PaymentSession> {
  const db = salesDb();

  const { data: request, error } = await db
    .from("requests")
    .select("id, reference, amount, currency, status, customer_id, offer_id, customers(email, full_name, stripe_customer_id)")
    .eq("reference", reference)
    .maybeSingle();

  if (error || !request) return { mode: "unavailable", reason: "We couldn't find that request." };
  if (request.status === "paid" || request.status === "in_review") {
    return { mode: "unavailable", reason: "This one is already paid." };
  }

  const customer = (Array.isArray(request.customers) ? request.customers[0] : request.customers) as
    | { email: string; full_name: string | null; stripe_customer_id: string | null }
    | undefined;

  if (!(await isStripeConfigured())) {
    if (await isSimulationAllowed()) {
      return { mode: "simulated", amount: request.amount, currency: request.currency };
    }
    return {
      mode: "unavailable",
      reason: "Payments aren't configured yet. Please get in touch and we'll take it from here.",
    };
  }

  const session = (clientSecret: string): PaymentSession => ({
    mode: "stripe",
    clientSecret,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    amount: request.amount,
    currency: request.currency,
  });

  const OPEN_STATUSES = [
    "requires_payment_method",
    "requires_confirmation",
    "requires_action",
    "processing",
  ];

  /** The in-flight payment for this request, if it still has a usable intent. */
  const openIntentSecret = async (): Promise<string | null> => {
    const { data, error } = await db
      .from("payments")
      .select("provider_intent_id")
      .eq("request_id", request.id)
      .in("status", ["requires_payment_method", "requires_action", "processing"])
      .not("provider_intent_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data?.provider_intent_id) return null;

    const intent = await stripe().paymentIntents.retrieve(data.provider_intent_id);
    if (!intent.client_secret || !OPEN_STATUSES.includes(intent.status)) return null;
    return intent.client_secret;
  };

  const reused = await openIntentSecret();
  if (reused) return session(reused);

  const intent = await stripe().paymentIntents.create({
    amount: request.amount,
    currency: request.currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    receipt_email: customer?.email,
    description: `Sysora ${request.reference}`,
    metadata: {
      request_id: request.id,
      reference: request.reference,
      customer_id: request.customer_id,
    },
  });

  const { error: insertError } = await db.from("payments").insert({
    request_id: request.id,
    customer_id: request.customer_id,
    offer_id: request.offer_id,
    provider: "stripe",
    provider_intent_id: intent.id,
    status: "requires_payment_method",
    amount: request.amount,
    currency: request.currency,
  });

  if (insertError) {
    // 23505 means another render won the race and already has a payment in
    // flight (payments_one_open_per_request). Throw ours away and use theirs,
    // so the request never ends up with two live intents.
    if (insertError.code === "23505") {
      await stripe().paymentIntents.cancel(intent.id).catch(() => {});
      const winner = await openIntentSecret();
      if (winner) return session(winner);
    }
    throw new Error(`Could not start the payment: ${insertError.message}`);
  }

  await track("payment.intent_created", { request_id: request.id, reference: request.reference });

  return session(intent.client_secret!);
}

/**
 * Grants the hours an order paid for.
 *
 * Without this the customer pays and their balance stays at zero, which
 * is how the first two orders on this site ended up with no entitlement
 * at all. A unique index on request_id makes it idempotent: the webhook
 * and the confirmation-page reconcile both call markRequestPaid, and the
 * loser of that race inserts nothing rather than granting twice.
 *
 * One-time packs expire 60 days out; monthly plans reset instead, and
 * the reset date is set when the cycle renews rather than guessed here.
 */
const PACK_VALIDITY_DAYS = 60;

async function grantHoursFor(requestId: string): Promise<void> {
  const db = salesDb();

  const { data: request } = await db
    .from("requests")
    .select("id, customer_id, kind, amount, currency, metadata, paid_at")
    .eq("id", requestId)
    .maybeSingle();

  if (!request || request.kind !== "hour_pack") return;

  const meta = (request.metadata ?? {}) as { hours?: unknown; billing?: unknown };
  const hours = Number(meta.hours);
  if (!Number.isFinite(hours) || hours <= 0) {
    console.error(`[grantHoursFor] ${requestId} is an hour pack with no usable hours`);
    return;
  }

  const monthly = meta.billing === "monthly";
  const startsAt = request.paid_at ?? new Date().toISOString();
  const expiresAt = monthly
    ? null
    : new Date(Date.parse(startsAt) + PACK_VALIDITY_DAYS * 86_400_000).toISOString();

  const { error } = await db.from("hour_entitlements").insert({
    customer_id: request.customer_id,
    request_id: request.id,
    hours,
    rate_amount: Math.round(request.amount / hours),
    currency: request.currency,
    source: monthly ? "monthly" : "pack",
    starts_at: startsAt,
    expires_at: expiresAt,
  });

  // 23505 is the one-per-request index doing its job.
  if (error && error.code !== "23505") {
    console.error(`[grantHoursFor] ${requestId}`, error);
  }
}

/**
 * Marks a request paid. Called by the Stripe webhook, and by the
 * simulated flow in development.
 */
export async function markRequestPaid(input: {
  requestId: string;
  intentId?: string;
  cardBrand?: string | null;
  cardLast4?: string | null;
  receiptUrl?: string | null;
  chargeId?: string | null;
  simulated?: boolean;
}): Promise<void> {
  const db = salesDb();
  const now = new Date().toISOString();

  if (input.intentId) {
    await db
      .from("payments")
      .update({
        status: "succeeded",
        succeeded_at: now,
        card_brand: input.cardBrand ?? null,
        card_last4: input.cardLast4 ?? null,
        receipt_url: input.receiptUrl ?? null,
        provider_charge_id: input.chargeId ?? null,
      })
      .eq("provider_intent_id", input.intentId);
  }

  await db
    .from("requests")
    .update({ status: "paid", paid_at: now })
    .eq("id", input.requestId)
    .in("status", ["awaiting_payment", "submitted", "draft"]);

  // Retire any other intent still in flight for this request. Leaving one
  // live would let the same request be paid twice.
  const { data: stale } = await db
    .from("payments")
    .select("id, provider, provider_intent_id")
    .eq("request_id", input.requestId)
    .in("status", ["requires_payment_method", "requires_action", "processing"]);

  for (const payment of stale ?? []) {
    if (payment.provider === "stripe" && payment.provider_intent_id) {
      await stripe()
        .paymentIntents.cancel(payment.provider_intent_id)
        .catch((error) => console.error("[markRequestPaid] could not cancel intent", error));
    }
    await db
      .from("payments")
      .update({ status: "cancelled", metadata: { retired_reason: "request_already_paid" } })
      .eq("id", payment.id);
  }

  // After the request is marked paid, so paid_at is the entitlement's start.
  await grantHoursFor(input.requestId);

  await track("payment.succeeded", { request_id: input.requestId, simulated: !!input.simulated });
}

/**
 * Reconciles a request against Stripe directly.
 *
 * The webhook is the authoritative path, but it is asynchronous and can be
 * absent entirely in local development. Checking the intent when the
 * customer lands on the confirmation page means the flow never hangs on a
 * webhook that hasn't arrived — and because `markRequestPaid` only moves a
 * request out of an unpaid state, the two paths can't double-apply.
 */
export async function reconcilePayment(
  reference: string,
  intentId?: string,
): Promise<{ paid: boolean }> {
  if (!(await isStripeConfigured())) return { paid: false };

  const db = salesDb();

  const { data: request } = await db
    .from("requests")
    .select("id, status, paid_at")
    .eq("reference", reference)
    .maybeSingle();

  if (!request) return { paid: false };
  if (request.paid_at || request.status === "paid" || request.status === "in_review") {
    return { paid: true };
  }

  let providerIntentId = intentId;
  if (!providerIntentId) {
    const { data: payment } = await db
      .from("payments")
      .select("provider_intent_id")
      .eq("request_id", request.id)
      .not("provider_intent_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    providerIntentId = payment?.provider_intent_id ?? undefined;
  }

  if (!providerIntentId) return { paid: false };

  try {
    const intent = await stripe().paymentIntents.retrieve(providerIntentId, {
      expand: ["latest_charge"],
    });

    if (intent.status !== "succeeded") {
      if (intent.status === "requires_payment_method" && intent.last_payment_error) {
        await db
          .from("payments")
          .update({
            status: "failed",
            failure_code: intent.last_payment_error.code ?? null,
            failure_message: intent.last_payment_error.message ?? null,
          })
          .eq("provider_intent_id", intent.id);
      }
      return { paid: false };
    }

    const charge = intent.latest_charge as Stripe.Charge | null;
    await markRequestPaid({
      requestId: request.id,
      intentId: intent.id,
      chargeId: charge?.id ?? null,
      cardBrand: charge?.payment_method_details?.card?.brand ?? null,
      cardLast4: charge?.payment_method_details?.card?.last4 ?? null,
      receiptUrl: charge?.receipt_url ?? null,
    });

    return { paid: true };
  } catch (error) {
    console.error("[reconcilePayment]", reference, error);
    return { paid: false };
  }
}

/** Development-only: completes checkout without charging anything. */
export async function completeSimulatedPayment(
  reference: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isSimulationAllowed())) {
    return { ok: false, error: "Simulated payments are disabled." };
  }

  const db = salesDb();
  const { data: request } = await db
    .from("requests")
    .select("id, customer_id, offer_id, amount, currency, status")
    .eq("reference", reference)
    .maybeSingle();

  if (!request) return { ok: false, error: "We couldn't find that request." };

  await db.from("payments").insert({
    request_id: request.id,
    customer_id: request.customer_id,
    offer_id: request.offer_id,
    provider: "simulated",
    status: "succeeded",
    succeeded_at: new Date().toISOString(),
    amount: request.amount,
    currency: request.currency,
    metadata: { simulated: true },
  });

  await markRequestPaid({ requestId: request.id, simulated: true });
  return { ok: true };
}
