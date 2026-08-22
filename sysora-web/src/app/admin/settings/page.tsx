import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeading } from "@/components/admin/ui";
import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { requireStaff } from "@/lib/admin/auth";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requireStaff();
  const db = salesDb();

  const { data } = await db.from("settings").select("*").order("key");
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
    </AdminShell>
  );
}
