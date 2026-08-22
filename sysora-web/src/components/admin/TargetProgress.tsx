import type { ReactNode } from "react";

import { Card, CardHeader } from "@/components/admin/ui";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/cn";
import type { TargetRow } from "@/lib/admin/types";

const monthName = (period: string) =>
  new Date(period + "T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });

/** Target versus actual for one month. Super admin only — this is revenue. */
export function TargetProgress({
  target,
  footer,
}: {
  target: TargetRow;
  footer?: ReactNode;
}) {
  const hasTarget = target.revenue_target > 0;
  const pct = hasTarget
    ? Math.min(200, Math.round((target.revenue_actual / target.revenue_target) * 100))
    : 0;
  const remaining = Math.max(0, target.revenue_target - target.revenue_actual);

  return (
    <Card>
      <CardHeader title={`Target · ${monthName(target.period_start)}`} hint={hasTarget ? `${pct}% of target` : "No target set"} />
      <div className="px-6 py-5">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-3 mb-5">
          <div>
            <p className="m-0 font-mono text-[10px] tracking-[1.4px] uppercase text-[var(--ink-200)]">
              Booked
            </p>
            <p className="mt-1 mb-0 font-mono text-[28px] font-semibold tracking-[-1px] leading-none text-[var(--accent-strong)]">
              {formatMoney(target.revenue_actual)}
            </p>
          </div>
          <div>
            <p className="m-0 font-mono text-[10px] tracking-[1.4px] uppercase text-[var(--ink-200)]">
              Target
            </p>
            <p className="mt-1 mb-0 font-mono text-[28px] font-semibold tracking-[-1px] leading-none text-[var(--ink-900)]">
              {hasTarget ? formatMoney(target.revenue_target) : "—"}
            </p>
          </div>
          {hasTarget && (
            <div>
              <p className="m-0 font-mono text-[10px] tracking-[1.4px] uppercase text-[var(--ink-200)]">
                {remaining > 0 ? "To go" : "Over"}
              </p>
              <p className="mt-1 mb-0 font-mono text-[28px] font-semibold tracking-[-1px] leading-none text-[var(--ink-900)]">
                {formatMoney(remaining > 0 ? remaining : target.revenue_actual - target.revenue_target)}
              </p>
            </div>
          )}
          <div>
            <p className="m-0 font-mono text-[10px] tracking-[1.4px] uppercase text-[var(--ink-200)]">
              Requests
            </p>
            <p className="mt-1 mb-0 font-mono text-[28px] font-semibold tracking-[-1px] leading-none text-[var(--ink-900)]">
              {target.requests_actual}
              {target.requests_target ? (
                <span className="text-[15px] text-[var(--ink-300)]"> / {target.requests_target}</span>
              ) : null}
            </p>
          </div>
        </div>

        {hasTarget && (
          <div className="relative h-[8px] rounded-full bg-[var(--surface-2)] overflow-hidden">
            <span
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-[width] duration-500",
                pct >= 100
                  ? "bg-[linear-gradient(90deg,var(--mint-700),var(--accent))]"
                  : "bg-[var(--accent)]",
              )}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        )}

        {target.notes && (
          <p className="mt-4 mb-0 text-[13.5px] leading-[1.6] text-[var(--ink-500)]">{target.notes}</p>
        )}

        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </Card>
  );
}
