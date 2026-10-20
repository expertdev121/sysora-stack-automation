"use client";

import { useState, useTransition } from "react";

import { Card, CardHeader, inputClass, labelClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { clearWebhook, testAndSaveWebhook, type TestResult } from "@/lib/admin/webhook-actions";
import type { WebhookRow } from "@/lib/sales/webhooks";

/**
 * The outbound-webhook panel.
 *
 * One button, not two. Saving a URL that has never been proved to work
 * is the failure this is built to avoid, so the only way to store one is
 * to send a real payload through it first.
 */
export function WebhookSettings({ webhooks }: { webhooks: WebhookRow[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] items-start gap-5">
      {webhooks.map((hook) => (
        <WebhookCard key={hook.key} hook={hook} />
      ))}
    </div>
  );
}

function statusLine(hook: WebhookRow): { text: string; tone: string } {
  if (hook.lastTestOk && hook.url) {
    const when = hook.lastTestedAt
      ? new Date(hook.lastTestedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "";
    return { text: `Live. Last tested ${when}.`, tone: "var(--accent-strong)" };
  }
  if (hook.lastTestOk === false) {
    return {
      text: hook.url
        ? `Last test failed${hook.lastTestStatus ? ` (${hook.lastTestStatus})` : ""}. The saved URL is still in use.`
        : `Last test failed${hook.lastTestStatus ? ` (${hook.lastTestStatus})` : ""}. Nothing is saved.`,
      tone: "#C2410C",
    };
  }
  if (hook.fromEnv) {
    return {
      text: "Running on the environment variable. Test a URL here to take it over.",
      tone: "var(--ink-400)",
    };
  }
  return { text: "Not configured. This hook does not fire.", tone: "#C2410C" };
}

function WebhookCard({ hook }: { hook: WebhookRow }) {
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(hook.url ?? "");
  const [result, setResult] = useState<TestResult | null>(null);

  const status = statusLine(hook);

  const run = (fn: () => Promise<TestResult>) =>
    startTransition(async () => {
      setResult(null);
      setResult(await fn());
    });

  return (
    <Card>
      <CardHeader title={hook.label} hint={hook.key} />
      <div className="flex flex-col gap-3 px-6 py-5">
        {hook.description && (
          <p className="m-0 text-[12.5px] leading-[1.6] text-[var(--ink-300)]">
            {hook.description}
          </p>
        )}

        <p className="m-0 text-[12.5px] font-semibold" style={{ color: status.tone }}>
          {status.text}
        </p>

        {/* Sends that arrived while no URL was saved. Without this the
            only trace was a server log, and a lost confirmation email
            looked identical to one that was never triggered. */}
        {hook.missedCount > 0 && (
          <p className="m-0 rounded-[10px] bg-[#FFF8EE] px-3 py-2 text-[12.5px] leading-[1.55] text-[#8A4B08]">
            <strong>
              {hook.missedCount} {hook.missedCount === 1 ? "send has" : "sends have"} had nowhere to
              go.
            </strong>{" "}
            {hook.lastMissedDetail ? `Most recent: ${hook.lastMissedDetail}.` : null} Saving a URL
            here stops it happening again, but it does not resend what was already missed.
          </p>
        )}

        <label className={labelClass} htmlFor={`hook-${hook.key}`}>
          GoHighLevel inbound webhook URL
        </label>
        <input
          id={`hook-${hook.key}`}
          className={inputClass}
          type="url"
          inputMode="url"
          spellCheck={false}
          placeholder="https://services.leadconnectorhq.com/hooks/..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setResult(null);
          }}
        />

        {result?.ok === true && (
          <p role="status" className="m-0 text-[13px] text-[var(--accent-strong)]">
            Sent, answered {result.status}, and saved. Check {result.sentTo} for whatever the
            workflow sends.
          </p>
        )}
        {result?.ok === false && (
          <p role="alert" className="m-0 text-[13px] text-[#C2410C]">
            {result.error} Nothing was saved.
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            disabled={pending || !value.trim()}
            onClick={() => run(() => testAndSaveWebhook(hook.key, value))}
          >
            {pending ? "Sending…" : "Send test and save"}
          </Button>
          {hook.url && (
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => {
                setValue("");
                run(() => clearWebhook(hook.key));
              }}
            >
              Remove
            </Button>
          )}
        </div>

        <p className="m-0 text-[12px] leading-[1.6] text-[var(--ink-300)]">
          The test sends the real payload — same fields, same names as a live send — with sample
          values and you as the contact, so the workflow runs end to end. The URL is only saved if
          GoHighLevel accepts it.
        </p>
      </div>
    </Card>
  );
}
