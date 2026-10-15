"use client";

import { useState, useTransition } from "react";

import { submitBuildRequest } from "@/lib/portal/actions";

const field =
  "mt-[6px] w-full rounded-xl border-[1.5px] border-[var(--border-default)] bg-white px-4 py-[11px] text-[14.5px] text-[var(--ink-800)] outline-none transition-colors focus:border-[var(--accent)]";
const label = "text-[13px] font-semibold text-[var(--text-heading)]";

const BUDGETS = ["Under $1k", "$1k to $3k", "$3k to $10k", "Over $10k", "Not sure yet"];
const TIMING = ["As soon as possible", "This quarter", "Next quarter", "Just exploring"];

export function BuildRequestForm() {
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="mt-6 rounded-[18px] border border-[var(--line-slate)] bg-white p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const el = event.currentTarget;
        const form = new FormData(el);
        setNote(null);
        start(async () => {
          const result = await submitBuildRequest(form);
          if (result.ok) {
            setNote({ ok: true, text: `Request ${result.reference} received. We will scope it and come back.` });
            el.reset();
          } else {
            setNote({ ok: false, text: result.error });
          }
        });
      }}
    >
      <h2 className="text-[15px] font-bold text-[var(--text-heading)]">Request a build</h2>

      <label className="mt-4 block">
        <span className={label}>What do you want built?</span>
        <input name="title" className={field} placeholder="Patient intake portal" required />
      </label>

      <div className="mt-4 grid grid-cols-2 gap-4 to-640:grid-cols-1">
        <label className="block">
          <span className={label}>Budget</span>
          <select name="budget" className={field} defaultValue={BUDGETS[1]}>
            {BUDGETS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={label}>Timing</span>
          <select name="timing" className={field} defaultValue={TIMING[1]}>
            {TIMING.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className={label}>What should it do?</span>
        <textarea
          name="detail"
          rows={4}
          className={`${field} resize-y`}
          placeholder="Patients fill a form before the appointment, it lands in the CRM, and the front desk gets a summary the morning of."
          required
        />
      </label>

      {note && (
        <p
          className={
            "mt-4 rounded-xl px-4 py-3 text-[13.5px] " +
            (note.ok
              ? "border-[1.5px] border-[var(--border-default)] bg-[var(--mint-50)] text-[var(--accent-strong)]"
              : "border-[1.5px] border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-600)]")
          }
        >
          {note.text}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-xl bg-[var(--accent)] px-6 py-[12px] text-[14.5px] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-70"
      >
        {pending ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
