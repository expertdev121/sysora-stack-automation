import "server-only";

import { salesDb } from "@/lib/supabase/admin";
import type { DailyMoney, RevenueLedgerRow, SpendLedgerRow } from "@/lib/admin/types";

/**
 * One slice of time, loaded once.
 *
 * Every figure on a page comes out of this, so the stat tiles, the
 * chart and the breakdowns can't end up answering slightly different
 * questions — which is what happens when each card fetches its own.
 */

export type MoneyRange = {
  days: number;
  from: string;
  to: string;
  /** The equal-length window immediately before, for the comparison. */
  previousFrom: string;
  revenue: RevenueLedgerRow[];
  spend: SpendLedgerRow[];
  daily: DailyMoney[];
};

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shift(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return isoDay(d);
}

export async function loadRange(days: number): Promise<MoneyRange> {
  const db = salesDb();
  const to = isoDay(new Date());
  // Inclusive of both ends, so "7 days" really is seven.
  const from = shift(to, -(days - 1));
  const previousFrom = shift(from, -days);

  const [{ data: revenue }, { data: spend }, { data: daily }] = await Promise.all([
    db
      .from("revenue_ledger")
      .select("*")
      .gte("earned_on", previousFrom)
      .lte("earned_on", to)
      .order("earned_on", { ascending: false }),
    db
      .from("spend_ledger")
      .select("*")
      .gte("spent_on", previousFrom)
      .lte("spent_on", to)
      .order("spent_on", { ascending: false }),
    db.from("daily_money").select("*").gte("day", from).lte("day", to).order("day"),
  ]);

  return {
    days,
    from,
    to,
    previousFrom,
    revenue: (revenue ?? []) as RevenueLedgerRow[],
    spend: (spend ?? []) as SpendLedgerRow[],
    daily: (daily ?? []) as DailyMoney[],
  };
}

/** Rows inside the current window, not the comparison one. */
export function inWindow<T extends { [k: string]: unknown }>(
  rows: T[],
  field: keyof T,
  range: MoneyRange,
): T[] {
  return rows.filter((row) => {
    const day = row[field] as unknown as string;
    return day >= range.from && day <= range.to;
  });
}

/** Rows in the equal-length window immediately before it. */
export function inPrevious<T extends { [k: string]: unknown }>(
  rows: T[],
  field: keyof T,
  range: MoneyRange,
): T[] {
  return rows.filter((row) => {
    const day = row[field] as unknown as string;
    return day >= range.previousFrom && day < range.from;
  });
}

export function sum(rows: { amount: number }[]): number {
  return rows.reduce((total, row) => total + row.amount, 0);
}

/**
 * Percentage change, or null when there's nothing to compare against.
 *
 * Growth from zero is not "infinite" or "100%" — it's a number nobody
 * should be shown, so the caller gets null and says "no prior period".
 */
export function change(now: number, before: number): number | null {
  if (before === 0) return null;
  return Math.round(((now - before) / before) * 100);
}
