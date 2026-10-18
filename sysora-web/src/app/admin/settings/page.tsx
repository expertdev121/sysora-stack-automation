import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeading } from "@/components/admin/ui";
import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { WebhookSettings } from "@/components/admin/WebhookSettings";
import { requirePipeline } from "@/lib/admin/auth";
import { listWebhooks } from "@/lib/sales/webhooks";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requirePipeline();
  const db = salesDb();

  const [{ data }, webhooks] = await Promise.all([
    db.from("settings").select("*").order("key"),
    listWebhooks(),
  ]);
  const settings = (data ?? []) as {
    key: string;
    value: unknown;
    label: string | null;
    description: string | null;
    is_public: boolean;
  }[];

  return (
    <AdminShell session={session}>
      <PageHeading eyebrow="Links and copy" title="Settings" />
      <p className="mt-[-16px] mb-8 max-w-[70ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
        Your booking and calendar links live here, so changing where a call gets booked never needs
        a deploy.
      </p>
      <SettingsEditor settings={settings} />

      <h2 className="mt-12 mb-2 font-display text-[20px] font-bold text-[var(--ink-900)]">
        Outbound webhooks
      </h2>
      <p className="mb-6 max-w-[70ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
        Where the site posts when a checkout is abandoned and when a payment goes through. Paste a
        GoHighLevel inbound-webhook URL and send a test: the URL is saved only once GoHighLevel has
        accepted a real payload, so a hook that is listed here is a hook that has worked.
      </p>
      <WebhookSettings webhooks={webhooks} />
    </AdminShell>
  );
}
