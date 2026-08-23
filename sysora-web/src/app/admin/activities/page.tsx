import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { ActivityTypeEditor } from "@/components/admin/ActivityTypeEditor";
import { PageHeading } from "@/components/admin/ui";
import { requireOwner } from "@/lib/admin/auth";
import type { ActivityType } from "@/lib/admin/types";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Activities" };

export default async function ActivitiesPage() {
  const session = await requireOwner();

  const { data } = await salesDb()
    .from("activity_types")
    .select("id, slug, label, question, sort_order, is_active")
    .order("is_active", { ascending: false })
    .order("sort_order", { ascending: true });

  return (
    <AdminShell session={session}>
      <PageHeading eyebrow="Configure" title="Activities" />
      <p className="mt-[-16px] mb-8 max-w-[72ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
        These are the lead measures — the things somebody can still change today, unlike revenue,
        which only reports a week that already happened. Each one becomes a question on the daily
        report and a number you can set against any target.
      </p>

      <ActivityTypeEditor types={(data ?? []) as ActivityType[]} />
    </AdminShell>
  );
}
