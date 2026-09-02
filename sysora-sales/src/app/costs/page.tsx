import type { Metadata } from "next";
import Link from "next/link";

import { CostList, MonthDue } from "@/components/RecurringCosts";
import { Shell } from "@/components/Shell";
import { formatDay } from "@/components/TargetProgress";
import { Card, CardHeader, EmptyState, PageHeading, Stat, Table, Td, Th } from "@/components/ui";
import { requireFinance } from "@/lib/admin/auth";
import { formatMoney } from "@/lib/money";
import type {
  ExpenseRow,
  MonthlyCosts,
  RecurringCharge,
  RecurringCost,
  RunRate,
  SpendCategory,
} from "@/lib/admin/types";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Monthly costs" };

/** First of a month, from ?month=YYYY-MM. Defaults to the current one. */
function monthFromParam(raw: string | undefined): string {
  if (raw && /^\d{4}-\d{2}$/.test(raw)) return `${raw}-01`;
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month: string): string {
  return new Date(month + "T00:00:00Z").toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * What a month costs.
 *
 * Two figures that look like they should agree: what you are committed to, and
 * what actually left the account. Keeping them apart is the whole point — a
 * price rise, a proration or a payment you forgot to record shows up as a gap
 * rather than as a total that is quietly wrong.
 */
export default async function CostsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await requireFinance();
  const { month: raw } = await searchParams;
  const month = monthFromParam(raw);
  const monthKey = month.slice(0, 7);
  const nextMonth = shiftMonth(monthKey, 1) + "-01";
  const db = salesDb();

  const [
    { data: costRows },
    { data: chargeRows },
    { data: summaryRow },
    { data: runRateRow },
    { data: categoryRows },
    { data: expenseRows },
  ] = await Promise.all([
    db.from("recurring_costs").select("*").order("name"),
    db.from("recurring_cost_charges").select("*").eq("month", month).order("due_on"),
    db.from("monthly_costs").select("*").eq("month", month).maybeSingle(),
    db.from("recurring_run_rate").select("*").maybeSingle(),
    db
      .from("spend_categories")
      .select("id, slug, label, is_acquisition, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order"),
    db
      .from("expense_ledger")
      .select("*")
      .gte("spent_on", month)
      .lt("spent_on", nextMonth)
      .order("spent_on", { ascending: false }),
  ]);

  const costs = (costRows ?? []) as RecurringCost[];
  const charges = (chargeRows ?? []) as RecurringCharge[];
  const categories = (categoryRows ?? []) as SpendCategory[];
  const expenses = (expenseRows ?? []) as (ExpenseRow & { recurring_cost_id?: string | null })[];

  const summary = (summaryRow ?? {
    month,
    commitments_due: 0,
    committed_inr: 0,
    committed_usd: 0,
    committed_without_rupees: 0,
    commitments_paid: 0,
    commitments_unpaid: 0,
    expense_rows: 0,
    spent_inr: 0,
    spent_on_recurring_inr: 0,
    spent_one_off_inr: 0,
    spent_without_rupees: 0,
  }) as MonthlyCosts;

  const runRate = (runRateRow ?? {
    running: 0,
    monthly_inr: 0,
    monthly_usd: 0,
    without_rupees: 0,
  }) as RunRate;

  // Which commitments already have a payment recorded inside this month.
  const paidIds = new Set(
    expenses
      .map((e) => e.recurring_cost_id)
      .filter((id): id is string => Boolean(id)),
  );

  const oneOff = expenses.filter((e) => !e.recurring_cost_id);

  return (
    <Shell session={session}>
      <PageHeading
        eyebrow="What it costs to keep the lights on"
        title="Monthly costs"
        action={
          <span className="flex items-center gap-2">
            <Link
              href={`/costs?month=${shiftMonth(monthKey, -1)}`}
              className="px-3 py-[7px] rounded-[9px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] text-[13px] font-semibold text-[var(--ink-600)] no-underline hover:border-[var(--accent)]"
            >
              ←
            </Link>
            <span className="min-w-[130px] text-center text-[14px] font-semibold text-[var(--ink-800)]">
              {monthLabel(month)}
            </span>
            <Link
              href={`/costs?month=${shiftMonth(monthKey, 1)}`}
              className="px-3 py-[7px] rounded-[9px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] text-[13px] font-semibold text-[var(--ink-600)] no-underline hover:border-[var(--accent)]"
            >
              →
            </Link>
          </span>
        }
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4 mb-8">
        <Stat
          label="Due this month"
          value={formatMoney(summary.committed_inr)}
          tone="accent"
          sub={`${summary.commitments_due} ${summary.commitments_due === 1 ? "commitment" : "commitments"}`}
        />
        <Stat
          label="Actually paid"
          value={formatMoney(summary.spent_inr)}
          sub={`${summary.expense_rows} ${summary.expense_rows === 1 ? "entry" : "entries"} recorded`}
        />
        <Stat
          label="One-off"
          value={formatMoney(summary.spent_one_off_inr)}
          sub="Not tied to anything recurring"
        />
        <Stat
          label="Run rate"
          value={formatMoney(runRate.monthly_inr)}
          sub={`${runRate.running} running, yearly plans spread`}
        />
        <Stat
          label="Not yet recorded"
          value={String(summary.commitments_unpaid)}
          sub={
            summary.commitments_unpaid === 0
              ? "Everything due is accounted for"
              : "Due, with no payment logged"
          }
        />
      </div>

      {summary.committed_without_rupees > 0 && (
        <p className="mb-5 px-4 py-3 rounded-[10px] bg-[var(--warning-bg)] border-[1.5px] border-[var(--warning-border)] text-[12.5px] leading-[1.6] text-[var(--warning)]">
          {summary.committed_without_rupees}{" "}
          {summary.committed_without_rupees === 1 ? "commitment has" : "commitments have"} no rupee
          figure, so {summary.committed_without_rupees === 1 ? "it isn't" : "they aren't"} in the
          total above. Add what you expect to be charged and{" "}
          {summary.committed_without_rupees === 1 ? "it joins" : "they join"} it.
        </p>
      )}

      {costs.length === 0 && <CostList costs={costs} categories={categories} />}

      <MonthDue charges={charges} paidIds={paidIds} />

      <Card className="mb-8">
        <CardHeader
          title="Everything else this month"
          hint={`${oneOff.length} one-off ${oneOff.length === 1 ? "entry" : "entries"}`}
        />
        {oneOff.length === 0 ? (
          <EmptyState>
            No one-off spending recorded in {monthLabel(month)}. Add it under{" "}
            <Link href="/expenses" className="font-semibold text-[var(--accent-strong)]">
              Expenses
            </Link>
            .
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Spent</Th>
                <Th>What</Th>
                <Th>Category</Th>
                <Th>Amount</Th>
              </tr>
            </thead>
            <tbody>
              {oneOff.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[var(--surface-1)] transition-colors duration-150"
                >
                  <Td className="whitespace-nowrap text-[13px] text-[var(--ink-500)]">
                    {formatDay(row.spent_on)}
                  </Td>
                  <Td className="font-semibold text-[var(--ink-800)]">
                    {row.description ?? row.paid_to ?? "—"}
                  </Td>
                  <Td className="text-[13px] text-[var(--ink-500)]">{row.category_label}</Td>
                  <Td className="whitespace-nowrap [font-variant-numeric:tabular-nums]">
                    {row.amount_inr === null ? (
                      <span className="text-[13px] font-semibold text-[var(--warning)]">
                        ₹ missing
                      </span>
                    ) : (
                      <span className="font-semibold text-[var(--ink-800)]">
                        {formatMoney(row.amount_inr)}
                      </span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {costs.length > 0 && <CostList costs={costs} categories={categories} />}
    </Shell>
  );
}
