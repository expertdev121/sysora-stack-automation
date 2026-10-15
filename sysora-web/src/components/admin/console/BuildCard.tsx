"use client";

import { useTransition } from "react";

import { setBuildStage } from "@/lib/admin/console-actions";
import type { BuildRow } from "@/lib/admin/console";

/**
 * A card on the build board. One button, which is the only move that
 * makes sense from where the card is sitting — a four-way drag target
 * would be more freedom than the process has.
 */
export function BuildCard({
  build,
  nextStage,
  nextLabel,
}: {
  build: BuildRow;
  nextStage: string | null;
  nextLabel: string | null;
}) {
  const [pending, start] = useTransition();

  return (
    <article className="rounded-xl border border-[var(--line-slate)] bg-white p-[14px]">
      <h3 className="text-[14px] font-semibold leading-snug text-[var(--text-heading)]">
        {build.title}
      </h3>
      <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">{build.clientName}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11.5px] text-[var(--text-muted)]">{build.reference}</span>
        {build.budgetBand && (
          <span className="rounded-full bg-[var(--surface-1)] px-2 py-[2px] text-[11.5px] text-[var(--text-muted)]">
            {build.budgetBand}
          </span>
        )}
      </div>

      {nextStage && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            const form = new FormData();
            form.set("requestId", build.id);
            form.set("stage", nextStage);
            start(async () => {
              await setBuildStage(form);
            });
          }}
          className="mt-3 w-full rounded-lg border border-[var(--line-slate)] px-3 py-[7px] text-[12.5px] font-semibold text-[var(--accent-strong)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--mint-50)] disabled:opacity-60"
        >
          {pending ? "Moving…" : `Move to ${nextLabel} →`}
        </button>
      )}
    </article>
  );
}
