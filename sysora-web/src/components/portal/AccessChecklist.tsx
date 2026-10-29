"use client";

import { useState, useTransition } from "react";

import { saveAccessGrant } from "@/lib/portal/access-actions";
// Type-only, so the server-only module it lives in never enters this bundle.
import type { AccessGrant } from "@/lib/portal/access";

const field =
  "mt-[6px] w-full rounded-xl border-[1.5px] border-[var(--border-default)] bg-white px-4 py-[11px] text-[14.5px] text-[var(--ink-900)] outline-none transition-colors focus:border-[var(--accent)]";
const label = "text-[13px] font-semibold text-[var(--ink-900)]";

/**
 * The first thing a new client sees, and it stays until it is done.
 *
 * Work cannot start before we are inside their GoHighLevel account, so
 * this sits above everything else on the overview while it is
 * outstanding and collapses to one quiet line once it is complete.
 */
export function AccessChecklist({
  grant,
  accessEmail,
}: {
  grant: AccessGrant;
  accessEmail: string;
}) {
  const done = Boolean(grant.completedAt);
  const [open, setOpen] = useState(!done);
  const [granted, setGranted] = useState(grant.ghlGranted);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  if (done && !open) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border-[1.5px] border-[var(--line-mint)] bg-[#F0FAF6] px-5 py-[14px]">
        <p className="m-0 flex items-center gap-[10px] text-[13.5px] text-[var(--ink-600)]">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Access granted for <strong className="font-semibold text-[var(--ink-900)]">{grant.ghlAccountName}</strong>.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[13px] font-semibold text-[var(--accent-strong)] underline underline-offset-[3px]"
        >
          Update
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-[18px] border-[1.5px] border-[#FFE0B2] bg-[#FFF8EE] p-6">
      <p className="m-0 text-[11px] font-bold uppercase tracking-[1.6px] text-[#C2410C]">
        Before we can start
      </p>
      <h2 className="mt-2 text-[19px] font-bold text-[var(--ink-900)]">Grant us access</h2>
      <p className="mt-2 max-w-[640px] text-[14.5px] leading-[1.7] text-[var(--ink-600)]">
        We cannot touch your setup until we are inside it. Add{" "}
        <strong className="font-semibold text-[var(--ink-900)]">{accessEmail}</strong> as a user on
        your GoHighLevel account, then tell us the account name so we can find it.
      </p>

      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setError(null);
          setSaved(false);
          start(async () => {
            const result = await saveAccessGrant(form);
            if (result.ok) {
              setSaved(true);
              setOpen(false);
            } else {
              setError(result.error);
            }
          });
        }}
      >
        <label className="flex cursor-pointer items-start gap-3 rounded-[12px] border-[1.5px] border-[var(--border-default)] bg-white px-4 py-[14px]">
          <input
            type="checkbox"
            name="ghl_granted"
            defaultChecked={grant.ghlGranted}
            onChange={(e) => setGranted(e.target.checked)}
            className="mt-[2px] h-[18px] w-[18px] flex-none accent-[var(--accent)]"
          />
          <span className="text-[14.5px] leading-[1.6] text-[var(--ink-900)]">
            I have added {accessEmail} to my GoHighLevel account
          </span>
        </label>

        {granted && (
          <label className="block">
            <span className={label}>GoHighLevel account name</span>
            <input
              name="ghl_account_name"
              className={field}
              defaultValue={grant.ghlAccountName ?? ""}
              placeholder="Bright Dental"
              required
            />
          </label>
        )}

        <label className="block">
          <span className={label}>Any other tools you granted access to</span>
          <textarea
            name="tools_notes"
            rows={3}
            className={field}
            defaultValue={grant.toolsNotes ?? ""}
            placeholder="Zapier, added the same address as a member. Also the WordPress admin, login sent separately."
          />
          <span className="mt-[6px] block text-[12.5px] leading-[1.6] text-[var(--text-muted)]">
            Name the tool and what you granted. Send every invite to {accessEmail} so it all lands
            in one place. Leave this empty if GoHighLevel is the only one.
          </span>
        </label>

        {error && (
          <p role="alert" className="m-0 text-[13.5px] text-[#C2410C]">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="m-0 text-[13.5px] text-[var(--accent-strong)]">
            Saved.
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-[var(--accent)] px-5 py-[11px] text-[14px] font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          {done && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[13.5px] font-semibold text-[var(--ink-500)]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
