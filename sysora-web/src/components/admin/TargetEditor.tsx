"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Card, CardHeader, inputClass, labelClass, Pill } from "@/components/admin/ui";
import { TargetProgress, formatDay } from "@/components/admin/TargetProgress";
import { Button } from "@/components/ui/Button";
import { deleteRevenueTarget, saveRevenueTarget } from "@/lib/admin/revenue-actions";
import type { TargetRow } from "@/lib/admin/types";

/**
 * Targets as date ranges of any length.
 *
 * The database refuses overlapping windows, so the error surfaced here
 * comes from the constraint rather than a check this component has to
 * remember to run.
 */
export function TargetEditor({
  targets,
  canDelete,
}: {
  targets: TargetRow[];
  canDelete: boolean;
}) {
  const [creating, setCreating] = useState(false);

  const active = targets.filter((t) => t.status === "active");
  const upcoming = targets.filter((t) => t.status === "upcoming");
  const closed = targets.filter((t) => t.status === "closed");

  return (
    <div className="flex flex-col gap-6">
      {creating ? (
        <TargetForm onDone={() => setCreating(false)} />
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

      <Group title="Active" targets={active} canDelete={canDelete} />
      <Group title="Upcoming" targets={upcoming} canDelete={canDelete} />
      <Group title="Closed" targets={closed} canDelete={canDelete} />
    </div>
  );
}

function Group({
  title,
  targets,
  canDelete,
}: {
  title: string;
  targets: TargetRow[];
  canDelete: boolean;
}) {
  if (targets.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <p className="m-0 font-mono text-[10px] tracking-[1.6px] uppercase text-[var(--ink-200)]">
        {title}
      </p>
      {targets.map((target) => (
        <TargetCard key={target.id} target={target} canDelete={canDelete} />
      ))}
    </section>
  );
}

function TargetCard({ target, canDelete }: { target: TargetRow; canDelete: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return <TargetForm target={target} onDone={() => setEditing(false)} />;
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

function TargetForm({ target, onDone }: { target?: TargetRow; onDone: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(target?.name ?? "");
  const [startsOn, setStartsOn] = useState(target?.starts_on ?? todayISO());
  const [endsOn, setEndsOn] = useState(target?.ends_on ?? "");
  const [amount, setAmount] = useState(
    target ? (target.revenue_target / 100).toString() : "",
  );
  const [requests, setRequests] = useState(target?.requests_target?.toString() ?? "");
  const [notes, setNotes] = useState(target?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveRevenueTarget({
        id: target?.id,
        name,
        startsOn,
        endsOn,
        revenueTarget: Number(amount || 0),
        requestsTarget: requests.trim() ? Number(requests) : null,
        notes,
      });
      if (result.ok) {
        router.refresh();
        onDone();
      } else {
        setError(result.error);
      }
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
              onChange={(e) => setEndsOn(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          <div className="flex flex-col gap-[6px]">
            <label className={labelClass}>Revenue target (USD)</label>
            <input
              className={inputClass}
              inputMode="decimal"
              placeholder="10000"
              value={amount}
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

        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Note (optional)</label>
          <input
            className={inputClass}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

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
