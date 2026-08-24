"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";
import { RANGES, rangeFromParam } from "@/lib/range-options";

/**
 * One filter row, above everything it scopes.
 *
 * Not a control per card: every figure and every chart on the page
 * re-renders against the same slice, so two numbers on one screen can
 * never be answering different questions.
 *
 * It writes to the query string rather than local state, so a view is a
 * URL somebody can send to somebody else.
 */

export function RangeFilter() {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = rangeFromParam(params.get("days") ?? undefined);

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-[12px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)]">
      {RANGES.map((range) => {
        const active = range.days === current;
        return (
          <Link
            key={range.days}
            href={`${pathname}?days=${range.days}`}
            aria-current={active ? "true" : undefined}
            className={cn(
              "px-3 py-[6px] rounded-[9px] text-[13px] font-semibold no-underline transition-colors duration-150",
              active
                ? "bg-[var(--mint-50)] text-[var(--accent-strong)]"
                : "text-[var(--ink-300)] hover:text-[var(--ink-700)] hover:bg-[var(--surface-2)]",
            )}
          >
            {range.label}
          </Link>
        );
      })}
    </div>
  );
}
