import type { ReactNode } from "react";

import { Card, CardHeader, Pill } from "@/components/admin/ui";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/cn";
import type { TargetRow } from "@/lib/admin/types";

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

/** Target versus achieved for one window. Finance roles only. */
export function TargetProgress({
  target,
  footer,
  compact,
}: {
  target: TargetRow;
  footer?: ReactNode;
  compact?: boolean;
}) {
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
          <Pill tone={statusTone[target.status]}>{statusLabel[target.status]}</Pill>
          {target.status === "active" && target.days_left !== null && (
            <Pill tone={target.days_left <= 7 ? "amber" : "slate"}>
              {target.days_left === 0 ? "Last day" : `${target.days_left} days left`}
            </Pill>
          )}
          {target.status === "closed" && (
            <Pill tone={target.percent_complete >= 100 ? "mint" : "slate"}>
              {target.percent_complete >= 100 ? "Target met" : "Ended short"}
            </Pill>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-x-8 gap-y-4 mb-5">
          <Figure label="Achieved" value={formatMoney(target.revenue_achieved)} accent />
          <Figure label="Target" value={formatMoney(target.revenue_target)} />
          <Figure
            label={over ? "Over target" : "Remaining"}
            value={formatMoney(over ? difference : target.revenue_remaining)}
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
        </div>

        {!compact && (
          <p className="mt-4 mb-0 text-[13px] text-[var(--ink-300)]">
            <span className="font-mono text-[var(--ink-600)]">
              {formatMoney(target.revenue_stripe)}
            </span>{" "}
            through checkout
            {" · "}
            <span className="font-mono text-[var(--ink-600)]">
              {formatMoney(target.revenue_manual)}
            </span>{" "}
            added manually
            {target.manual_entries > 0 &&
              ` (${target.manual_entries} ${target.manual_entries === 1 ? "entry" : "entries"})`}
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

function Figure({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="m-0 font-mono text-[10px] tracking-[1.4px] uppercase text-[var(--ink-200)]">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 mb-0 font-mono text-[26px] font-semibold tracking-[-1px] leading-none",
          accent ? "text-[var(--accent-strong)]" : "text-[var(--ink-900)]",
        )}
      >
        {value}
      </p>
    </div>
  );
}
