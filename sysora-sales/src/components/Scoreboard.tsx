import type { ReactNode } from "react";

import { ActivityProgress } from "@/components/ActivityProgress";
import { TargetProgress } from "@/components/TargetProgress";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { ActivityProgressRow, Pace, TargetRow } from "@/lib/admin/types";

/**
 * The scoreboard.
 *
 * A scoreboard earns its name by answering one question in about three
 * seconds: are we winning? Everything else on the page is detail for
 * whoever wants it, and detail is what the verdict is made of — but the
 * verdict comes first and it comes in words, not in five numbers a
 * person has to compare in their head.
 *
 * Revenue is the lag measure. It reports a week that has already
 * happened. The activities are the lead measures — the things anybody
 * can still change today — which is why they get equal billing rather
 * than a footnote under the money.
 */

type Verdict = "winning" | "at_risk" | "behind" | "closed" | "upcoming";

const VERDICT_COPY: Record<Verdict, { title: string; className: string }> = {
  winning: {
    title: "Winning",
    className: "bg-[var(--mint-50)] border-[var(--accent)] text-[var(--accent-strong)]",
  },
  at_risk: {
    title: "At risk",
    className: "bg-[var(--warning-bg)] border-[var(--warning-border)] text-[var(--warning)]",
  },
  behind: {
    title: "Behind",
    className: "bg-[var(--danger-bg)] border-[var(--danger-border)] text-[var(--danger-600)]",
  },
  closed: {
    title: "Period closed",
    className: "bg-[var(--surface-2)] border-[var(--line-slate)] text-[var(--ink-500)]",
  },
  upcoming: {
    title: "Not started",
    className: "bg-[var(--surface-2)] border-[var(--line-slate)] text-[var(--ink-500)]",
  },
};

const RANK: Record<Pace, number> = {
  behind: 3,
  at_risk: 2,
  missed: 1,
  on_track: 0,
  done: 0,
  upcoming: 0,
};

function verdictFor(target: TargetRow, activities: ActivityProgressRow[]): Verdict {
  if (target.status === "closed") return "closed";
  if (target.status === "upcoming") return "upcoming";

  const worst = [target.pace, ...activities.map((a) => a.pace)].reduce<Pace>(
    (acc, pace) => (RANK[pace] > RANK[acc] ? pace : acc),
    "on_track",
  );

  if (worst === "behind") return "behind";
  if (worst === "at_risk") return "at_risk";
  return "winning";
}

/** Names what is actually dragging, so the verdict is arguable. */
function because(target: TargetRow, activities: ActivityProgressRow[]): string {
  const struggling = activities.filter((a) => a.pace === "behind" || a.pace === "at_risk");
  const revenueShort = target.pace === "behind" || target.pace === "at_risk";

  if (struggling.length === 0 && !revenueShort) {
    return "Revenue and every activity are at or ahead of where a straight line would put them today.";
  }

  const names = struggling.map((a) => a.label);

  if (struggling.length > 0 && revenueShort) {
    return `Revenue is behind pace, and so ${names.length === 1 ? "is" : "are"} ${list(names)}.`;
  }
  if (revenueShort) {
    return activities.length > 0
      ? "Revenue is behind pace even though the activities are holding — the work may not be converting."
      : "Revenue is behind pace.";
  }
  return `${list(names)} ${names.length === 1 ? "is" : "are"} behind pace. Revenue hasn't felt it yet — it will.`;
}

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function Scoreboard({
  target,
  activities,
  mineByType,
  footer,
}: {
  target: TargetRow;
  activities: ActivityProgressRow[];
  /** Activity type id → the viewer's own count, when they have one. */
  mineByType?: Record<string, number>;
  footer?: ReactNode;
}) {
  const verdict = verdictFor(target, activities);
  const copy = VERDICT_COPY[verdict];

  return (
    <div className="flex flex-col gap-5">
      <Card className={cn("px-6 py-5 border-[1.5px]", copy.className)}>
        <p className="m-0 font-mono text-[10px] tracking-[1.6px] uppercase opacity-70">
          {target.name ?? "This period"}
        </p>
        <p className="mt-2 mb-0 text-[30px] font-extrabold tracking-[-0.8px] leading-none">
          {copy.title}
        </p>
        <p className="mt-3 mb-0 max-w-[68ch] text-[13.5px] leading-[1.65] opacity-90">
          {verdict === "closed"
            ? "This period is over. The numbers below are the record, not a forecast."
            : verdict === "upcoming"
              ? "This period hasn't started yet."
              : because(target, activities)}
        </p>
      </Card>

      <TargetProgress target={target} footer={footer} />

      {activities.length > 0 && (
        <div>
          <p className="m-0 mb-3 font-mono text-[10px] tracking-[1.6px] uppercase text-[var(--ink-200)]">
            Lead measures
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {activities.map((row) => (
              <ActivityProgress
                key={row.activity_target_id}
                row={row}
                mine={mineByType ? (mineByType[row.activity_type_id] ?? 0) : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
