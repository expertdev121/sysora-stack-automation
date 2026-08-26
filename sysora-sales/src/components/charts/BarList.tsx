"use client";

import { useState } from "react";

import { Card, CardHeader, EmptyState } from "@/components/ui";
import { formatMoney, type Currency } from "@/lib/money";

/**
 * Composition — where a total came from, biggest first.
 *
 * One series, so one colour for every bar. Colouring each bar
 * darker-where-bigger would double-encode the length as hue and burn
 * the only free channel on information the bar already shows.
 *
 * No legend either: with a single series the title already says what is
 * plotted, and a one-swatch box just restates it.
 */

export type BarDatum = {
  key: string;
  label: string;
  value: number;
  /** Optional second line under the label — a count, a note. */
  meta?: string;
};

export function BarList({
  data,
  title,
  hint,
  color = "var(--series-revenue)",
  currency = "INR",
  empty = "Nothing here yet.",
}: {
  data: BarDatum[];
  title: string;
  hint?: string;
  color?: string;
  currency?: Currency;
  empty?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const rows = [...data].filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
  const total = rows.reduce((sum, d) => sum + d.value, 0);
  const max = rows.reduce((m, d) => Math.max(m, d.value), 0);

  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader title={title} hint={hint} />
        <EmptyState>{empty}</EmptyState>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title={title} hint={hint ?? formatMoney(total, currency)} />
      <ul className="m-0 list-none px-6 py-5 flex flex-col gap-4">
        {rows.map((row) => {
          const share = total === 0 ? 0 : Math.round((row.value / total) * 100);
          return (
            <li
              key={row.key}
              // The hit area is the whole row, not the bar — a 10px-tall
              // mark is not something to ask anyone to land on.
              onMouseEnter={() => setHovered(row.key)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-default"
            >
              <div className="flex items-baseline justify-between gap-4 mb-[6px]">
                <span className="text-[13.5px] font-semibold text-[var(--ink-800)] truncate">
                  {row.label}
                </span>
                <span className="text-[13px] whitespace-nowrap text-[var(--ink-600)] [font-variant-numeric:tabular-nums]">
                  {formatMoney(row.value, currency)}
                  <span className="ml-2 text-[var(--ink-200)]">{share}%</span>
                </span>
              </div>

              {/* Bar caps at 10px and grows from a single baseline; the
                  4px radius sits on the data end only. */}
              <div className="h-[10px] w-full rounded-[3px] bg-[var(--surface-2)] overflow-hidden">
                <div
                  className="h-full rounded-r-[4px] transition-[width,opacity] duration-200"
                  style={{
                    width: `${max === 0 ? 0 : Math.max(2, (row.value / max) * 100)}%`,
                    background: color,
                    opacity: hovered === null || hovered === row.key ? 1 : 0.45,
                  }}
                />
              </div>

              {row.meta && (
                <p className="mt-[6px] mb-0 text-[12px] text-[var(--ink-300)]">{row.meta}</p>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
