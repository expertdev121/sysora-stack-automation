"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, useTransition } from "react";

import { Card, CardHeader, inputClass, labelClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { submitEod } from "@/lib/admin/eod-actions";
import type { ActivityType } from "@/lib/admin/types";

/**
 * The end-of-day report.
 *
 * The whole discipline depends on this taking under a minute. One
 * number per activity the person is assigned, a note if they want one,
 * done. Nothing to choose, nothing to look up.
 *
 * A blank field is not zero. Zero is a real answer that has to be typed,
 * because "nobody said" and "nothing happened" are different facts and
 * the scoreboard reports them differently.
 */

/** One day per report, keyed by date. */
export type RecentReports = Record<string, { notes: string; counts: Record<string, number> }>;

/**
 * Today according to the person filling the form, not the server.
 *
 * The server runs on UTC. Someone in IST filing at 01:00 is on a date
 * UTC hasn't reached, and defaulting to the server's day would quietly
 * file their Tuesday as Monday. Local parts, not toISOString, which
 * would put us straight back on UTC.
 *
 * Read through useSyncExternalStore rather than an effect: the value
 * genuinely differs between server and client, and this is the hook
 * that exists to say so without a second render pass.
 */
function localToday(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** The date only changes at midnight; nothing to subscribe to. */
const noSubscribe = () => () => {};

function shiftDays(date: string, days: number): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function EodForm({
  activities,
  reports,
  serverToday,
  canBackdate,
  forUserId,
  forUserName,
}: {
  activities: ActivityType[];
  /** The last couple of weeks, so changing the date loads that day. */
  reports: RecentReports;
  /** UTC today — the server-render snapshot only. */
  serverToday: string;
  /** Managers and owners may file any day; everyone else gets two. */
  canBackdate: boolean;
  forUserId?: string;
  forUserName?: string;
}) {
  const today = useSyncExternalStore(noSubscribe, localToday, () => serverToday);

  // Null until the person picks one, so the default follows today
  // rather than being frozen at first render.
  const [picked, setPicked] = useState<string | null>(null);
  const reportedOn = picked ?? today;

  const earliest = canBackdate ? null : shiftDays(today, -1);
  const tooOld = earliest !== null && reportedOn < earliest;

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader title={forUserName ? `End of day — ${forUserName}` : "End of day"} />
        <div className="px-6 py-10 text-center text-[15px] leading-[1.7] text-[var(--ink-300)]">
          No activities are assigned {forUserName ? "to them" : "to you"} yet, so there&apos;s
          nothing to report.
          <br />
          {forUserName ? "Assign some under Team." : "Ask an owner to assign yours under Team."}
        </div>
      </Card>
    );
  }

  const existing = reports[reportedOn] ?? null;

  return (
    <Card>
      <CardHeader
        title={forUserName ? `End of day — ${forUserName}` : "End of day"}
        hint={existing ? "This day is already filed — saving updates it" : "Takes about a minute"}
      />
      <div className="flex flex-col gap-5 px-6 py-5">
        <div className="max-w-[220px] flex flex-col gap-[6px]">
          <label htmlFor="eod-date" className={labelClass}>
            Day
          </label>
          <input
            id="eod-date"
            className={inputClass}
            type="date"
            value={reportedOn}
            max={today}
            min={earliest ?? undefined}
            onChange={(e) => setPicked(e.target.value)}
          />
          {tooOld && (
            <p className="m-0 text-[12px] leading-[1.5] text-[var(--warning)]">
              You can change today and yesterday. Ask a manager to fix anything older.
            </p>
          )}
        </div>

        {/* Keyed on the day: picking a different date remounts the
            fields, so each one starts from what that day actually says
            instead of being copied across by an effect. */}
        <DayFields
          key={reportedOn}
          activities={activities}
          existing={existing}
          reportedOn={reportedOn}
          disabled={tooOld}
          forUserId={forUserId}
        />
      </div>
    </Card>
  );
}

function DayFields({
  activities,
  existing,
  reportedOn,
  disabled,
  forUserId,
}: {
  activities: ActivityType[];
  existing: { notes: string; counts: Record<string, number> } | null;
  reportedOn: string;
  disabled: boolean;
  forUserId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [counts, setCounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      activities.map((a) => [
        a.id,
        existing && existing.counts[a.id] !== undefined ? String(existing.counts[a.id]) : "",
      ]),
    ),
  );
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const blanks = activities.filter((a) => !counts[a.id]?.trim());

  function save() {
    setError(null);
    setWarning(null);
    setSaved(false);

    if (blanks.length > 0) {
      setError(
        blanks.length === activities.length
          ? "Put a number against each activity. If you did none, that's a zero."
          : `Still blank: ${blanks.map((a) => a.label).join(", ")}. A zero is an answer; blank isn't.`,
      );
      return;
    }

    startTransition(async () => {
      const result = await submitEod({
        userId: forUserId,
        reportedOn,
        notes,
        counts: activities.map((a) => ({ activityTypeId: a.id, count: Number(counts[a.id]) })),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSaved(true);
      setWarning(result.warning ?? null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex flex-wrap items-center justify-between gap-3">
            <label htmlFor={`count-${activity.id}`} className="flex-1 min-w-[220px]">
              <span className="block text-[14.5px] font-semibold text-[var(--ink-800)]">
                {activity.question}
              </span>
              <span className="block text-[12.5px] text-[var(--ink-300)]">{activity.label}</span>
            </label>
            <input
              id={`count-${activity.id}`}
              className={`${inputClass} w-[120px] font-mono text-[18px] text-center`}
              inputMode="numeric"
              placeholder="0"
              value={counts[activity.id] ?? ""}
              onChange={(e) => {
                const digits = e.target.value.replace(/[^0-9]/g, "");
                setCounts((prev) => ({ ...prev, [activity.id]: digits }));
                setSaved(false);
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-[6px]">
        <label htmlFor="eod-notes" className={labelClass}>
          Anything worth noting? (optional)
        </label>
        <input
          id="eod-notes"
          className={inputClass}
          placeholder="Two promising replies from the Tuesday batch"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved(false);
          }}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="m-0 px-4 py-3 rounded-[10px] bg-[var(--danger-bg)] border-[1.5px] border-[var(--danger-border)] text-[13.5px] text-[var(--danger-600)]"
        >
          {error}
        </p>
      )}

      {warning && (
        <p className="m-0 px-4 py-3 rounded-[10px] bg-[var(--warning-bg)] border-[1.5px] border-[var(--warning-border)] text-[13.5px] leading-[1.6] text-[var(--warning)]">
          Logged — but {warning}
        </p>
      )}

      {saved && !warning && (
        <p className="m-0 px-4 py-3 rounded-[10px] bg-[var(--mint-50)] border-[1.5px] border-[var(--accent)] text-[13.5px] text-[var(--accent-strong)]">
          Logged. The scoreboard has it.
        </p>
      )}

      <div>
        <Button disabled={pending || disabled} onClick={save}>
          {pending ? "Saving…" : existing ? "Update report" : "Submit report"}
        </Button>
      </div>
    </>
  );
}
