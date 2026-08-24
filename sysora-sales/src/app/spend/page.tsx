import type { Metadata } from "next";

import { BarList, type BarDatum } from "@/components/charts/BarList";
import { RangeFilter } from "@/components/RangeFilter";
import { Shell } from "@/components/Shell";
import { SpendTable } from "@/components/SpendTable";
import { Card, CardHeader, EmptyState, PageHeading, Stat, Table, Td, Th } from "@/components/ui";
import { requireFinance } from "@/lib/admin/auth";
import type { ActivityEconomics, ActivityType, SpendCategory } from "@/lib/admin/types";
import { formatMoney } from "@/lib/money";
import { rangeFromParam } from "@/lib/range-options";
import { change, inPrevious, inWindow, loadRange, sum } from "@/lib/range";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Spend" };

export default async function SpendPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const session = await requireFinance();
  const { days } = await searchParams;
  const range = await loadRange(rangeFromParam(days));
  const db = salesDb();

  const spend = inWindow(range.spend, "spent_on", range);
  const before = inPrevious(range.spend, "spent_on", range);
  const revenue = inWindow(range.revenue, "earned_on", range);

  const spent = sum(spend);
  const acquisition = sum(spend.filter((row) => row.is_acquisition));
  const growth = change(spent, sum(before));
  const earned = sum(revenue);

  const byCategory = new Map<string, BarDatum>();
  for (const row of spend) {
    const existing = byCategory.get(row.category_key);
    byCategory.set(row.category_key, {
      key: row.category_key,
      label: row.category_label,
      value: (existing?.value ?? 0) + row.amount,
    });
  }

  const [{ data: categories }, { data: activities }, { data: economics }] = await Promise.all([
    db
      .from("spend_categories")
      .select("id, slug, label, is_acquisition, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order"),
    db
      .from("activity_types")
      .select("id, slug, label, question, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order"),
    db.from("activity_economics").select("*"),
  ]);

  // Only the lead measures that actually had money spent against them.
  const costPerUnit = ((economics ?? []) as ActivityEconomics[]).filter((row) => row.spend > 0);

  return (
    <Shell session={session}>
      <PageHeading eyebrow="What winning the work costs" title="Spend" action={<RangeFilter />} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4 mb-8">
        <Stat
          label="Spent"
          value={formatMoney(spent)}
          sub={
            growth === null
              ? "No prior period to compare"
              : `${growth >= 0 ? "▲" : "▼"} ${Math.abs(growth)}% on the previous ${range.days} days`
          }
        />
        <Stat
          label="To win work"
          value={formatMoney(acquisition)}
          sub={`${formatMoney(spent - acquisition)} was running it, not winning it`}
        />
        <Stat
          label="Return"
          value={spent === 0 ? "—" : `${(earned / spent).toFixed(1)}×`}
          tone={spent > 0 && earned < spent ? "warn" : "accent"}
          sub={spent === 0 ? "Nothing spent in this window" : `${formatMoney(earned)} earned`}
        />
        <Stat
          label="Net"
          value={formatMoney(earned - spent)}
          tone={earned - spent < 0 ? "warn" : "plain"}
          sub="Revenue less every cost recorded"
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 mb-8">
        <BarList
          data={[...byCategory.values()]}
          title="Where it went"
          color="var(--series-spend)"
          empty="No spend in this window."
        />

        <Card>
          <CardHeader title="What each one cost" hint="Spend ÷ what it bought" />
          {costPerUnit.length === 0 ? (
            <EmptyState>
              Tag an entry to an activity — Connects to bidding, say — and the cost per bid
              appears here.
            </EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Activity</Th>
                  <Th>Spend</Th>
                  <Th>Done</Th>
                  <Th>Each</Th>
                </tr>
              </thead>
              <tbody>
                {costPerUnit.map((row) => (
                  <tr key={`${row.revenue_target_id}-${row.activity_type_id}`}>
                    <Td className="font-semibold text-[var(--ink-800)]">{row.label}</Td>
                    <Td className="[font-variant-numeric:tabular-nums]">
                      {formatMoney(row.spend)}
                    </Td>
                    <Td className="[font-variant-numeric:tabular-nums]">
                      {row.achieved.toLocaleString()}
                    </Td>
                    <Td className="font-semibold text-[var(--ink-800)] [font-variant-numeric:tabular-nums]">
                      {row.cost_per_unit === null ? "—" : formatMoney(Math.round(row.cost_per_unit))}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      <SpendTable
        entries={spend}
        categories={(categories ?? []) as SpendCategory[]}
        activities={(activities ?? []) as ActivityType[]}
      />
    </Shell>
  );
}
