import type { Metadata } from "next";

import { BarList, type BarDatum } from "@/components/charts/BarList";
import { ManualRevenueTable, type WindowLookup } from "@/components/ManualRevenueTable";
import { RangeFilter } from "@/components/RangeFilter";
import { Shell } from "@/components/Shell";
import { formatDay } from "@/components/TargetProgress";
import { Card, CardHeader, EmptyState, PageHeading, Pill, Stat, Table, Td, Th } from "@/components/ui";
import { requireFinance } from "@/lib/admin/auth";
import type { ManualRevenueRow, TargetRow } from "@/lib/admin/types";
import { formatMoney } from "@/lib/money";
import { rangeFromParam } from "@/lib/range-options";
import { change, inPrevious, inWindow, loadRange, missing, sumInr, sumUsd } from "@/lib/range";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Revenue" };

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const session = await requireFinance();
  const { days } = await searchParams;
  const range = await loadRange(rangeFromParam(days));
  const db = salesDb();

  const revenue = inWindow(range.revenue, "earned_on", range);
  const before = inPrevious(range.revenue, "earned_on", range);

  // Rupees are the total. Dollars are shown beside a row, never added
  // into it — see `missing` for what that leaves out.
  const earned = sumInr(revenue);
  const growth = change(earned, sumInr(before));
  const checkout = sumInr(revenue.filter((row) => row.stream === "checkout"));
  const manual = earned - checkout;
  const gap = missing(revenue);
  const invoiced = sumUsd(revenue);

  const bySource = new Map<string, BarDatum>();
  const byClient = new Map<string, BarDatum>();

  for (const row of revenue) {
    const source = bySource.get(row.source_key);
    bySource.set(row.source_key, {
      key: row.source_key,
      label: row.source_label,
      value: (source ?? { value: 0 }).value + (row.amount_inr ?? 0),
    });

    const who = row.client ?? "Unnamed";
    const client = byClient.get(who);
    if (client) {
      client.value += row.amount_inr ?? 0;
    } else {
      byClient.set(who, { key: who, label: who, value: row.amount_inr ?? 0 });
    }
  }

  const [{ data: entries }, { data: targets }] = await Promise.all([
    db.from("manual_revenue").select("*").order("earned_on", { ascending: false }).limit(500),
    db.from("target_progress").select("*").order("starts_on", { ascending: false }),
  ]);

  const windows: WindowLookup = ((targets ?? []) as TargetRow[]).map((target) => ({
    id: target.id,
    name: target.name ?? `${formatDay(target.starts_on)} — ${formatDay(target.ends_on)}`,
    starts_on: target.starts_on,
    ends_on: target.ends_on,
  }));

  return (
    <Shell session={session}>
      <PageHeading eyebrow="Where the money came from" title="Revenue" action={<RangeFilter />} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4 mb-8">
        <Stat
          label="Earned"
          value={formatMoney(earned)}
          tone="accent"
          sub={
            growth === null
              ? "No prior period to compare"
              : `${growth >= 0 ? "▲" : "▼"} ${Math.abs(growth)}% on the previous ${range.days} days`
          }
        />
        <Stat
          label="Through the checkout"
          value={formatMoney(checkout)}
          sub={`${revenue.filter((r) => r.stream === "checkout").length} payments`}
        />
        <Stat
          label="Outside it"
          value={formatMoney(manual)}
          sub="Upwork and direct, entered by hand"
        />
        <Stat
          label="Invoiced in dollars"
          value={formatMoney(invoiced, "USD")}
          sub="What was billed, before it became rupees"
        />
        <Stat label="Clients" value={String(byClient.size)} sub="Distinct, however they paid" />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 mb-8">
        <BarList
          data={[...bySource.values()]}
          title="By source"
          empty="No revenue in this window."
        />
        <BarList
          data={[...byClient.values()].slice(0, 8)}
          title="By client"
          empty="No revenue in this window."
        />
      </div>

      {gap.count > 0 && (
        <p className="mb-5 px-4 py-3 rounded-[10px] bg-[var(--warning-bg)] border-[1.5px] border-[var(--warning-border)] text-[12.5px] leading-[1.6] text-[var(--warning)]">
          {gap.count} {gap.count === 1 ? "payment has" : "payments have"} no rupee figure yet, so
          they are not in any total above — {formatMoney(gap.usd, "USD")} between them. Stripe
          settles days after the charge, so its rupees only exist once the payout lands.
        </p>
      )}

      <Card className="mb-10">
        <CardHeader title="Every payment" hint={`${revenue.length} in this window`} />
        {revenue.length === 0 ? (
          <EmptyState>Nothing earned in this window.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Earned</Th>
                <Th>Client</Th>
                <Th>Source</Th>
                <Th>How</Th>
                <Th>Amount</Th>
              </tr>
            </thead>
            <tbody>
              {revenue.map((row) => (
                <tr
                  key={`${row.stream}-${row.id}`}
                  className="hover:bg-[var(--surface-1)] transition-colors duration-150"
                >
                  <Td className="whitespace-nowrap text-[13px] text-[var(--ink-500)]">
                    {formatDay(row.earned_on)}
                  </Td>
                  <Td className="font-semibold text-[var(--ink-800)]">{row.client ?? "—"}</Td>
                  <Td>
                    <Pill tone="slate">{row.source_label}</Pill>
                  </Td>
                  <Td>
                    <Pill tone={row.stream === "checkout" ? "mint" : "slate"}>
                      {row.stream === "checkout" ? "Checkout" : "By hand"}
                    </Pill>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {row.amount_inr === null ? (
                      <span className="text-[13px] font-semibold text-[var(--warning)]">
                        ₹ pending
                      </span>
                    ) : (
                      <span className="font-semibold text-[var(--ink-800)] [font-variant-numeric:tabular-nums]">
                        {formatMoney(row.amount_inr)}
                      </span>
                    )}
                    {row.amount_usd !== null && (
                      <span className="block text-[12px] text-[var(--ink-300)] [font-variant-numeric:tabular-nums]">
                        {formatMoney(row.amount_usd, "USD")}
                      </span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <div>
        <h2 className="mt-0 mb-2 text-[20px] font-extrabold tracking-[-0.4px] text-[var(--ink-900)]">
          Clients from outside the checkout
        </h2>
        <p className="mt-0 mb-5 max-w-[72ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
          Upwork and direct work never touches Stripe, so it&apos;s recorded here. Put in the
          rupees that actually landed — that is what a rupee target counts. The dollar figure is
          optional and is only ever shown beside it, never converted.
        </p>
        <ManualRevenueTable entries={(entries ?? []) as ManualRevenueRow[]} windows={windows} />
      </div>
    </Shell>
  );
}
