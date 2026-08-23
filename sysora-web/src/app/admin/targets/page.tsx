import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { ManualRevenueTable, type WindowLookup } from "@/components/admin/ManualRevenueTable";
import { TargetEditor } from "@/components/admin/TargetEditor";
import { formatDay } from "@/components/admin/TargetProgress";
import { Card, PageHeading } from "@/components/admin/ui";
import { canDeleteTarget, requireFinance } from "@/lib/admin/auth";
import type {
  ActivityProgressRow,
  ActivityType,
  ManualRevenueRow,
  TargetRow,
  UnattributedRevenue,
} from "@/lib/admin/types";
import { formatMoney } from "@/lib/money";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Targets" };

export default async function TargetsPage() {
  const session = await requireFinance();
  const db = salesDb();

  const [{ data: targets }, { data: entries }, { data: outside }, { data: types }, { data: attached }] =
    await Promise.all([
      db.from("target_progress").select("*").order("starts_on", { ascending: false }),
      db.from("manual_revenue").select("*").order("earned_on", { ascending: false }).limit(500),
      db.from("unattributed_revenue").select("*").maybeSingle(),
      db
        .from("activity_types")
        .select("id, slug, label, question, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      db.from("activity_progress").select("*").order("sort_order", { ascending: true }),
    ]);

  const rows = (targets ?? []) as TargetRow[];
  const manual = (entries ?? []) as ManualRevenueRow[];
  const unattributed = (outside ?? { revenue_stripe: 0, revenue_manual: 0 }) as UnattributedRevenue;

  const windows: WindowLookup = rows.map((target) => ({
    id: target.id,
    name: target.name ?? `${formatDay(target.starts_on)} — ${formatDay(target.ends_on)}`,
    starts_on: target.starts_on,
    ends_on: target.ends_on,
  }));

  const outsideTotal = unattributed.revenue_stripe + unattributed.revenue_manual;

  // Grouped by target so each card gets only its own lead measures.
  const activityTargets: Record<string, ActivityProgressRow[]> = {};
  for (const row of (attached ?? []) as ActivityProgressRow[]) {
    (activityTargets[row.revenue_target_id] ??= []).push(row);
  }

  return (
    <AdminShell session={session}>
      <PageHeading eyebrow="Revenue" title="Targets" />
      <p className="mt-[-16px] mb-8 max-w-[72ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
        A target runs between two dates. Every payment that succeeds in that window counts toward
        it, along with anything you add by hand below. Windows can&apos;t overlap, so each day
        belongs to exactly one target and no money is counted twice.
      </p>

      <TargetEditor
        targets={rows}
        activityTypes={(types ?? []) as ActivityType[]}
        activityTargets={activityTargets}
        canDelete={canDeleteTarget(session.role)}
      />

      {outsideTotal > 0 && (
        <Card className="mt-8">
          <div className="px-6 py-5">
            <p className="m-0 font-mono text-[10px] tracking-[1.4px] uppercase text-[var(--ink-200)]">
              Outside every target
            </p>
            <p className="mt-2 mb-0 font-mono text-[24px] font-semibold tracking-[-0.8px] leading-none text-[var(--ink-900)]">
              {formatMoney(outsideTotal)}
            </p>
            <p className="mt-2 mb-0 text-[13px] text-[var(--ink-300)]">
              {formatMoney(unattributed.revenue_stripe)} through checkout ·{" "}
              {formatMoney(unattributed.revenue_manual)} added manually. Real revenue that no
              target window covers — create a target over those dates to count it.
            </p>
          </div>
        </Card>
      )}

      <div className="mt-10">
        <h2 className="mt-0 mb-2 text-[20px] font-extrabold tracking-[-0.4px] text-[var(--ink-900)]">
          Clients from outside the checkout
        </h2>
        <p className="mt-0 mb-5 max-w-[72ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
          Upwork and other outside work never touches Stripe, so it&apos;s recorded here. Each
          entry counts toward whichever target covers the date it was earned.
        </p>
        <ManualRevenueTable entries={manual} windows={windows} />
      </div>
    </AdminShell>
  );
}
