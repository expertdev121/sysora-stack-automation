import Link from "next/link";

import { BarList, type BarDatum } from "@/components/charts/BarList";
import { TrendChart } from "@/components/charts/TrendChart";
import { RangeFilter } from "@/components/RangeFilter";
import { Scoreboard } from "@/components/Scoreboard";
import { Shell } from "@/components/Shell";
import { TargetProgress } from "@/components/TargetProgress";
import { Card, PageHeading, Stat } from "@/components/ui";
import { requireFinance } from "@/lib/admin/auth";
import type { ActivityProgressRow, TargetRow } from "@/lib/admin/types";
import { formatMoney } from "@/lib/money";
import { rangeFromParam } from "@/lib/range-options";
import { change, inPrevious, inWindow, loadRange, missing, sumInr } from "@/lib/range";
import { salesDb } from "@/lib/supabase/admin";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const session = await requireFinance();
  const { days } = await searchParams;
  const range = await loadRange(rangeFromParam(days));
  const db = salesDb();

  const revenue = inWindow(range.revenue, "earned_on", range);
  const spend = inWindow(range.spend, "spent_on", range);
  const revenueBefore = inPrevious(range.revenue, "earned_on", range);

  // Rupees throughout. Anything without a rupee figure is counted as
  // missing rather than as zero — see the notice under the hero.
  const earned = sumInr(revenue);
  const spent = sumInr(spend);
  const acquisition = sumInr(spend.filter((row) => row.is_acquisition));
  const net = earned - spent;
  const growth = change(earned, sumInr(revenueBefore));
  const gap = missing(revenue);

  const clients = new Set(revenue.map((row) => row.client ?? "—"));
  const costPerClient = clients.size === 0 ? null : Math.round(acquisition / clients.size);

  const bySource = new Map<string, BarDatum>();
  for (const row of revenue) {
    const existing = bySource.get(row.source_key);
    bySource.set(row.source_key, {
      key: row.source_key,
      label: row.source_label,
      value: (existing?.value ?? 0) + (row.amount_inr ?? 0),
    });
  }

  const byCategory = new Map<string, BarDatum>();
  for (const row of spend) {
    const existing = byCategory.get(row.category_key);
    byCategory.set(row.category_key, {
      key: row.category_key,
      label: row.category_label,
      value: (existing?.value ?? 0) + (row.amount_inr ?? 0),
    });
  }

  // The year, then whatever sprint is running inside it.
  const [{ data: annual }, { data: current }] = await Promise.all([
    db
      .from("target_progress")
      .select("*")
      .eq("level", "annual")
      .eq("status", "active")
      .maybeSingle(),
    db
      .from("target_progress")
      .select("*")
      .eq("level", "sprint")
      .eq("status", "active")
      .order("starts_on", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const year = annual as TargetRow | null;
  const sprint = current as TargetRow | null;

  const { data: leadMeasures } = sprint
    ? await db
        .from("activity_progress")
        .select("*")
        .eq("revenue_target_id", sprint.id)
        .order("sort_order", { ascending: true })
    : { data: [] };

  return (
    <Shell session={session}>
      <PageHeading
        eyebrow={`${range.days} days to ${new Date(range.to + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
        title="Overview"
        action={<RangeFilter />}
      />

      {/* One hero per view: the number the rest of the page explains. */}
      <Card className="px-7 py-6 mb-5">
        <p className="m-0 font-mono text-[10px] tracking-[1.6px] uppercase text-[var(--ink-200)]">
          Revenue
        </p>
        <p className="mt-2 mb-0 text-[48px] font-semibold tracking-[-1.6px] leading-none text-[var(--ink-900)]">
          {formatMoney(earned)}
        </p>
        <p className="mt-3 mb-0 text-[13.5px] leading-[1.6] text-[var(--ink-400)]">
          {growth === null ? (
            <>No prior {range.days}-day period to compare against.</>
          ) : (
            <>
              <span
                className={
                  growth >= 0
                    ? "font-semibold text-[var(--mint-700)]"
                    : "font-semibold text-[var(--danger-600)]"
                }
              >
                {growth >= 0 ? "▲" : "▼"} {Math.abs(growth)}%
              </span>{" "}
              against the previous {range.days} days
            </>
          )}
          {" · "}
          {clients.size} {clients.size === 1 ? "client" : "clients"}
        </p>

        {gap.count > 0 && (
          <p className="mt-4 mb-0 px-4 py-3 rounded-[10px] bg-[var(--warning-bg)] border-[1.5px] border-[var(--warning-border)] text-[12.5px] leading-[1.6] text-[var(--warning)]">
            {gap.count} {gap.count === 1 ? "payment is" : "payments are"} missing from that figure —{" "}
            {formatMoney(gap.usd, "USD")} with no rupee amount recorded yet.{" "}
            <Link href="/revenue" className="font-semibold underline">
              Add what landed
            </Link>{" "}
            and they join the total.
          </p>
        )}
      </Card>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4 mb-8">
        <Stat
          label="Spend"
          value={formatMoney(spent)}
          sub={`${formatMoney(acquisition)} of it to win work`}
        />
        <Stat
          label="Net"
          value={formatMoney(net)}
          tone={net < 0 ? "warn" : "accent"}
          sub={spent === 0 ? "Nothing spent yet" : `${(earned / spent).toFixed(1)}× return`}
        />
        <Stat
          label="Cost per client"
          value={costPerClient === null ? "—" : formatMoney(costPerClient)}
          sub={
            costPerClient === null
              ? "No clients in this window"
              : `${formatMoney(acquisition)} ÷ ${clients.size}`
          }
        />
        <Stat label="Days covered" value={String(range.days)} sub={`${range.from} → ${range.to}`} />
      </div>

      {year && (
        <div className="mb-8">
          <p className="m-0 mb-3 font-mono text-[10px] tracking-[1.6px] uppercase text-[var(--ink-200)]">
            The year
          </p>
          <TargetProgress
            target={year}
            footer={
              <Link href="/targets" className="text-[13px] font-semibold text-[var(--accent-strong)]">
                Every target →
              </Link>
            }
          />
        </div>
      )}

      <div className="mb-8">
        <TrendChart points={range.daily} title="Revenue and spend" />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 mb-10">
        <BarList
          data={[...bySource.values()]}
          title="Where revenue came from"
          empty="No revenue with a rupee figure in this window."
        />
        <BarList
          data={[...byCategory.values()]}
          title="What it cost"
          color="var(--series-spend)"
          empty="No spend recorded in this window."
        />
      </div>

      {sprint ? (
        <Scoreboard
          target={sprint}
          activities={(leadMeasures ?? []) as ActivityProgressRow[]}
          footer={
            <Link href="/targets" className="text-[13px] font-semibold text-[var(--accent-strong)]">
              Adjust targets →
            </Link>
          }
        />
      ) : (
        <Card className="px-6 py-10 text-center text-[15px] text-[var(--ink-300)]">
          No sprint is running today.{" "}
          <Link href="/targets" className="font-semibold text-[var(--accent-strong)]">
            Set one
          </Link>{" "}
          and this page starts telling you whether you&apos;re winning the week, not just the year.
        </Card>
      )}
    </Shell>
  );
}
