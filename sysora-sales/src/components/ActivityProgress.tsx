import { Card, Pill } from "@/components/ui";
import { cn } from "@/lib/cn";
import { PACE_LABELS, PACE_TONE, type ActivityProgressRow } from "@/lib/admin/types";

/**
 * One lead measure.
 *
 * Deliberately smaller than the revenue card: there are several of
 * these, and the point is to read the whole row in one glance rather
 * than study any single one.
 *
 * `mine` is the viewer's own contribution. A BDE needs to see both his
 * number and the team's, because the target is shared — knowing the
 * team is at 78 of 100 is what tells him whether to push today.
 */
export function ActivityProgress({
  row,
  mine,
}: {
  row: ActivityProgressRow;
  mine?: number | null;
}) {
  const pct = Math.min(100, Math.max(0, row.percent_complete));
  const short = row.status === "active" && row.achieved < row.expected_by_today;

  return (
    <Card className="px-5 py-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="m-0 text-[14px] font-bold text-[var(--ink-900)] truncate">{row.label}</p>
          {!row.type_is_active && (
            <p className="mt-[2px] mb-0 text-[11.5px] text-[var(--ink-200)]">Retired activity</p>
          )}
        </div>
        <Pill tone={PACE_TONE[row.pace]}>{PACE_LABELS[row.pace]}</Pill>
      </div>

      <p className="m-0 font-mono text-[24px] font-semibold tracking-[-0.8px] leading-none text-[var(--ink-900)]">
        {row.achieved.toLocaleString()}
        <span className="text-[15px] font-medium text-[var(--ink-200)]">
          {" / "}
          {row.target_count.toLocaleString()}
        </span>
      </p>

      <div className="relative h-[6px] rounded-full bg-[var(--surface-2)] overflow-hidden mt-3 mb-3">
        <span
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            pct >= 100
              ? "bg-[linear-gradient(90deg,var(--mint-700),var(--accent))]"
              : short
                ? "bg-[var(--warning)]"
                : "bg-[var(--accent)]",
          )}
          style={{ width: `${pct}%` }}
        />
        {/* Where a straight line would have us today. */}
        {row.status === "active" && row.expected_by_today < row.target_count && (
          <span
            aria-hidden="true"
            className="absolute inset-y-0 w-[2px] bg-[var(--ink-300)] opacity-50"
            style={{
              left: `${Math.min(100, (row.expected_by_today / row.target_count) * 100)}%`,
            }}
          />
        )}
      </div>

      <p className="m-0 text-[12.5px] leading-[1.6] text-[var(--ink-400)]">
        {row.status === "closed" ? (
          row.remaining === 0 ? (
            <>Finished the period on target.</>
          ) : (
            <>{row.remaining.toLocaleString()} short when the period closed.</>
          )
        ) : row.remaining === 0 ? (
          <>Target met with {row.days_left ?? row.days_total} days to spare.</>
        ) : (
          <>
            <span className="font-semibold text-[var(--ink-700)]">
              {row.remaining.toLocaleString()} to go
            </span>
            {" · "}
            <span className="font-semibold text-[var(--ink-700)]">
              {row.required_per_day.toLocaleString()}/day
            </span>{" "}
            for {row.days_remaining} {row.days_remaining === 1 ? "day" : "days"}
          </>
        )}
      </p>

      {typeof mine === "number" && (
        <p className="mt-2 mb-0 text-[12.5px] text-[var(--ink-400)]">
          Your share:{" "}
          <span className="font-mono font-semibold text-[var(--accent-strong)]">
            {mine.toLocaleString()}
          </span>
          {row.contributors > 1 && (
            <span className="text-[var(--ink-200)]">
              {" "}
              · {row.contributors} people contributing
            </span>
          )}
        </p>
      )}
    </Card>
  );
}
