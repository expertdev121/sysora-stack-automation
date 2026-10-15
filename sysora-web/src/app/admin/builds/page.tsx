import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { BuildCard } from "@/components/admin/console/BuildCard";
import { PageHeading } from "@/components/admin/ui";
import { requirePipeline } from "@/lib/admin/auth";
import { getBuildRequests } from "@/lib/admin/console";

export const metadata: Metadata = { title: "Build requests", robots: { index: false } };

const STAGES = [
  ["new", "New"],
  ["scoping", "Scoping"],
  ["proposal_sent", "Proposal sent"],
  ["approved", "Approved"],
] as const;

/**
 * The build pipeline as a board.
 *
 * These are the same rows the public estimate form creates — there is no
 * separate table — so a request that arrives from the website appears in
 * the New column without anyone copying it anywhere.
 */
export default async function BuildsPage() {
  const session = await requirePipeline();
  const builds = await getBuildRequests();

  return (
    <AdminShell session={session}>
      <PageHeading
        title="Build requests"
        eyebrow={`${builds.filter((b) => b.stage === "new").length} waiting to be scoped`}
      />

      <div className="mt-6 grid grid-cols-4 gap-4 to-1180:grid-cols-2 to-640:grid-cols-1">
        {STAGES.map(([stage, label], index) => {
          const items = builds.filter((b) => b.stage === stage);
          return (
            <section
              key={stage}
              className="rounded-[14px] border border-[var(--line-mint)] bg-[var(--surface-1)] p-3"
            >
              <header className="flex items-center justify-between px-1 pb-3">
                <h2 className="text-[13px] font-bold text-[var(--ink-900)]">{label}</h2>
                <span className="rounded-full bg-white px-2 py-[2px] text-[12px] font-semibold text-[var(--text-muted)]">
                  {items.length}
                </span>
              </header>

              <div className="flex flex-col gap-3">
                {items.length === 0 ? (
                  <p className="px-1 py-6 text-center text-[12.5px] text-[var(--text-muted)]">
                    Nothing here
                  </p>
                ) : (
                  items.map((b) => (
                    <BuildCard
                      key={b.id}
                      build={b}
                      nextStage={index < STAGES.length - 1 ? STAGES[index + 1][0] : null}
                      nextLabel={index < STAGES.length - 1 ? STAGES[index + 1][1] : null}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </AdminShell>
  );
}
