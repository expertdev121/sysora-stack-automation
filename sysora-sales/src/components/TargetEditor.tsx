"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Card, CardHeader, inputClass, labelClass, Pill } from "@/components/ui";
import { TargetProgress, formatDay } from "@/components/TargetProgress";
import { Button } from "@/components/ui";
import { saveActivityTargets } from "@/lib/admin/activity-actions";
import { deleteRevenueTarget, saveRevenueTarget } from "@/lib/admin/revenue-actions";
import type {
  ActivityProgressRow,
  ActivityType,
  TargetLevel,
  TargetRow,
} from "@/lib/admin/types";
import type { Currency } from "@/lib/money";

/**
 * Targets as date ranges of any length.
 *
 * The database refuses overlapping windows, so the error surfaced here
 * comes from the constraint rather than a check this component has to
 * remember to run.
 */
export function TargetEditor({
  targets,
  activityTypes,
  activityTargets,
  canDelete,
}: {
  targets: TargetRow[];
  /** Every live lead measure, so a target can put a number on any of them. */
  activityTypes: ActivityType[];
  /** What each target already asks for, keyed by target id. */
  activityTargets: Record<string, ActivityProgressRow[]>;
  canDelete: boolean;
}) {
  const [creating, setCreating] = useState(false);

  const annual = targets.filter((t) => t.level === "annual");
  const sprints = targets.filter((t) => t.level === "sprint");
  const active = sprints.filter((t) => t.status === "active");
  const upcoming = sprints.filter((t) => t.status === "upcoming");
  const closed = sprints.filter((t) => t.status === "closed");

  return (
    <div className="flex flex-col gap-6">
      {creating ? (
        <TargetForm activityTypes={activityTypes} onDone={() => setCreating(false)} />
      ) : (
        <div>
          <Button size="sm" variant="ghost" onClick={() => setCreating(true)}>
            New target
          </Button>
        </div>
      )}

      {targets.length === 0 && !creating && (
        <Card>
          <div className="px-6 py-10 text-center text-[15px] text-[var(--ink-300)]">
            No targets yet. Set one and every payment inside its dates counts toward it.
          </div>
        </Card>
      )}

      <Group
        title="The year"
        targets={annual}
        activityTypes={activityTypes}
        activityTargets={activityTargets}
        canDelete={canDelete}
      />
      <Group
        title="Active"
        targets={active}
        activityTypes={activityTypes}
        activityTargets={activityTargets}
        canDelete={canDelete}
      />
      <Group
        title="Upcoming"
        targets={upcoming}
        activityTypes={activityTypes}
        activityTargets={activityTargets}
        canDelete={canDelete}
      />
      <Group
        title="Closed"
        targets={closed}
        activityTypes={activityTypes}
        activityTargets={activityTargets}
        canDelete={canDelete}
      />
    </div>
  );
}

function Group({
  title,
  targets,
  activityTypes,
  activityTargets,
  canDelete,
}: {
  title: string;
  targets: TargetRow[];
  activityTypes: ActivityType[];
  activityTargets: Record<string, ActivityProgressRow[]>;
  canDelete: boolean;
}) {
  if (targets.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <p className="m-0 font-mono text-[10px] tracking-[1.6px] uppercase text-[var(--ink-200)]">
        {title}
      </p>
      {targets.map((target) => (
        <TargetCard
          key={target.id}
          target={target}
          activityTypes={activityTypes}
          activities={activityTargets[target.id] ?? []}
          canDelete={canDelete}
        />
      ))}
    </section>
  );
}

function TargetCard({
  target,
  activityTypes,
  activities,
  canDelete,
}: {
  target: TargetRow;
  activityTypes: ActivityType[];
  activities: ActivityProgressRow[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <TargetForm
        target={target}
        activityTypes={activityTypes}
        activities={activities}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <TargetProgress
        target={target}
        footer={
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Edit
            </Button>
            {canDelete &&
              (confirming ? (
                <>
                  <span className="text-[13px] text-[var(--ink-500)]">Delete this target?</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await deleteRevenueTarget(target.id);
                        if (result.ok) router.refresh();
                        else setError(result.error);
                        setConfirming(false);
                      })
                    }
                  >
                    {pending ? "Deleting…" : "Yes, delete"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                    Keep
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
                  Delete
                </Button>
              ))}
          </div>
        }
      />
      {error && (
        <p role="alert" className="m-0 text-[13px] text-[var(--danger-600)]">
          {error}
        </p>
      )}
    </div>
  );
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function TargetForm({
  target,
  activityTypes,
  activities,
  onDone,
}: {
  target?: TargetRow;
  activityTypes: ActivityType[];
  activities?: ActivityProgressRow[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(target?.name ?? "");
  const [level, setLevel] = useState<TargetLevel>(target?.level ?? "sprint");
  const [currency, setCurrency] = useState<Currency>(target?.currency ?? "INR");
  const [isLocked, setIsLocked] = useState(target?.is_locked ?? false);
  const [startsOn, setStartsOn] = useState(target?.starts_on ?? todayISO());
  const [endsOn, setEndsOn] = useState(target?.ends_on ?? "");
  const [amount, setAmount] = useState(
    target ? (target.revenue_target / 100).toString() : "",
  );
  const [requests, setRequests] = useState(target?.requests_target?.toString() ?? "");
  const [notes, setNotes] = useState(target?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  // Lead measures, blank meaning "not on this target".
  const [counts, setCounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      activityTypes.map((type) => {
        const existing = activities?.find((a) => a.activity_type_id === type.id);
        return [type.id, existing ? String(existing.target_count) : ""];
      }),
    ),
  );

  // Adding a measure to a period already under way starts it in a hole:
  // the days before today have no reports for it and never will.
  const started = target ? target.status !== "upcoming" : false;
  const addingLate =
    started &&
    activityTypes.some(
      (type) =>
        counts[type.id]?.trim() &&
        !activities?.some((a) => a.activity_type_id === type.id),
    );

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveRevenueTarget({
        id: target?.id,
        name,
        level,
        currency,
        startsOn,
        endsOn,
        revenueTarget: Number(amount || 0),
        requestsTarget: requests.trim() ? Number(requests) : null,
        notes,
        isLocked,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      // Two writes, because the lead measures need the target's id and a
      // new target hasn't got one until it exists. If this second call
      // fails the target is still saved — so the message says so rather
      // than implying nothing happened.
      if (result.id && activityTypes.length > 0) {
        const attached = await saveActivityTargets(
          result.id,
          activityTypes.map((type) => ({
            activityTypeId: type.id,
            targetCount: counts[type.id]?.trim() ? Number(counts[type.id]) : 0,
          })),
        );

        if (!attached.ok) {
          setError(`The target was saved, but its activities weren't: ${attached.error}`);
          router.refresh();
          return;
        }
      }

      router.refresh();
      onDone();
    });
  }

  return (
    <Card>
      <CardHeader title={target ? "Edit target" : "New target"} />
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          <div className="flex flex-col gap-[6px]">
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              placeholder="Q3 push"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className={labelClass}>Starts</label>
            <input
              className={inputClass}
              type="date"
              value={startsOn}
              disabled={Boolean(target?.is_locked)}
              onChange={(e) => setStartsOn(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className={labelClass}>Ends</label>
            <input
              className={inputClass}
              type="date"
              value={endsOn}
              min={startsOn}
              disabled={Boolean(target?.is_locked)}
              onChange={(e) => setEndsOn(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          <div className="flex flex-col gap-[6px]">
            <label className={labelClass}>What kind</label>
            <select
              className={inputClass}
              value={level}
              disabled={Boolean(target?.is_locked)}
              onChange={(e) => setLevel(e.target.value as TargetLevel)}
            >
              <option value="sprint">A sprint</option>
              <option value="annual">The financial year</option>
            </select>
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className={labelClass}>Counted in</label>
            <select
              className={inputClass}
              value={currency}
              disabled={Boolean(target?.is_locked)}
              onChange={(e) => setCurrency(e.target.value as Currency)}
            >
              <option value="INR">Rupees</option>
              <option value="USD">Dollars</option>
            </select>
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className={labelClass}>
              Revenue target ({currency === "INR" ? "₹" : "$"})
            </label>
            <input
              className={inputClass}
              inputMode="decimal"
              placeholder={currency === "INR" ? "6000000" : "10000"}
              value={amount}
              disabled={Boolean(target?.is_locked)}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className={labelClass}>Requests target (optional)</label>
            <input
              className={inputClass}
              inputMode="numeric"
              placeholder="—"
              value={requests}
              onChange={(e) => setRequests(e.target.value)}
            />
          </div>
        </div>

        {activityTypes.length > 0 && (
          <div className="pt-1 border-t-[1.5px] border-[var(--border-faint)]">
            <p className="mt-4 mb-1 font-mono text-[10px] tracking-[1.6px] uppercase text-[var(--ink-200)]">
              Lead measures
            </p>
            <p className="mt-0 mb-4 max-w-[64ch] text-[12.5px] leading-[1.6] text-[var(--ink-300)]">
              The money is what already happened. These are what produce it — one shared number per
              activity for the whole period, not a number each. Leave blank to skip one.
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
              {activityTypes.map((type) => (
                <div key={type.id} className="flex flex-col gap-[6px]">
                  <label className={labelClass}>{type.label}</label>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="—"
                    value={counts[type.id] ?? ""}
                    onChange={(e) =>
                      setCounts((prev) => ({
                        ...prev,
                        [type.id]: e.target.value.replace(/[^0-9]/g, ""),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
            {addingLate && (
              <p className="mt-3 mb-0 px-4 py-3 rounded-[10px] bg-[var(--warning-bg)] border-[1.5px] border-[var(--warning-border)] text-[12.5px] leading-[1.6] text-[var(--warning)]">
                This period has already started. A measure added now counts only from today, so it
                will read as behind for the days nobody was recording it.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Note (optional)</label>
          <input
            className={inputClass}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <label className="flex items-start gap-3 text-[13px] leading-[1.6] text-[var(--ink-500)]">
          <input
            type="checkbox"
            className="mt-[3px] accent-[var(--accent)]"
            checked={isLocked}
            onChange={(e) => setIsLocked(e.target.checked)}
          />
          <span>
            <span className="font-semibold text-[var(--ink-700)]">Lock this target.</span> The
            amount, dates and currency stop being editable — the note and the requests goal don&apos;t.
            Only an owner can unlock it, and the unlock is recorded.
          </span>
        </label>

        {target?.is_locked && (
          <p className="m-0 px-4 py-3 rounded-[10px] bg-[var(--surface-2)] border-[1.5px] border-[var(--line-slate)] text-[12.5px] leading-[1.6] text-[var(--ink-500)]">
            This target is locked, so its amount, dates and currency are fixed. That is the point
            of locking: the number people plan against does not move under them.
          </p>
        )}

        {startsOn && endsOn && endsOn >= startsOn && (
          <p className="m-0 text-[12.5px] text-[var(--ink-300)]">
            {formatDay(startsOn)} → {formatDay(endsOn)} ·{" "}
            {Math.round(
              (new Date(endsOn + "T00:00:00").getTime() -
                new Date(startsOn + "T00:00:00").getTime()) /
                86_400_000,
            ) + 1}{" "}
            days
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="m-0 px-4 py-3 rounded-[10px] bg-[var(--danger-bg)] border-[1.5px] border-[var(--danger-border)] text-[13.5px] text-[var(--danger-600)]"
          >
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button size="sm" disabled={pending} onClick={save}>
            {pending ? "Saving…" : target ? "Save changes" : "Create target"}
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={onDone}>
            Cancel
          </Button>
          {target && <Pill tone="slate">{formatDay(target.starts_on)}</Pill>}
        </div>
      </div>
    </Card>
  );
}
