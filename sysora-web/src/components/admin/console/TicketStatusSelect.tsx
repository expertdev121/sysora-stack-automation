"use client";

import { useState, useTransition } from "react";

import { setTicketStatus } from "@/lib/admin/console-actions";

const OPTIONS = [
  ["open", "Open"],
  ["in_progress", "In progress"],
  ["waiting_on_client", "Waiting on client"],
  ["resolved", "Resolved"],
] as const;

/**
 * Status is changed in place, from the queue, because making someone
 * open a ticket to say "I'm on it" is how queues stop being accurate.
 */
export function TicketStatusSelect({ ticketId, status }: { ticketId: string; status: string }) {
  const [value, setValue] = useState(status);
  const [pending, start] = useTransition();

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(event) => {
        const next = event.target.value;
        const previous = value;
        setValue(next);
        const form = new FormData();
        form.set("ticketId", ticketId);
        form.set("status", next);
        start(async () => {
          const result = await setTicketStatus(form);
          // Put it back if the write failed, rather than showing a status
          // the database does not have.
          if (!result.ok) setValue(previous);
        });
      }}
      className="rounded-lg border border-[var(--line-slate)] bg-white px-2 py-[6px] text-[13px] text-[var(--text-heading)] disabled:opacity-60"
    >
      {OPTIONS.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}
