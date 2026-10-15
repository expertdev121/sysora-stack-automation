"use client";

import { useState, useTransition } from "react";

import { submitTicket } from "@/lib/portal/actions";

const field =
  "mt-[6px] w-full rounded-xl border-[1.5px] border-[var(--border-default)] bg-white px-4 py-[11px] text-[14.5px] text-[var(--ink-800)] outline-none transition-colors focus:border-[var(--accent)]";
const label = "text-[13px] font-semibold text-[var(--text-heading)]";

const CATEGORIES = [
  "GoHighLevel",
  "Automation",
  "Website or funnel",
  "Integration",
  "Billing",
  "Something else",
];

export function TicketForm() {
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
          const result = await submitTicket(form);
          if (result.ok) {
            setNote({ ok: true, text: `Ticket ${result.reference} received. A person is reading it.` });
            el.reset();
          } else {
            setNote({ ok: false, text: result.error });
          }
        });
      }}
    >
      <h2 className="text-[15px] font-bold text-[var(--text-heading)]">Open a ticket</h2>

      <label className="mt-4 block">
        <span className={label}>Subject</span>
        <input name="subject" className={field} placeholder="Booking widget not showing on mobile" required />
      </label>

      <div className="mt-4 grid grid-cols-2 gap-4 to-640:grid-cols-1">
        <label className="block">
          <span className={label}>Category</span>
          <select name="category" className={field} defaultValue={CATEGORIES[0]}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={label}>Priority</span>
          <select name="priority" className={field} defaultValue="normal">
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent, something is down</option>
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className={label}>What is happening?</span>
        <textarea
          name="body"
          rows={4}
          className={`${field} resize-y`}
          placeholder="Since Tuesday the booking widget is blank on phones. Desktop is fine."
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
        {pending ? "Sending…" : "Open ticket"}
      </button>
    </form>
  );
}
