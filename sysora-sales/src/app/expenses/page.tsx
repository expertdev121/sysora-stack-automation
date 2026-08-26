import type { Metadata } from "next";

import { BarList, type BarDatum } from "@/components/charts/BarList";
import { RangeFilter } from "@/components/RangeFilter";
import { Shell } from "@/components/Shell";
import { ExpenseTable } from "@/components/ExpenseTable";
import { Card, CardHeader, EmptyState, PageHeading, Stat, Table, Td, Th } from "@/components/ui";
import { requireFinance } from "@/lib/admin/auth";
import type { ActivityEconomics, WorkMetric, SpendCategory } from "@/lib/admin/types";
import { formatMoney } from "@/lib/money";
import { rangeFromParam } from "@/lib/range-options";
import { change, inPrevious, inWindow, loadRange, missing, sumInr } from "@/lib/range";
import { publicDb, salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Expenses" };

export default async function ExpensesPage({
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

  const spent = sumInr(spend);
  const acquisition = sumInr(spend.filter((row) => row.is_acquisition));
  const growth = change(spent, sumInr(before));
  const earned = sumInr(revenue);

  const byCategory = new Map<string, BarDatum>();
  for (const row of spend) {
    const existing = byCategory.get(row.category_key);
    byCategory.set(row.category_key, {
      key: row.category_key,
      label: row.category_label,
      value: (existing?.value ?? 0) + (row.amount_inr ?? 0),
    });
  }

  const [{ data: categories }, { data: activities }, { data: economics }] = await Promise.all([
    db
      .from("spend_categories")
      .select("id, slug, label, is_acquisition, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order"),
    publicDb()
      .from("work_metrics")
      .select("id, slug, label, question, unit, sort_order, is_active, feeds_sales")
      .eq("is_active", true)
      .order("sort_order"),
    db.from("activity_economics").select("*"),
  ]);

  // Only the lead measures that actually had money spent against them.
  const costPerUnit = ((economics ?? []) as ActivityEconomics[]).filter((row) => row.spend_inr > 0);
  const gap = missing(spend);

  return (
    <Shell session={session}>
      <PageHeading eyebrow="Every rupee that leaves" title="Expenses" action={<RangeFilter />} />

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
          sub={`${formatMoney(spent - acquisition)} was running it — salaries, rent, tools`}
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
              appears here, in rupees.
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
                      {formatMoney(row.spend_inr)}
                    </Td>
                    <Td className="[font-variant-numeric:tabular-nums]">
                      {row.achieved.toLocaleString()}
                    </Td>
                    <Td className="font-semibold text-[var(--ink-800)] [font-variant-numeric:tabular-nums]">
                      {row.cost_per_unit_inr === null ? "—" : formatMoney(Math.round(row.cost_per_unit_inr))}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      {gap.count > 0 && (
        <p className="mb-4 px-4 py-3 rounded-[10px] bg-[var(--warning-bg)] border-[1.5px] border-[var(--warning-border)] text-[12.5px] leading-[1.6] text-[var(--warning)]">
          {gap.count} {gap.count === 1 ? "cost has" : "costs have"} no rupee amount yet, so the
          totals above leave {formatMoney(gap.usd, "USD")} out. Open the row and add what actually
          left the account.
        </p>
      )}

      <ExpenseTable
        entries={spend}
        categories={(categories ?? []) as SpendCategory[]}
        activities={(activities ?? []) as WorkMetric[]}
      />
    </Shell>
  );
}
