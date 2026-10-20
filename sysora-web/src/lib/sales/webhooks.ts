import "server-only";

import { salesDb } from "@/lib/supabase/admin";

/**
 * Outbound webhooks, and where their URLs come from.
 *
 * A GoHighLevel inbound-trigger URL is authenticated by the id in its
 * path and nothing else, so it is a credential: it is never logged, never
 * returned to the browser in full, and lives in its own table rather than
 * in `settings`, which has a public flag.
 *
 * The URL is read from the database first and the environment second. The
 * environment copy is what production ran on before this page existed;
 * keeping it as a fallback means the cart nudge did not stop working the
 * moment the table arrived, and a URL saved in the admin takes precedence
 * from then on.
 */

const TIMEOUT_MS = 10_000;

export const WEBHOOK_KEYS = [
  "abandoned_cart",
  "payment_confirmation",
  "hours_topped_up",
] as const;
export type WebhookKey = (typeof WEBHOOK_KEYS)[number];

/** Only the cart hook ever had an environment variable. */
const ENV_FALLBACK: Partial<Record<WebhookKey, string | undefined>> = {
  abandoned_cart: process.env.GHL_ABANDONED_CART_WEBHOOK_URL,
};

export type WebhookOutcome =
  | { ok: true; status: number }
  | { ok: false; status: number | null; detail: string };

export type WebhookRow = {
  key: WebhookKey;
  label: string;
  description: string | null;
  url: string | null;
  lastTestedAt: string | null;
  lastTestStatus: number | null;
  lastTestOk: boolean | null;
  /** True when no URL is saved but the environment still supplies one. */
  fromEnv: boolean;
  /** Sends that had nowhere to go, because no URL was configured. */
  missedCount: number;
  lastMissedAt: string | null;
  lastMissedDetail: string | null;
};

/**
 * Rejects anything that is not a public https endpoint.
 *
 * The admin is trusted, but this input becomes a server-side fetch, so a
 * typo or a pasted internal address should not turn the settings page
 * into a way to probe the deployment's own network.
 */
export function validateWebhookUrl(raw: string): { ok: true; url: string } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "Paste a webhook URL first." };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, error: "That is not a valid URL." };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, error: "The URL has to start with https://." };
  }

  const host = parsed.hostname.toLowerCase();
  const blocked =
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal") ||
    host === "metadata.google.internal" ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(host) ||
    host.startsWith("[");

  if (blocked) {
    return { ok: false, error: "That host is not reachable from the site. Use the public GHL URL." };
  }

  return { ok: true, url: trimmed };
}

/** The configured URL for a hook, or null when there is none. */
export async function getWebhookUrl(key: WebhookKey): Promise<string | null> {
  const { data } = await salesDb().from("webhooks").select("url").eq("key", key).maybeSingle();

  const saved = data?.url?.trim();
  if (saved) return saved;

  return ENV_FALLBACK[key]?.trim() || null;
}

/** Every hook, for the settings page. */
export async function listWebhooks(): Promise<WebhookRow[]> {
  const { data } = await salesDb()
    .from("webhooks")
    .select("key, label, description, url, last_tested_at, last_test_status, last_test_ok, missed_count, last_missed_at, last_missed_detail")
    .order("key");

  return (data ?? []).map((row) => {
    const saved = (row.url as string | null)?.trim() || null;
    return {
      key: row.key as WebhookKey,
      label: row.label as string,
      description: row.description as string | null,
      url: saved,
      lastTestedAt: row.last_tested_at as string | null,
      lastTestStatus: row.last_test_status as number | null,
      lastTestOk: row.last_test_ok as boolean | null,
      fromEnv: !saved && Boolean(ENV_FALLBACK[row.key as WebhookKey]?.trim()),
      missedCount: (row.missed_count as number | null) ?? 0,
      lastMissedAt: row.last_missed_at as string | null,
      lastMissedDetail: row.last_missed_detail as string | null,
    };
  });
}

/**
 * POSTs a payload and reports what happened.
 *
 * `url` is never interpolated into the returned detail or any log line:
 * the trigger id is in its path.
 */
export async function postWebhook(url: string, payload: unknown): Promise<WebhookOutcome> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      // GHL explains rejections in the body; without it a 400 is undiagnosable.
      const body = await response.text().catch(() => "");
      return {
        ok: false,
        status: response.status,
        detail: body.slice(0, 200) || `HTTP ${response.status}`,
      };
    }

    return { ok: true, status: response.status };
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.name === "TimeoutError"
          ? `No response in ${TIMEOUT_MS / 1000}s`
          : error.message
        : "Unknown error";

    return { ok: false, status: null, detail };
  }
}

/** Sends to a hook if it is configured. */
/**
 * Sends to a hook if it is configured, and records it when one is not.
 *
 * A send with nowhere to go used to leave a console line and nothing
 * else, so the notification vanished and the only way to find out was
 * to query the database. The counter is surfaced on the settings page,
 * where somebody is already looking at the hook that is missing a URL.
 *
 * `label` is a human reference for the thing that was being announced,
 * an order reference in practice, and is recorded rather than the
 * payload, which carries a password on the first order.
 */
export async function sendWebhook(
  key: WebhookKey,
  payload: unknown,
  label?: string,
): Promise<WebhookOutcome> {
  const url = await getWebhookUrl(key);

  if (!url) {
    const detail = label ? `${label} had nowhere to go` : "a send had nowhere to go";
    await recordMiss(key, detail);
    return { ok: false, status: null, detail: `No URL configured for ${key}` };
  }

  return postWebhook(url, payload);
}

async function recordMiss(key: WebhookKey, detail: string): Promise<void> {
  const db = salesDb();
  const { data } = await db.from("webhooks").select("missed_count").eq("key", key).maybeSingle();

  await db
    .from("webhooks")
    .update({
      missed_count: ((data?.missed_count as number | null) ?? 0) + 1,
      last_missed_at: new Date().toISOString(),
      last_missed_detail: detail,
    })
    .eq("key", key);
}
