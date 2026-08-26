"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  Card,
  CardHeader,
  EmptyState,
  Pill,
  Table,
  Td,
  Th,
  inputClass,
  labelClass,
} from "@/components/ui";
import { formatDay } from "@/components/TargetProgress";
import { Button } from "@/components/ui";
import {
  deleteManualRevenue,
  findMatchingContact,
  saveManualRevenue,
} from "@/lib/admin/revenue-actions";
import { formatMoney, impliedRate } from "@/lib/money";
import { SOURCE_LABELS, type ManualRevenueRow, type RevenueSource } from "@/lib/admin/types";

/** Which target's window a given date falls inside, for display. */
export type WindowLookup = { id: string; name: string; starts_on: string; ends_on: string }[];

function targetFor(windows: WindowLookup, day: string) {
  return windows.find((w) => day >= w.starts_on && day <= w.ends_on) ?? null;
}

export function ManualRevenueTable({
  entries,
  windows,
}: {
  entries: ManualRevenueRow[];
  windows: WindowLookup;
}) {
  const [adding, setAdding] = useState(false);
  // Rupees only. An entry with no rupee figure is unknown, not zero.
  const total = entries.reduce((sum, entry) => sum + (entry.amount_inr ?? 0), 0);
  const pending = entries.filter((entry) => entry.amount_inr === null).length;

  return (
    <div className="flex flex-col gap-4">
      {adding ? (
        <EntryForm windows={windows} onDone={() => setAdding(false)} />
      ) : (
        <div>
          <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>
            Add client revenue
          </Button>
        </div>
      )}

      <Card>
        <CardHeader
          title="Outside the checkout"
          hint={
            entries.length
              ? `${entries.length} ${entries.length === 1 ? "entry" : "entries"} · ${formatMoney(total)}${pending ? ` · ${pending} awaiting rupees` : ""}`
              : "None yet"
          }
        />
        {entries.length === 0 ? (
          <EmptyState>
            Upwork and other outside clients go here. They count toward whichever target covers
            the date.
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Source</Th>
                <Th>Earned</Th>
                <Th>Counts toward</Th>
                <Th>Amount</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <EntryRow key={entry.id} entry={entry} windows={windows} />
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function EntryRow({ entry, windows }: { entry: ManualRevenueRow; windows: WindowLookup }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <tr>
        <Td className="p-0" />
        <td colSpan={5} className="p-0">
          <div className="px-6 py-4">
            <EntryForm entry={entry} windows={windows} onDone={() => setEditing(false)} inline />
          </div>
        </td>
      </tr>
    );
  }

  const window = targetFor(windows, entry.earned_on);

  return (
    <tr className="hover:bg-[var(--surface-1)] transition-colors duration-150">
      <Td>
        <span className="block font-semibold text-[var(--ink-800)]">{entry.client_name}</span>
        {entry.description && (
          <span className="block text-[12.5px] text-[var(--ink-300)]">{entry.description}</span>
        )}
      </Td>
      <Td>
        <Pill tone="slate">{SOURCE_LABELS[entry.source]}</Pill>
      </Td>
      <Td className="whitespace-nowrap text-[13px] text-[var(--ink-500)]">
        {formatDay(entry.earned_on)}
      </Td>
      <Td className="whitespace-nowrap">
        {window ? (
          <Pill tone="mint">{window.name}</Pill>
        ) : (
          <span className="text-[13px] text-[var(--ink-100)]">No target</span>
        )}
      </Td>
      <Td className="whitespace-nowrap">
        {entry.amount_inr === null ? (
          <span className="text-[13px] font-semibold text-[var(--warning)]">₹ pending</span>
        ) : (
          <span className="font-semibold text-[var(--ink-800)] [font-variant-numeric:tabular-nums]">
            {formatMoney(entry.amount_inr, "INR")}
          </span>
        )}
        {entry.amount_usd !== null && (
          <span className="block text-[12px] text-[var(--ink-300)] [font-variant-numeric:tabular-nums]">
            {formatMoney(entry.amount_usd, "USD")}
            {entry.amount_inr !== null && (
              <> · ₹{impliedRate(entry.amount_usd, entry.amount_inr)}/$</>
            )}
          </span>
        )}
      </Td>
      <Td>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Edit
          </Button>
          {confirming ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await deleteManualRevenue(entry.id);
                    if (result.ok) router.refresh();
                    else setError(result.error);
                    setConfirming(false);
                  })
                }
              >
                {pending ? "Removing…" : "Confirm"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                Keep
              </Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
              Remove
            </Button>
          )}
        </div>
        {error && (
          <p role="alert" className="mt-1 mb-0 text-[12.5px] text-[var(--danger-600)]">
            {error}
          </p>
        )}
      </Td>
    </tr>
  );
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function EntryForm({
  entry,
  windows,
  onDone,
  inline,
}: {
  entry?: ManualRevenueRow;
  windows: WindowLookup;
  onDone: () => void;
  inline?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [clientName, setClientName] = useState(entry?.client_name ?? "");
  const [source, setSource] = useState<RevenueSource>(entry?.source ?? "upwork");
  const [description, setDescription] = useState(entry?.description ?? "");
  const [amountUsd, setAmountUsd] = useState(
    entry?.amount_usd != null ? (entry.amount_usd / 100).toString() : "",
  );
  const [amountInr, setAmountInr] = useState(
    entry?.amount_inr != null ? (entry.amount_inr / 100).toString() : "",
  );
  const [earnedOn, setEarnedOn] = useState(entry?.earned_on ?? todayISO());
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<string | null>(null);

  const window = targetFor(windows, earnedOn);

  // Advisory only: a client who also paid through the checkout would be
  // counted twice, and no constraint can tell the difference.
  function checkForDuplicate(name: string) {
    if (name.trim().length < 3) {
      setDuplicate(null);
      return;
    }
    startTransition(async () => {
      const match = await findMatchingContact(name);
      setDuplicate(match?.email ?? null);
    });
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveManualRevenue({
        id: entry?.id,
        clientName,
        source,
        description,
        amountUsd: amountUsd.trim() ? Number(amountUsd) : null,
        amountInr: amountInr.trim() ? Number(amountInr) : null,
        earnedOn,
      });
      if (result.ok) {
        router.refresh();
        onDone();
      } else {
        setError(result.error);
      }
    });
  }

  const body = (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Client</label>
          <input
            className={inputClass}
            placeholder="Acme Ltd"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            onBlur={(e) => checkForDuplicate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Source</label>
          <select
            className={inputClass}
            value={source}
            onChange={(e) => setSource(e.target.value as RevenueSource)}
          >
            <option value="upwork">Upwork</option>
            <option value="off_source">Off source</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Rupees received</label>
          <input
            className={inputClass}
            inputMode="decimal"
            placeholder="208000"
            value={amountInr}
            onChange={(e) => setAmountInr(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Dollars invoiced (optional)</label>
          <input
            className={inputClass}
            inputMode="decimal"
            placeholder="2500"
            value={amountUsd}
            onChange={(e) => setAmountUsd(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Earned on</label>
          <input
            className={inputClass}
            type="date"
            value={earnedOn}
            onChange={(e) => setEarnedOn(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[6px]">
        <label className={labelClass}>What was it for?</label>
        <input
          className={inputClass}
          placeholder="Short description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {amountUsd.trim() && amountInr.trim() && Number(amountUsd) > 0 && (
        <p className="m-0 text-[12.5px] text-[var(--ink-300)]">
          That works out at{" "}
          <span className="font-semibold text-[var(--ink-600)]">
            ₹{(Number(amountInr) / Number(amountUsd)).toFixed(2)} to the dollar
          </span>{" "}
          — recorded as a fact about this payment, never applied to any other.
        </p>
      )}

      <p className="m-0 text-[12.5px] text-[var(--ink-300)]">
        {window ? (
          <>
            Counts toward <span className="font-semibold text-[var(--mint-700)]">{window.name}</span>.
          </>
        ) : (
          "No target covers that date — it will be counted as revenue outside every target."
        )}
      </p>

      {duplicate && (
        <p className="m-0 px-4 py-3 rounded-[10px] bg-[var(--warning-bg)] border-[1.5px] border-[var(--warning-border)] text-[13px] leading-[1.6] text-[var(--warning)]">
          A contact matching that name already exists ({duplicate}). If they also paid through the
          checkout, adding this would count the same money twice.
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
          {pending ? "Saving…" : entry ? "Save changes" : "Add revenue"}
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );

  if (inline) return body;

  return (
    <Card>
      <CardHeader title="Add client revenue" />
      <div className="px-6 py-5">{body}</div>
    </Card>
  );
}
