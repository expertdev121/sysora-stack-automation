import "server-only";

import { abandonedCartPayload } from "@/lib/sales/ghl";
import { paymentConfirmationPayload } from "@/lib/sales/confirmation";
import type { WebhookKey } from "@/lib/sales/webhooks";

/**
 * The payloads the admin "send test" button fires.
 *
 * They run through the same two builder functions the live sends use, so
 * the test cannot drift from reality: add a field to the real payload and
 * the test gets it for free. Only the inputs are invented.
 *
 * The contact is the signed-in staff member, deliberately. A test that
 * only proves the URL returns 200 proves very little — what matters is
 * whether the workflow fires and the email arrives, and that can only be
 * checked by sending it to somebody who can open the inbox.
 */

const HOUR = 3_600_000;

export function sampleAbandonedCart(email: string, name: string | null) {
  return abandonedCartPayload({
    reference: "SYS-TEST01",
    createdAt: new Date(Date.now() - HOUR).toISOString(),
    email,
    fullName: name ?? "Webhook Test",
    phone: "+1 555 0100",
    company: "Webhook Test Co",
    timezone: "America/New_York",
    amount: 85_000,
    currency: "USD",
    title: "50 prepaid hours",
    hours: 50,
    billing: "once",
    audience: "agency",
    ghlStatus: "using_ghl",
    tools: ["GoHighLevel", "Zapier"],
    utmSource: "webhook-test",
    utmMedium: "admin",
    utmCampaign: "settings-page",
    referrer: "https://www.sysorastack.com/admin/settings",
  });
}

export function samplePaymentConfirmation(email: string, name: string | null) {
  const now = new Date();
  return paymentConfirmationPayload({
    reference: "SYS-TEST01",
    paidAt: now.toISOString(),
    email,
    fullName: name ?? "Webhook Test",
    phone: "+1 555 0100",
    company: "Webhook Test Co",
    timezone: "America/New_York",
    amount: 85_000,
    currency: "USD",
    title: "50 prepaid hours",
    hours: 50,
    billing: "once",
    rateAmount: 1_700,
    expiresAt: new Date(now.getTime() + 60 * 24 * HOUR).toISOString(),
    cardBrand: "Visa",
    cardLast4: "4242",
    receiptUrl: "https://pay.stripe.com/receipts/test",
  });
}

export function sampleFor(key: WebhookKey, email: string, name: string | null) {
  return key === "abandoned_cart"
    ? sampleAbandonedCart(email, name)
    : samplePaymentConfirmation(email, name);
}
