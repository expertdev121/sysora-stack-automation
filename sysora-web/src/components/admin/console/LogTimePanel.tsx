"use client";

import { useState, useTransition } from "react";

import { inputClass, labelClass } from "@/components/admin/ui";
import { grantHours, logTime } from "@/lib/admin/console-actions";

/**
 * Logging time is the console's most-used control, so it sits at the top
 * of the clients page rather than behind a drawer: the common case is
 * "I just finished something, take it off their balance".
 *
 * Granting hours lives beside it because the other common case is the
 * reverse — a top-up sold outside the checkout, or goodwill after a
 * mistake.
 */

const KINDS = [
  ["build", "Build"],
  ["troubleshooting", "Troubleshooting"],
  ["configuration", "Configuration"],
  ["cleanup", "Cleanup"],
  ["data", "Data"],
  ["call", "Call"],
  ["meeting", "Meeting"],
  ["documentation", "Documentation"],
] as const;

export function LogTimePanel({ clients }: { clients: { id: string; label: string }[] }) {
  const [tab, setTab] = useState<"log" | "grant">("log");
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  if (clients.length === 0) return null;

  function run(action: (f: FormData) => Promise<{ ok: boolean } & Record<string, unknown>>) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const el = event.currentTarget;
      setNote(null);
      start(async () => {
        const result = await action(form);
        setNote({
          ok: result.ok,
          text: String(result.ok ? result.message : result.error),
        });
        if (result.ok) el.reset();
      });
    };
  }

  return (
    <section className="mt-6 rounded-[14px] border border-[var(--line-mint)] bg-white p-5">
      <div className="flex gap-2">
        {(["log", "grant"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setNote(null); }}
            className={
              "rounded-lg px-3 py-[7px] text-[13px] font-semibold transition-colors " +
              (tab === t
                ? "bg-[var(--mint-50)] text-[var(--accent-strong)]"
                : "text-[var(--text-muted)] hover:text-[var(--ink-900)]")
            }
          >
            {t === "log" ? "Log time" : "Add hours"}
          </button>
        ))}
      </div>

      {tab === "log" ? (
        <form onSubmit={run(logTime)} className="mt-4 grid grid-cols-[1.4fr_2fr_1fr_0.8fr_auto] gap-3 items-end to-980:grid-cols-1">
          <label className="block">
            <span className={labelClass}>Client</span>
            <select name="customerId" className={inputClass} required>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>What was done</span>
            <input name="description" className={inputClass} placeholder="Missed-call text back workflow" required />
          </label>
          <label className="block">
            <span className={labelClass}>Type</span>
            <select name="kind" className={inputClass}>
              {KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Hours</span>
            <input name="hours" type="number" step="0.25" min="0.25" max="24" className={inputClass} placeholder="1.5" required />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-[var(--accent)] px-5 py-[11px] text-[14px] font-semibold text-white disabled:opacity-70"
          >
            {pending ? "Saving" : "Log"}
          </button>
          <label className="col-span-full flex items-center gap-2 text-[12.5px] text-[var(--text-muted)]">
            <input type="checkbox" name="billable" defaultChecked className="h-[15px] w-[15px] accent-[var(--accent)]" />
            Billable — uncheck for rework we caused, which shows in their ledger but is not deducted
          </label>
        </form>
      ) : (
        <form onSubmit={run(grantHours)} className="mt-4 grid grid-cols-[1.4fr_0.8fr_1fr_2fr_auto] gap-3 items-end to-980:grid-cols-1">
          <label className="block">
            <span className={labelClass}>Client</span>
            <select name="customerId" className={inputClass} required>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Hours</span>
            <input name="hours" type="number" step="0.25" min="0.25" className={inputClass} placeholder="10" required />
          </label>
          <label className="block">
            <span className={labelClass}>Reason</span>
            <select name="source" className={inputClass}>
              <option value="manual">Sold outside checkout</option>
              <option value="goodwill">Goodwill</option>
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Note</span>
            <input name="note" className={inputClass} placeholder="Invoiced by bank transfer" />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-[var(--accent)] px-5 py-[11px] text-[14px] font-semibold text-white disabled:opacity-70"
          >
            {pending ? "Saving" : "Add"}
          </button>
        </form>
      )}

      {note && (
        <p
          className={
            "mt-3 text-[13px] font-medium " +
            (note.ok ? "text-[var(--accent-strong)]" : "text-[#B4472F]")
          }
        >
          {note.text}
        </p>
      )}
    </section>
  );
}
