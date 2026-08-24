import Link from "next/link";

import { BarList, type BarDatum } from "@/components/charts/BarList";
import { TrendChart } from "@/components/charts/TrendChart";
import { RangeFilter } from "@/components/RangeFilter";
import { Scoreboard } from "@/components/Scoreboard";
import { Shell } from "@/components/Shell";
import { Card, PageHeading, Stat } from "@/components/ui";
import { requireFinance } from "@/lib/admin/auth";
import type { ActivityProgressRow, TargetRow } from "@/lib/admin/types";
import { formatMoney } from "@/lib/money";
import { rangeFromParam } from "@/lib/range-options";
import { change, inPrevious, inWindow, loadRange, sum } from "@/lib/range";
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

  const earned = sum(revenue);
  const spent = sum(spend);
  const acquisition = sum(spend.filter((row) => row.is_acquisition));
  const net = earned - spent;
  const growth = change(earned, sum(revenueBefore));

  // A client is a client whichever door they came through, so the
  // checkout customer and the hand-entered name are counted once each.
  const clients = new Set(revenue.map((row) => row.client ?? "—"));
  const costPerClient = clients.size === 0 ? null : Math.round(acquisition / clients.size);

  const bySource = new Map<string, BarDatum>();
  for (const row of revenue) {
    const existing = bySource.get(row.source_key);
    bySource.set(row.source_key, {
      key: row.source_key,
      label: row.source_label,
      value: (existing?.value ?? 0) + row.amount,
    });
  }

  const byCategory = new Map<string, BarDatum>();
  for (const row of spend) {
    const existing = byCategory.get(row.category_key);
    byCategory.set(row.category_key, {
      key: row.category_key,
      label: row.category_label,
      value: (existing?.value ?? 0) + row.amount,
    });
  }

  // Whatever is running today, so the page answers "are we winning"
  // and not only "what did we bank".
  const { data: current } = await db
    .from("target_progress")
    .select("*")
    .eq("status", "active")
    .order("starts_on", { ascending: false })
    .limit(1)
    .maybeSingle();

  const target = current as TargetRow | null;

  const { data: leadMeasures } = target
    ? await db
        .from("activity_progress")
        .select("*")
        .eq("revenue_target_id", target.id)
        .order("sort_order", { ascending: true })
    : { data: [] };

  return (
    <Shell session={session}>
      <PageHeading
        eyebrow={`${range.days} days to ${new Date(range.to + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short" })}`}
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
                  growth >= 0 ? "font-semibold text-[var(--mint-700)]" : "font-semibold text-[var(--danger-600)]"
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
      </Card>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4 mb-8">
        <Stat label="Spend" value={formatMoney(spent)} sub={`${formatMoney(acquisition)} of it to win work`} />
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
        <Stat
          label="Days covered"
          value={String(range.days)}
          sub={`${range.from} → ${range.to}`}
        />
      </div>

      <div className="mb-8">
        <TrendChart points={range.daily} title="Revenue and spend" />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 mb-10">
        <BarList
          data={[...bySource.values()]}
          title="Where revenue came from"
          empty="No revenue in this window."
        />
        <BarList
          data={[...byCategory.values()]}
          title="What it cost"
          color="var(--series-spend)"
          empty="No spend recorded in this window."
        />
      </div>

      {target ? (
        <Scoreboard
          target={target}
          activities={(leadMeasures ?? []) as ActivityProgressRow[]}
          footer={
            <Link href="/targets" className="text-[13px] font-semibold text-[var(--accent-strong)]">
              Adjust targets →
            </Link>
          }
        />
      ) : (
        <Card className="px-6 py-10 text-center text-[15px] text-[var(--ink-300)]">
          No target is running today.{" "}
          <Link href="/targets" className="font-semibold text-[var(--accent-strong)]">
            Set one
          </Link>{" "}
          and this page starts telling you whether you&apos;re winning.
        </Card>
      )}
    </Shell>
  );
}
