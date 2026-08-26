import type { Metadata } from "next";

import { Shell } from "@/components/Shell";
import { TeamBoard } from "@/components/TeamBoard";
import { PageHeading } from "@/components/ui";
import { requireOwner } from "@/lib/admin/auth";
import type { Profile, Staff, WorkMetric } from "@/lib/admin/types";
import { publicDb, salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Team" };

/**
 * Who works here, what they report, and which login is whose.
 *
 * The employee record is the person — it carries their org, manager and
 * start date, and it is what an end-of-day report hangs off. A dashboard
 * login is a separate thing a person may or may not have, joined here
 * rather than duplicated.
 */
export default async function TeamPage() {
  const session = await requireOwner();

  const [{ data: profiles }, { data: metrics }, { data: assigned }, { data: logins }] =
    await Promise.all([
      publicDb()
        .from("profiles")
        .select("id, org_id, full_name, email, role, manager_id, is_active")
        .order("full_name"),
      publicDb()
        .from("work_metrics")
        .select("id, slug, label, question, unit, sort_order, is_active, feeds_sales")
        .eq("is_active", true)
        .order("sort_order"),
      publicDb().from("profile_metrics").select("profile_id, metric_id"),
      salesDb().from("users").select("*").order("created_at"),
    ]);

  const assignments: Record<string, string[]> = {};
  for (const row of (assigned ?? []) as { profile_id: string; metric_id: string }[]) {
    (assignments[row.profile_id] ??= []).push(row.metric_id);
  }

  return (
    <Shell session={session}>
      <PageHeading eyebrow="Who does what" title="Team" />
      <p className="mt-[-16px] mb-8 max-w-[74ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
        Ticking a metric decides what somebody is asked for at the end of a day and which numbers
        they see progress against. Only profiles whose job is <strong>BDE</strong> count toward
        sales targets for now — one predicate, easy to widen later.
      </p>

      <TeamBoard
        profiles={(profiles ?? []) as Profile[]}
        metrics={(metrics ?? []) as WorkMetric[]}
        assignments={assignments}
        logins={(logins ?? []) as (Staff & { profile_id: string | null })[]}
      />
    </Shell>
  );
}
