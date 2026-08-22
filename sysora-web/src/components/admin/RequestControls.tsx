"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Card, CardHeader, inputClass, labelClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { assignRequest, saveRequestNotes, updateRequestStatus } from "@/lib/admin/actions";
import { REQUEST_STATUSES, STATUS_LABELS } from "@/lib/admin/types";
import type { RequestStatus } from "@/lib/sales/types";

/** Status, owner and internal notes — the three things staff change most. */
export function RequestControls({
  reference,
  status,
  assignedTo,
  notes,
  team,
}: {
  reference: string;
  status: RequestStatus;
  assignedTo: string | null;
  notes: string;
  team: { userId: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState(false);
  const [draftNotes, setDraftNotes] = useState(notes);

  const run = (work: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const result = await work();
      if (!result.ok) setError(result.error ?? "That didn't save.");
      else router.refresh();
    });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title="Move it along" />
        <div className="flex flex-col gap-5 px-6 py-5">
          <div className="flex flex-col gap-[6px]">
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              className={inputClass}
              value={status}
              disabled={pending}
              onChange={(e) => run(() => updateRequestStatus(reference, e.target.value as RequestStatus))}
            >
              {REQUEST_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-[6px]">
            <label htmlFor="assignee" className={labelClass}>
              Assigned to
            </label>
            <select
              id="assignee"
              className={inputClass}
              value={assignedTo ?? ""}
              disabled={pending}
              onChange={(e) => run(() => assignRequest(reference, e.target.value || null))}
            >
              <option value="">Unassigned</option>
              {team.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name}
                </option>
              ))}
            </select>
            {team.length === 0 && (
              <p className="m-0 text-[12px] text-[var(--ink-300)]">
                No active staff yet — invite the team under Team.
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="m-0 text-[13px] text-[var(--danger-600)]">
              {error}
            </p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Internal notes" hint="Only staff see this" />
        <div className="flex flex-col gap-3 px-6 py-5">
          <textarea
            rows={7}
            className={`${inputClass} resize-y leading-[1.6]`}
            placeholder="What did we decide? What's blocking?"
            value={draftNotes}
            onChange={(e) => {
              setDraftNotes(e.target.value);
              setSavedNote(false);
            }}
          />
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              disabled={pending || draftNotes === notes}
              onClick={() =>
                run(async () => {
                  const result = await saveRequestNotes(reference, draftNotes);
                  if (result.ok) setSavedNote(true);
                  return result;
                })
              }
            >
              {pending ? "Saving…" : "Save notes"}
            </Button>
            {savedNote && <span className="text-[13px] text-[var(--mint-700)]">Saved</span>}
          </div>
        </div>
      </Card>
    </div>
  );
}
