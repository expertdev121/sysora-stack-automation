import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { sendAbandonedCart, isAbandonedCartWebhookConfigured, type AbandonedCart } from "@/lib/sales/ghl";
import { salesDb } from "@/lib/supabase/admin";

/**
 * Abandoned-cart sweeper.
 *
 * Finishing the details step creates the request and opens its
 * PaymentIntent, so a customer who then closes the tab leaves a complete
 * row in `awaiting_payment` with a null paid_at. This runs every few
 * minutes, finds those rows once they are past the grace period, and
 * hands each to the GoHighLevel workflow.
 *
 * Portal-originated orders are excluded: those customers are already
 * signed in and already paying, so the lead-nurture copy is wrong for
 * them.
 *
 * Why a sweeper and not a timer at checkout time: the request that would
 * hold the timer is the one that ends when the customer leaves. State in
 * the database outlives the visit; a setTimeout in a serverless function
 * does not.
 *
 * Driven by pg_cron in Supabase rather than Vercel Cron, which on the
 * Hobby plan can only fire once a day — a nudge a day late is not a nudge.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** How long after the details step a cart counts as abandoned. */
const DEFAULT_GRACE_MINUTES = 30;

/** Carts per run. Keeps one slow webhook from running into maxDuration. */
const BATCH = 20;

/** Tries before a cart is left alone, so a dead webhook can't hot-loop. */
const MAX_ATTEMPTS = 5;

function graceMinutes(): number {
  const raw = Number.parseInt(process.env.ABANDONED_CART_GRACE_MINUTES ?? "", 10);
  return Number.isFinite(raw) && raw >= 0 ? raw : DEFAULT_GRACE_MINUTES;
}

/** Constant-time compare, so a wrong secret leaks nothing by timing. */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function authorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;

  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";

  return Boolean(bearer) && secretMatches(bearer, expected);
}

/** The shape the row embed returns; `customers` comes back as an object. */
type Row = {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  title: string | null;
  created_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  metadata: Record<string, unknown> | null;
  abandoned_attempts: number;
  customers: {
    email: string;
    full_name: string | null;
    phone: string | null;
    company_name: string | null;
    timezone: string | null;
  } | null;
};

function toCart(row: Row): AbandonedCart | null {
  // No email, nothing to send: GHL matches contacts on it.
  if (!row.customers?.email) return null;

  const meta = row.metadata ?? {};
  const str = (key: string): string | null => {
    const value = meta[key];
    return typeof value === "string" && value.trim() ? value : null;
  };

  const hours = typeof meta.hours === "number" ? meta.hours : null;
  const tools = Array.isArray(meta.tools)
    ? meta.tools.filter((tool): tool is string => typeof tool === "string")
    : [];

  return {
    reference: row.reference,
    createdAt: row.created_at,
    email: row.customers.email,
    fullName: row.customers.full_name,
    phone: row.customers.phone,
    company: row.customers.company_name,
    timezone: row.customers.timezone ?? str("timezone"),
    amount: row.amount,
    currency: row.currency,
    title: row.title,
    hours,
    billing: str("billing"),
    audience: str("audience"),
    ghlStatus: str("ghl_status"),
    tools,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    referrer: row.referrer,
  };
}

async function sweep() {
  if (!(await isAbandonedCartWebhookConfigured())) {
    return NextResponse.json(
      { error: "No abandoned-cart webhook URL is configured. Set one in Admin → Settings." },
      { status: 503 },
    );
  }

  const minutes = graceMinutes();
  const cutoff = new Date(Date.now() - minutes * 60_000).toISOString();
  const db = salesDb();

  const { data, error } = await db
    .from("requests")
    .select(
      "id, reference, amount, currency, title, created_at, utm_source, utm_medium, " +
        "utm_campaign, referrer, metadata, abandoned_attempts, " +
        "customers!inner(email, full_name, phone, company_name, timezone)",
    )
    .eq("kind", "hour_pack")
    .eq("status", "awaiting_payment")
    // Orders started inside the client portal are not leads. The nurture
    // workflow greets a stranger; an existing client who changed their
    // mind on the plans page should never receive it.
    .or("metadata->>source.is.null,metadata->>source.neq.portal")
    .is("paid_at", null)
    .is("abandoned_notified_at", null)
    .lt("abandoned_attempts", MAX_ATTEMPTS)
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(BATCH);

  if (error) {
    console.error("[abandoned-carts] could not read candidates", error);
    return NextResponse.json({ error: "Could not read candidates." }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as Row[];
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of rows) {
    const cart = toCart(row);
    if (!cart) {
      skipped += 1;
      continue;
    }

    // Count the attempt before making it. A function killed mid-request
    // then costs one attempt rather than retrying forever.
    await db
      .from("requests")
      .update({ abandoned_attempts: (row.abandoned_attempts ?? 0) + 1 })
      .eq("id", row.id);

    const outcome = await sendAbandonedCart(cart);

    if (outcome.ok) {
      const { error: stampError } = await db
        .from("requests")
        .update({ abandoned_notified_at: new Date().toISOString() })
        .eq("id", row.id);

      if (stampError) {
        // Sent but unmarked: the next run would send it again. Loud,
        // because a duplicate nudge is the one failure a customer sees.
        console.error(`[abandoned-carts] ${row.reference} sent but not marked`, stampError);
      }

      sent += 1;
    } else {
      console.error(
        `[abandoned-carts] ${row.reference} failed`,
        outcome.status ?? "no status",
        outcome.detail,
      );
      failed += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    grace_minutes: minutes,
    candidates: rows.length,
    sent,
    failed,
    skipped,
  });
}

async function run(request: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json({ error: "CRON_SECRET is not set." }, { status: 503 });
  }
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return sweep();
}

/** pg_net posts; GET is kept so the endpoint stays curl-testable. */
export async function POST(request: Request) {
  return run(request);
}

export async function GET(request: Request) {
  return run(request);
}
