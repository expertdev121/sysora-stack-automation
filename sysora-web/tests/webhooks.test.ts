import { describe, expect, it } from "vitest";

import { validateWebhookUrl, WEBHOOK_KEYS } from "@/lib/sales/webhooks";
import { sampleFor } from "@/lib/sales/webhook-samples";
import { abandonedCartPayload } from "@/lib/sales/ghl";

/**
 * The outbound webhooks.
 *
 * Two things here are load-bearing and have no other guard. The URL
 * validator is what stops an address pasted into the admin from turning
 * a server-side fetch into a way to reach the deployment's own network.
 * And the payload shape is a contract with GoHighLevel: a field that
 * silently disappears breaks a live email template, and nothing in the
 * type system notices because the payload is a plain object.
 */

describe("validateWebhookUrl", () => {
  it("accepts a real GoHighLevel trigger URL", () => {
    const r = validateWebhookUrl(
      "https://services.leadconnectorhq.com/hooks/abc123/webhook-trigger/def456",
    );
    expect(r.ok).toBe(true);
  });

  it("accepts a white-labelled LeadConnector domain", () => {
    expect(validateWebhookUrl("https://link.givesuite.com/hooks/abc").ok).toBe(true);
  });

  it("trims surrounding whitespace", () => {
    const r = validateWebhookUrl("  https://services.leadconnectorhq.com/hooks/x  ");
    expect(r).toEqual({ ok: true, url: "https://services.leadconnectorhq.com/hooks/x" });
  });

  it.each([
    ["plain http", "http://services.leadconnectorhq.com/hooks/x"],
    ["localhost", "https://localhost/hooks"],
    ["loopback ip", "https://127.0.0.1/hooks"],
    ["link-local metadata", "https://169.254.169.254/latest/meta-data"],
    ["cloud metadata host", "https://metadata.google.internal/x"],
    ["ipv6 loopback", "https://[::1]/hooks"],
    ["internal tld", "https://vault.internal/hooks"],
    ["not a url", "not a url"],
    ["empty", "   "],
  ])("rejects %s", (_label, url) => {
    const r = validateWebhookUrl(url);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBeTruthy();
  });
});

describe("payload contract", () => {
  const CART_FIELDS = [
    "event", "email", "name", "first_name", "last_name", "phone",
    "company_name", "timezone", "reference", "package", "hours", "billing",
    "currency", "amount", "amount_formatted", "amount_cents", "audience",
    "ghl_status", "tools", "utm_source", "utm_medium", "utm_campaign",
    "referrer", "checkout_started_at", "abandoned_at",
    "minutes_since_checkout_started", "resume_url",
  ];

  const PAID_FIELDS = [
    "event", "email", "name", "first_name", "last_name", "phone",
    "company_name", "timezone", "reference", "package", "hours", "billing",
    "currency", "amount", "amount_formatted", "amount_cents", "rate_per_hour",
    "rate_per_hour_formatted", "card_brand", "card_last4", "receipt_url",
    "hours_expire_at", "hours_expire_at_formatted", "account_created",
    "portal_email", "portal_password",
    "portal_login_url", "paid_at", "portal_url", "order_url",
  ];

  it("every registered hook has a sample payload", () => {
    for (const key of WEBHOOK_KEYS) {
      const payload = sampleFor(key, "someone@example.com", "Jordan Lee");
      expect(Object.keys(payload).length, key).toBeGreaterThan(10);
    }
  });

  it("the abandoned-cart payload keeps its fields", () => {
    const p = sampleFor("abandoned_cart", "someone@example.com", "Jordan Lee");
    expect(Object.keys(p).sort()).toEqual([...CART_FIELDS].sort());
  });

  it("the paid payload keeps its fields", () => {
    const p = sampleFor("payment_confirmation", "someone@example.com", "Jordan Lee");
    expect(Object.keys(p).sort()).toEqual([...PAID_FIELDS].sort());
  });

  it("is flat, because GoHighLevel does not read nested objects", () => {
    for (const key of WEBHOOK_KEYS) {
      const p = sampleFor(key, "someone@example.com", "Jordan Lee") as unknown as Record<string, unknown>;
      for (const [field, value] of Object.entries(p)) {
        expect(["string", "number", "boolean"], `${key}.${field}`).toContain(typeof value);
      }
    }
  });

  it("sends the password only on the order that creates the account", () => {
    const first = sampleFor("payment_confirmation", "a@example.com", null) as unknown as Record<string, unknown>;
    const repeat = sampleFor("hours_topped_up", "a@example.com", null) as unknown as Record<string, unknown>;

    expect(first.account_created).toBe(true);
    expect(first.portal_password).toBeTruthy();

    expect(repeat.account_created).toBe(false);
    expect(repeat.portal_password).toBe("");
  });

  it("never puts a working password in a test payload", () => {
    const p = sampleFor("payment_confirmation", "a@example.com", null) as unknown as Record<
      string,
      unknown
    >;
    expect(p.portal_password).toBe("000000");
  });
});

describe("resume link", () => {
  const cart = {
    reference: "SYS-000001",
    createdAt: new Date().toISOString(),
    email: "a@example.com",
    fullName: "A B",
    phone: null,
    company: null,
    timezone: null,
    amount: 45000,
    currency: "USD",
    title: null,
    hours: 25,
    billing: "once",
    audience: null,
    ghlStatus: null,
    tools: [],
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    referrer: null,
  };

  // The one published checkout URL shape. A per-order URL here would be
  // a second shape for the same job and breaks the house rule.
  const ALLOWED = /\/checkout\/hours(\?hours=(5|10|25|50|75|100|150)&billing=(once|monthly))?$/;

  it("uses the published pattern", () => {
    const url = abandonedCartPayload(cart).resume_url;
    expect(url).toMatch(ALLOWED);
  });

  it("carries the pack and the billing mode", () => {
    const url = abandonedCartPayload({ ...cart, hours: 50, billing: "monthly" }).resume_url;
    expect(url).toContain("hours=50");
    expect(url).toContain("billing=monthly");
  });

  it("falls back to the bare picker rather than a half-built query", () => {
    const url = abandonedCartPayload({ ...cart, hours: null }).resume_url;
    expect(url).toMatch(/\/checkout\/hours$/);
  });

  it("treats anything that is not monthly as a one-time pack", () => {
    const url = abandonedCartPayload({ ...cart, billing: "nonsense" }).resume_url;
    expect(url).toContain("billing=once");
  });
});
