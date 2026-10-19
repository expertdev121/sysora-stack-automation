import "server-only";

import { siteUrl } from "@/lib/site-url";
import { getWebhookUrl, postWebhook, type WebhookOutcome } from "@/lib/sales/webhooks";

/**
 * Outbound webhook to the GoHighLevel abandoned-cart workflow.
 *
 * The URL is an inbound-webhook trigger: its path contains the trigger's
 * id, which is the only thing authenticating the call. It is therefore a
 * credential, never written to a log line, and it now lives in
 * sales.webhooks so it can be changed from the admin without a deploy.
 * The environment variable is still read as a fallback.
 *
 * The payload is flat and all-strings-and-numbers on purpose. GHL maps
 * inbound JSON onto custom values key by key and does not reach into
 * nested objects, so a `customer: { email }` would simply arrive empty.
 * `tools` is joined into a sentence for the same reason: an array is not
 * something a workflow email can interpolate.
 */

const TIMEOUT_MS = 10_000;

export type AbandonedCart = {
  reference: string;
  createdAt: string;
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
  audience: string | null;
  ghlStatus: string | null;
  tools: string[];
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  referrer: string | null;
};

export type { WebhookOutcome };

/** True when the abandoned-cart webhook is wired up on this deployment. */
export async function isAbandonedCartWebhookConfigured(): Promise<boolean> {
  return Boolean(await getWebhookUrl("abandoned_cart"));
}

/**
 * Splits a single name field into the two GHL wants.
 *
 * Everything after the first space is the last name, which is wrong for
 * some names and right for most. GHL creates the contact from whichever
 * fields arrive, so sending both beats sending neither.
 */
function splitName(fullName: string | null): { first: string; last: string } {
  const name = (fullName ?? "").trim().replace(/\s+/g, " ");
  if (!name) return { first: "", last: "" };

  const gap = name.indexOf(" ");
  if (gap === -1) return { first: name, last: "" };

  return { first: name.slice(0, gap), last: name.slice(gap + 1) };
}

/**
 * The link back into checkout.
 *
 * Always the picker with the pack and billing mode in the query string:
 * that is the one checkout URL shape the site publishes, and it survives
 * an order the customer never finished. Falls back to the bare picker if
 * either value is missing, which beats sending a half-built query.
 */
function resumeUrl(hours: number | null, billing: string | null): string {
  const base = `${siteUrl()}/checkout/hours`;
  if (!hours) return base;

  const mode = billing === "monthly" ? "monthly" : "once";
  return `${base}?hours=${hours}&billing=${mode}`;
}

export function abandonedCartPayload(cart: AbandonedCart) {
  const { first, last } = splitName(cart.fullName);

  // Amounts are stored in minor units; a workflow email wants dollars.
  const dollars = cart.amount / 100;
  const startedAt = new Date(cart.createdAt);
  const minutes = Math.max(0, Math.round((Date.now() - startedAt.getTime()) / 60_000));

  return {
    event: "cart_abandoned",

    // Contact. GHL matches or creates on email, so it is the one field
    // that must always be present.
    email: cart.email,
    name: cart.fullName ?? "",
    first_name: first,
    last_name: last,
    phone: cart.phone ?? "",
    company_name: cart.company ?? "",
    timezone: cart.timezone ?? "",

    // The cart.
    reference: cart.reference,
    package: cart.title ?? (cart.hours ? `${cart.hours} prepaid hours` : ""),
    hours: cart.hours ?? "",
    billing: cart.billing ?? "",
    currency: cart.currency,
    amount: dollars,
    amount_formatted: `$${dollars.toFixed(2)}`,
    amount_cents: cart.amount,

    // What they told us on the way in — the material for a useful reply
    // rather than a generic nudge.
    audience: cart.audience ?? "",
    ghl_status: cart.ghlStatus ?? "",
    tools: cart.tools.join(", "),

    // Where it came from.
    utm_source: cart.utmSource ?? "",
    utm_medium: cart.utmMedium ?? "",
    utm_campaign: cart.utmCampaign ?? "",
    referrer: cart.referrer ?? "",

    // Timing, and the one link the email needs. The pack and the billing
    // mode travel in the query string, so the picker reopens on what they
    // had chosen rather than on the default.
    checkout_started_at: startedAt.toISOString(),
    abandoned_at: new Date().toISOString(),
    minutes_since_checkout_started: minutes,
    resume_url: resumeUrl(cart.hours, cart.billing),
  };
}

export async function sendAbandonedCart(cart: AbandonedCart): Promise<WebhookOutcome> {
  const url = await getWebhookUrl("abandoned_cart");
  if (!url) {
    return { ok: false, status: null, detail: "No abandoned-cart webhook URL is configured" };
  }

  return postWebhook(url, abandonedCartPayload(cart));
}
