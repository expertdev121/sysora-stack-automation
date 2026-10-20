import "server-only";

import { siteUrl } from "@/lib/site-url";
import { salesDb } from "@/lib/supabase/admin";
import { provisionPortalAccount } from "@/lib/sales/provisioning";
import { sendWebhook } from "@/lib/sales/webhooks";

/**
 * The payment-confirmation webhook: one send per order, the moment it is
 * marked paid.
 *
 * Flat and all strings and numbers, for the same reason the cart payload
 * is: GHL maps inbound JSON onto custom values key by key and does not
 * reach into nested objects.
 *
 * Idempotency matters more here than anywhere else on the site. The
 * Stripe webhook and the confirmation page both call markRequestPaid, so
 * without a lock a customer could be thanked twice for one payment. The
 * conditional update below is that lock: the row is claimed first and the
 * request is only sent by whoever claimed it.
 */

export type PaidOrder = {
  reference: string;
  paidAt: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  company: string | null;
  timezone: string | null;
  amount: number;
  currency: string;
  title: string | null;
  hours: number | null;
  billing: string | null;
  rateAmount: number | null;
  expiresAt: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  receiptUrl: string | null;
  /** Present only on the order that created the account. */
  portalPassword: string | null;
  accountCreated: boolean;
};

function splitName(fullName: string | null): { first: string; last: string } {
  const name = (fullName ?? "").trim().replace(/\s+/g, " ");
  if (!name) return { first: "", last: "" };
  const gap = name.indexOf(" ");
  if (gap === -1) return { first: name, last: "" };
  return { first: name.slice(0, gap), last: name.slice(gap + 1) };
}

export function paymentConfirmationPayload(order: PaidOrder) {
  const { first, last } = splitName(order.fullName);
  const dollars = order.amount / 100;
  const rate = order.rateAmount != null ? order.rateAmount / 100 : null;

  return {
    event: "payment_succeeded",

    // Contact. GHL matches or creates on email.
    email: order.email,
    name: order.fullName ?? "",
    first_name: first,
    last_name: last,
    phone: order.phone ?? "",
    company_name: order.company ?? "",
    timezone: order.timezone ?? "",

    // What they bought.
    reference: order.reference,
    package: order.title ?? (order.hours ? `${order.hours} prepaid hours` : ""),
    hours: order.hours ?? "",
    billing: order.billing ?? "",
    currency: order.currency,
    amount: dollars,
    amount_formatted: `$${dollars.toFixed(2)}`,
    amount_cents: order.amount,
    rate_per_hour: rate ?? "",
    rate_per_hour_formatted: rate != null ? `$${rate.toFixed(2)}` : "",

    // How they paid, for the receipt line in the email.
    card_brand: order.cardBrand ?? "",
    card_last4: order.cardLast4 ?? "",
    receipt_url: order.receiptUrl ?? "",

    // When it runs out, so the email can say so.
    hours_expire_at: order.expiresAt ?? "",

    // The portal login. `portal_password` is filled on the order that
    // created the account and empty on every one after it, so a workflow
    // can branch on account_created rather than parsing the password.
    account_created: order.accountCreated,
    portal_email: order.email,
    portal_password: order.portalPassword ?? "",
    portal_login_url: `${siteUrl()}/portal/login`,

    paid_at: order.paidAt,
    portal_url: `${siteUrl()}/portal`,
    order_url: `${siteUrl()}/checkout/${order.reference}/complete`,
  };
}

/**
 * Claims the order, then sends. Returns false when somebody else already
 * claimed it, which is the normal outcome of the webhook/page race.
 */
export async function sendPaymentConfirmation(requestId: string): Promise<boolean> {
  const db = salesDb();

  // Claim first. `.is(null)` makes this the lock: the second caller
  // updates no rows and gets nothing back.
  const { data: claimed } = await db
    .from("requests")
    .update({ confirmation_notified_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "paid")
    .is("confirmation_notified_at", null)
    .select(
      "id, reference, paid_at, amount, currency, title, metadata, customer_id, " +
        "customers!inner(email, full_name, phone, company_name, timezone)",
    )
    .maybeSingle();

  if (!claimed) return false;

  const row = claimed as unknown as {
    id: string;
    reference: string;
    customer_id: string;
    paid_at: string | null;
    amount: number;
    currency: string;
    title: string | null;
    metadata: Record<string, unknown> | null;
    customers: { email: string; full_name: string | null; phone: string | null; company_name: string | null; timezone: string | null };
  };

  if (!row.customers?.email) return false;

  const meta = row.metadata ?? {};
  const hours = typeof meta.hours === "number" ? meta.hours : null;
  const billing = typeof meta.billing === "string" ? meta.billing : null;

  // The entitlement granted a moment ago carries the rate and expiry the
  // email wants to quote. Absent for anything that is not an hour pack.
  const { data: entitlement } = await db
    .from("hour_entitlements")
    .select("rate_amount, expires_at")
    .eq("request_id", row.id)
    .maybeSingle();

  const { data: payment } = await db
    .from("payments")
    .select("card_brand, card_last4, receipt_url")
    .eq("request_id", row.id)
    .eq("status", "succeeded")
    .order("succeeded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Create the portal account before the send, so the password it
  // returns can travel in the same payload. A customer who already has
  // an account gets no new password and the repeat-purchase hook, which
  // is a different email in GoHighLevel.
  const account = await provisionPortalAccount(row.customer_id);

  // Only a client who already had a portal account is a repeat purchase.
  // Everything else is somebody's first order and gets the welcome,
  // with the password left empty when no account could be made for
  // them. Routing an anomaly to the top-up email would tell a new
  // customer their hours had been topped up.
  const hook =
    account.reason === "existing_client" ? "hours_topped_up" : "payment_confirmation";

  const outcome = await sendWebhook(
    hook,
    paymentConfirmationPayload({
      reference: row.reference,
      paidAt: row.paid_at ?? new Date().toISOString(),
      email: row.customers.email,
      fullName: row.customers.full_name,
      phone: row.customers.phone,
      company: row.customers.company_name,
      timezone: row.customers.timezone,
      amount: row.amount,
      currency: row.currency,
      title: row.title,
      hours,
      billing,
      rateAmount: entitlement?.rate_amount ?? null,
      expiresAt: entitlement?.expires_at ?? null,
      cardBrand: payment?.card_brand ?? null,
      cardLast4: payment?.card_last4 ?? null,
      receiptUrl: payment?.receipt_url ?? null,
      portalPassword: account.created ? account.password : null,
      accountCreated: account.created,
    }),
    row.reference,
  );

  if (!outcome.ok) {
    // Hand the claim back so the next paid-path call can retry. A missing
    // receipt email is worth one duplicate far more than it is worth
    // silently never arriving.
    await db
      .from("requests")
      .update({ confirmation_notified_at: null })
      .eq("id", row.id);

    console.error(
      `[${hook}] ${row.reference} failed`,
      outcome.status ?? "no status",
      outcome.detail,
    );
    return false;
  }

  return true;
}
