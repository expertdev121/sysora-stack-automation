"use client";

import { useState, useTransition } from "react";

import { submitBuildRequest } from "@/lib/portal/actions";

const field =
  "mt-[6px] w-full rounded-xl border-[1.5px] border-[var(--border-default)] bg-white px-4 py-[11px] text-[14.5px] text-[var(--ink-800)] outline-none transition-colors focus:border-[var(--accent)]";
const label = "text-[13px] font-semibold text-[var(--ink-900)]";

const TIMING = ["As soon as possible", "This quarter", "Next quarter", "Just exploring"];

export function BuildRequestForm() {
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="mt-6 rounded-[18px] border border-[var(--line-mint)] bg-white p-6"
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
      <h2 className="text-[15px] font-bold text-[var(--ink-900)]">Assign a task to our team</h2>

      <label className="mt-4 block">
        <span className={label}>What do you need done?</span>
        <input
          name="title"
          className={field}
          placeholder="Patient intake form in GoHighLevel"
          required
        />
      </label>

      <label className="mt-4 block">
        <span className={label}>Timing</span>
        <select name="timing" className={field} defaultValue={TIMING[1]}>
          {TIMING.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>

      <label className="mt-4 block">
        <span className={label}>What does it need to do?</span>
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
