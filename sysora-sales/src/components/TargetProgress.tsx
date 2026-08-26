import type { ReactNode } from "react";

import { Card, CardHeader, Pill } from "@/components/ui";
import { formatMoney, roundToUnit } from "@/lib/money";
import { cn } from "@/lib/cn";
import { PACE_LABELS, PACE_TONE, type TargetRow } from "@/lib/admin/types";

export function formatDay(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const statusTone = {
  active: "mint",
  upcoming: "slate",
  closed: "slate",
} as const;

const statusLabel = {
  active: "Active",
  upcoming: "Upcoming",
  closed: "Closed",
} as const;

/**
 * Target versus achieved for one window.
 *
 * Every figure here is in the target's own currency and nothing is
 * converted — an INR target counts the rupees somebody typed, a USD one
 * counts dollars. That is also why `unconverted_rows` gets its own line
 * rather than being folded into the total: money we know exists but
 * can't yet count in this currency is a fact worth stating, not a
 * rounding error.
 */
export function TargetProgress({
  target,
  footer,
  compact,
}: {
  target: TargetRow;
  footer?: ReactNode;
  compact?: boolean;
}) {
  const money = (amount: number) => formatMoney(amount, target.currency);
  const over = target.revenue_achieved > target.revenue_target;
  const difference = Math.abs(target.revenue_achieved - target.revenue_target);

  return (
    <Card>
      <CardHeader
        title={target.name ?? `${formatDay(target.starts_on)} — ${formatDay(target.ends_on)}`}
        hint={`${formatDay(target.starts_on)} → ${formatDay(target.ends_on)}`}
      />
      <div className="px-6 py-5">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {target.level === "annual" && <Pill tone="mint">The year</Pill>}
          <Pill tone={statusTone[target.status]}>{statusLabel[target.status]}</Pill>
          {target.status === "active" && target.days_left !== null && (
            <Pill tone={target.days_left <= 7 ? "amber" : "slate"}>
              {target.days_left === 0 ? "Last day" : `${target.days_left} days left`}
            </Pill>
          )}
          <Pill tone={PACE_TONE[target.pace]}>{PACE_LABELS[target.pace]}</Pill>
          {target.is_locked && <Pill tone="slate">Locked</Pill>}
        </div>

        <div className="flex flex-wrap items-end gap-x-8 gap-y-4 mb-5">
          <Figure label="Achieved" value={money(target.revenue_achieved)} accent />
          <Figure label="Target" value={money(target.revenue_target)} />
          <Figure
            label={over ? "Over target" : "Remaining"}
            value={money(over ? difference : target.revenue_remaining)}
          />
          <Figure label="Complete" value={`${target.percent_complete}%`} />
          {target.requests_target !== null && (
            <Figure
              label="Requests"
              value={`${target.requests_actual} / ${target.requests_target}`}
            />
          )}
        </div>

        <div className="relative h-[8px] rounded-full bg-[var(--surface-2)] overflow-hidden">
          <span
            className={cn(
              "absolute inset-y-0 left-0 rounded-full",
              target.percent_complete >= 100
                ? "bg-[linear-gradient(90deg,var(--mint-700),var(--accent))]"
                : "bg-[var(--accent)]",
            )}
            style={{ width: `${Math.min(100, Math.max(0, target.percent_complete))}%` }}
          />
          {target.status === "active" && target.expected_by_today < target.revenue_target && (
            <span
              aria-hidden="true"
              className="absolute inset-y-0 w-[2px] bg-[var(--ink-300)] opacity-50"
              style={{
                left: `${Math.min(100, (target.expected_by_today / target.revenue_target) * 100)}%`,
              }}
            />
          )}
        </div>

        {target.status === "active" && target.revenue_remaining > 0 && (
          <p className="mt-3 mb-0 text-[13px] leading-[1.6] text-[var(--ink-400)]">
            <span className="font-semibold text-[var(--ink-700)]">
              {money(roundToUnit(target.required_per_day))}
            </span>{" "}
            a day for {target.days_remaining} {target.days_remaining === 1 ? "day" : "days"} closes
            the gap. A straight line would have us at{" "}
            <span className="font-semibold">{money(roundToUnit(target.expected_by_today))}</span> by now.
          </p>
        )}

        {!compact && (
          <p className="mt-4 mb-0 text-[13px] text-[var(--ink-300)]">
            <span className="font-semibold text-[var(--ink-600)]">
              {money(target.revenue_stripe)}
            </span>{" "}
            through checkout
            {" · "}
            <span className="font-semibold text-[var(--ink-600)]">
              {money(target.revenue_manual)}
            </span>{" "}
            added by hand
            {target.manual_entries > 0 &&
              ` (${target.manual_entries} ${target.manual_entries === 1 ? "entry" : "entries"})`}
          </p>
        )}

        {/* The honest hole. Counting these as zero would make the total
            look authoritative while being wrong. */}
        {target.unconverted_rows > 0 && (
          <p className="mt-3 mb-0 px-4 py-3 rounded-[10px] bg-[var(--warning-bg)] border-[1.5px] border-[var(--warning-border)] text-[12.5px] leading-[1.6] text-[var(--warning)]">
            {target.unconverted_rows}{" "}
            {target.unconverted_rows === 1 ? "payment isn't" : "payments aren't"} counted yet —
            worth {formatMoney(target.unconverted_usd, "USD")}, with no rupee figure recorded. Add
            what actually landed and they join the total.
          </p>
        )}

        {target.notes && (
          <p className="mt-3 mb-0 text-[13.5px] leading-[1.6] text-[var(--ink-500)]">
            {target.notes}
          </p>
        )}

        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </Card>
  );
}

function Figure({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="m-0 font-mono text-[10px] tracking-[1.4px] uppercase text-[var(--ink-200)]">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 mb-0 text-[26px] font-semibold tracking-[-1px] leading-none",
          accent ? "text-[var(--accent-strong)]" : "text-[var(--ink-900)]",
        )}
      >
        {value}
      </p>
    </div>
  );
}
