"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { formatDay } from "@/components/TargetProgress";
import { Button, Card, CardHeader, inputClass, labelClass } from "@/components/ui";
import { setAcquisitionBudget } from "@/lib/admin/acquisition-actions";
import { formatMoney, roundToUnit } from "@/lib/money";
import type { AcquisitionProgress } from "@/lib/admin/types";

/**
 * The acquisition budget, and how it is burning.
 *
 * Paced like the revenue target, but read the opposite way. On rent you want
 * to come in under; here, underspending usually means bids are not going out,
 * and an unspent budget is work you did not compete for. So being behind is
 * flagged as loudly as being over.
 */
export function AcquisitionBudget({ progress }: { progress: AcquisitionProgress }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(
    progress.acquisition_budget === null ? "" : String(progress.acquisition_budget / 100),
  );
  const [error, setError] = useState<string | null>(null);

  const budget = progress.acquisition_budget;
  const spent = progress.spent_inr;
  const expected = progress.expected_by_today_inr;

  const pace: "none" | "under" | "on" | "over" =
    budget === null || expected === null
      ? "none"
      : spent > budget
        ? "over"
        : spent < expected * 0.75
          ? "under"
          : "on";

  const paceCopy: Record<typeof pace, string> = {
    none: "",
    under: `Behind on spend — a straight line would have you at ${formatMoney(roundToUnit(expected ?? 0))} by now. Unspent budget is work you didn't bid for.`,
    on: `Tracking the window. A straight line puts you at ${formatMoney(roundToUnit(expected ?? 0))} by today.`,
    over: `Over budget by ${formatMoney(spent - (budget ?? 0))}.`,
  };

  const paceTone: Record<typeof pace, string> = {
    none: "",
    under: "text-[var(--warning)]",
    on: "text-[var(--mint-700)]",
    over: "text-[var(--danger-600)]",
  };

  function save() {
    setError(null);
    startTransition(async () => {
      const trimmed = value.trim();
      const result = await setAcquisitionBudget(
        progress.revenue_target_id,
        trimmed === "" ? null : Number(trimmed),
      );
      if (result.ok) {
        setEditing(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Card className="mb-8">
      {/* CardHeader hides `hint` whenever an action is present, so the window
          travels with the button rather than being silently dropped. */}
      <CardHeader
        title="Client acquisition"
        action={
          <span className="flex flex-wrap items-center gap-3">
            <span className="text-[12.5px] text-[var(--ink-300)]">
              {progress.name ?? "This window"} · {formatDay(progress.starts_on)} →{" "}
              {formatDay(progress.ends_on)}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setEditing((v) => !v)}>
              {editing ? "Cancel" : budget === null ? "Set a budget" : "Change budget"}
            </Button>
          </span>
        }
      />

      <div className="px-6 py-5">
        {editing ? (
          <div className="mb-5 flex flex-wrap items-end gap-3 rounded-[10px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-1)] p-4">
            <div className="flex flex-col gap-[4px]">
              <label className={labelClass}>Budget for this window (₹)</label>
              <input
                className={`${inputClass} w-[180px]`}
                inputMode="decimal"
                autoFocus
                placeholder="20000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <Button size="sm" disabled={pending} onClick={save}>
              {pending ? "Saving…" : "Save"}
            </Button>
            <p className="m-0 max-w-[40ch] text-[12px] leading-[1.6] text-[var(--ink-300)]">
              Rupees, even though this target&rsquo;s revenue goal is in{" "}
              {progress.currency}. Spend leaves the account in rupees, so the budget
              measuring it is in rupees. Clear the box to remove the budget.
            </p>
            {error && (
              <p role="alert" className="m-0 text-[12.5px] text-[var(--danger-600)]">
                {error}
              </p>
            )}
          </div>
        ) : null}

        {budget === null ? (
          <p className="m-0 max-w-[70ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
            No budget set for this window. Set one and every connect spent bidding is
            counted against it as the bids go out — you&rsquo;ll see what&rsquo;s left
            without waiting for a card statement.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-5">
              <Figure label="Budget" value={formatMoney(budget)} />
              <Figure label="Spent" value={formatMoney(spent)} tone="accent" />
              <Figure
                label="Left"
                value={formatMoney(progress.remaining_inr ?? 0)}
              />
              <Figure
                label="Used"
                value={`${progress.percent_used ?? 0}%`}
              />
            </div>

            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500"
                style={{ width: `${Math.min(progress.percent_used ?? 0, 100)}%` }}
              />
            </div>

            {pace !== "none" && (
              <p className={`mt-3 mb-0 text-[13px] leading-[1.7] ${paceTone[pace]}`}>
                {paceCopy[pace]}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t-[1.5px] border-[var(--border-faint)] pt-4">
              <Split label="Connects" value={formatMoney(progress.connects_cost_inr)} />
              <Split label="Everything else" value={formatMoney(progress.other_acquisition_inr)} />
              <Split label="Proposals" value={String(progress.proposals)} />
              <Split
                label="Win rate"
                value={
                  progress.win_rate_percent === null
                    ? "—"
                    : `${progress.win_rate_percent}% (${progress.proposals_won})`
                }
              />
              <Split
                label="Cost per win"
                value={
                  progress.cost_per_win_inr === null
                    ? "—"
                    : formatMoney(progress.cost_per_win_inr)
                }
              />
            </div>

            {progress.other_rows_without_rupees > 0 && (
              <p className="mt-4 mb-0 px-4 py-3 rounded-[10px] bg-[var(--warning-bg)] border-[1.5px] border-[var(--warning-border)] text-[12.5px] leading-[1.6] text-[var(--warning)]">
                {progress.other_rows_without_rupees} acquisition{" "}
                {progress.other_rows_without_rupees === 1 ? "expense has" : "expenses have"} no
                rupee figure, so {progress.other_rows_without_rupees === 1 ? "it isn't" : "they aren't"}{" "}
                in the total above.
              </p>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

function Figure({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "accent";
}) {
  return (
    <div>
      <p className="m-0 font-mono text-[10px] tracking-[1.4px] uppercase text-[var(--ink-200)]">
        {label}
      </p>
      <p
        className={`mt-1 mb-0 text-[26px] font-extrabold leading-none tracking-[-0.6px] [font-variant-numeric:tabular-nums] ${
          tone === "accent" ? "text-[var(--accent-strong)]" : "text-[var(--ink-900)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Split({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="m-0 font-mono text-[10px] tracking-[1.4px] uppercase text-[var(--ink-200)]">
        {label}
      </p>
      <p className="mt-1 mb-0 text-[15px] font-semibold text-[var(--ink-800)] [font-variant-numeric:tabular-nums]">
        {value}
      </p>
    </div>
  );
}
