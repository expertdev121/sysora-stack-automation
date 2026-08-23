import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeading } from "@/components/admin/ui";
import { TeamManager } from "@/components/admin/TeamManager";
import { requireOwner } from "@/lib/admin/auth";
import type { ActivityType, Staff } from "@/lib/admin/types";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Team" };

export default async function StaffPage() {
  const session = await requireOwner();
  const db = salesDb();

  const [{ data }, { data: types }, { data: assigned }] = await Promise.all([
    db.from("users").select("*").order("created_at"),
    db
      .from("activity_types")
      .select("id, slug, label, question, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    db.from("user_activities").select("user_id, activity_type_id"),
  ]);

  const assignments: Record<string, string[]> = {};
  for (const row of (assigned ?? []) as { user_id: string; activity_type_id: string }[]) {
    (assignments[row.user_id] ??= []).push(row.activity_type_id);
  }

  return (
    <AdminShell session={session}>
      <PageHeading eyebrow="Who can get in" title="Team" />
      <p className="mt-[-16px] mb-8 max-w-[70ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
        Inviting someone hands you a link for them to set their own password — nobody, including
        you, ever types a teammate&apos;s password. &ldquo;Reports on&rdquo; decides what their daily
        form asks and which lead measures they can see; someone with nothing ticked has nothing to
        report.
      </p>
      <TeamManager
        staff={(data ?? []) as Staff[]}
        activityTypes={(types ?? []) as ActivityType[]}
        assignments={assignments}
        currentUserId={session.userId}
      />
    </AdminShell>
  );
}
