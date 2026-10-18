"use server";

import { revalidatePath } from "next/cache";

import { requirePipeline } from "@/lib/admin/auth";
import { audit } from "@/lib/admin/audit";
import { postWebhook, validateWebhookUrl, WEBHOOK_KEYS, type WebhookKey } from "@/lib/sales/webhooks";
import { sampleFor } from "@/lib/sales/webhook-samples";
import { salesDb } from "@/lib/supabase/admin";

export type TestResult =
  | { ok: true; status: number; sentTo: string }
  | { ok: false; error: string };

function isKey(value: string): value is WebhookKey {
  return (WEBHOOK_KEYS as readonly string[]).includes(value);
}

/**
 * Sends the test payload, and saves the URL only if it arrives.
 *
 * Testing before saving rather than after is the whole point: a URL that
 * is stored but wrong is worse than no URL, because the cart sweeper will
 * report success at posting into a void. Nothing is written until GHL has
 * answered 2xx.
 */
export async function testAndSaveWebhook(key: string, rawUrl: string): Promise<TestResult> {
  const session = await requirePipeline();

  if (!isKey(key)) return { ok: false, error: "Unknown webhook." };

  const checked = validateWebhookUrl(rawUrl);
  if (!checked.ok) return { ok: false, error: checked.error };

  const outcome = await postWebhook(checked.url, sampleFor(key, session.email, session.fullName));
  const db = salesDb();
  const now = new Date().toISOString();

  if (!outcome.ok) {
    // Record the failed attempt against whatever is already saved, so the
    // page can say "last test failed" without adopting a bad URL.
    await db
      .from("webhooks")
      .update({ last_tested_at: now, last_test_status: outcome.status, last_test_ok: false })
      .eq("key", key);

    revalidatePath("/admin/settings");
    return {
      ok: false,
      error: outcome.status
        ? `GoHighLevel answered ${outcome.status}. ${outcome.detail}`
        : outcome.detail,
    };
  }

  const { error } = await db
    .from("webhooks")
    .update({
      url: checked.url,
      last_tested_at: now,
      last_test_status: outcome.status,
      last_test_ok: true,
      updated_at: now,
      updated_by: session.userId,
    })
    .eq("key", key);

  if (error) return { ok: false, error: `Test went through, but saving failed: ${error.message}` };

  // The URL is a credential, so the audit line records that it changed
  // and who changed it — never the value.
  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "webhook.saved",
    entity: "webhook",
    entityId: key,
    after: { tested_ok: true, status: outcome.status },
  });

  revalidatePath("/admin/settings");
  return { ok: true, status: outcome.status, sentTo: session.email };
}

/** Removes a saved URL. The hook stops firing until a new one is tested. */
export async function clearWebhook(key: string): Promise<TestResult> {
  const session = await requirePipeline();
  if (!isKey(key)) return { ok: false, error: "Unknown webhook." };

  const { error } = await salesDb()
    .from("webhooks")
    .update({
      url: null,
      last_tested_at: null,
      last_test_status: null,
      last_test_ok: null,
      updated_at: new Date().toISOString(),
      updated_by: session.userId,
    })
    .eq("key", key);

  if (error) return { ok: false, error: error.message };

  await audit({
    actorId: session.userId,
    actorEmail: session.email,
    action: "webhook.cleared",
    entity: "webhook",
    entityId: key,
  });

  revalidatePath("/admin/settings");
  return { ok: true, status: 0, sentTo: "" };
}
