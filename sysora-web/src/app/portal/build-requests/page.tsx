import type { Metadata } from "next";

import { BuildRequestForm } from "@/components/portal/BuildRequestForm";
import { PortalShell } from "@/components/portal/PortalShell";
import { requireClient } from "@/lib/portal/auth";
import { getBuildRequests, getTickets, getChrome } from "@/lib/portal/queries";

export const metadata: Metadata = {
  title: "Build requests",
  robots: { index: false, follow: false },
};

const STAGE: Record<string, { label: string; bg: string; fg: string }> = {
  new: { label: "In review by our team", bg: "#FFF4E5", fg: "#C2410C" },
  scoping: { label: "Scoping", bg: "#EEF6EF", fg: "#3E6B4F" },
  proposal_sent: { label: "Proposal sent", bg: "#EEF6EF", fg: "#3E6B4F" },
  approved: { label: "Approved", bg: "#F0FAF6", fg: "#00A87E" },
};

export default async function BuildRequestsPage() {
  const session = await requireClient();
  const chrome = await getChrome(session.customerId);
  const [builds, tickets] = await Promise.all([
    getBuildRequests(session.customerId),
    getTickets(session.customerId),
  ]);

  const open = tickets.filter((t) => t.status !== "resolved").length;

  return (
    <PortalShell eyebrow="Projects" title="Build requests" openTickets={chrome.openTickets}
      remaining={chrome.remaining}
      purchased={chrome.purchased}
      userName={session.fullName}
      userEmail={session.email}
      company={chrome.company}
      mustChangePassword={chrome.mustChangePassword}>
      <p className="max-w-[640px] text-[14.5px] leading-[1.7] text-[var(--text-muted)]">
        For work too big to guess at in hours. Send the scope and we come back with a written time
        estimate and a milestone plan — free, and before anything is billed.
      </p>

      <BuildRequestForm />

      <section className="mt-6 flex flex-col gap-3">
        {builds.length === 0 ? (
          <p className="rounded-[18px] border border-[var(--line-mint)] bg-white px-6 py-10 text-center text-[13.5px] text-[var(--text-muted)]">
            No build requests yet.
          </p>
        ) : (
          builds.map((b) => {
            const tone = STAGE[b.stage ?? "new"] ?? STAGE.new;
            return (
              <article
                key={b.id}
                className="flex items-center justify-between gap-4 rounded-[18px] border border-[var(--line-mint)] bg-white px-6 py-5"
              >
                <div className="min-w-0">
                  <h2 className="truncate text-[15px] font-semibold text-[var(--ink-900)]">
                    {b.title}
                  </h2>
                  <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">
                    <span className="font-mono">{b.reference}</span>
                    {b.budgetBand ? ` · ${b.budgetBand}` : ""} ·{" "}
                    {new Date(b.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className="flex-none rounded-full px-[11px] py-[4px] text-[12px] font-semibold"
                  style={{ background: tone.bg, color: tone.fg }}
                >
                  {tone.label}
                </span>
              </article>
            );
          })
        )}
      </section>
    </PortalShell>
  );
}
