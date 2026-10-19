import type { Metadata } from "next";

import { PortalShell } from "@/components/portal/PortalShell";
import { TicketForm } from "@/components/portal/TicketForm";
import { requireClient } from "@/lib/portal/auth";
import { getTickets, getChrome } from "@/lib/portal/queries";

export const metadata: Metadata = { title: "Support", robots: { index: false, follow: false } };

const TONE: Record<string, { label: string; bg: string; fg: string }> = {
  open: { label: "Open", bg: "#FFF4E5", fg: "#C2410C" },
  in_progress: { label: "In progress", bg: "#F0FAF6", fg: "#00A87E" },
  waiting_on_client: { label: "Waiting on you", bg: "#EEF6EF", fg: "#3E6B4F" },
  resolved: { label: "Resolved", bg: "#F7F9F7", fg: "#475569" },
};

export default async function SupportPage() {
  const session = await requireClient();
  const chrome = await getChrome(session.customerId);
  const tickets = await getTickets(session.customerId);
  const open = tickets.filter((t) => t.status !== "resolved");

  return (
    <PortalShell eyebrow="Help" title="Support tickets" openTickets={chrome.openTickets}
      remaining={chrome.remaining}
      purchased={chrome.purchased}
      userName={session.fullName}
      userEmail={session.email}
      company={chrome.company}
      mustChangePassword={chrome.mustChangePassword}>
      <p className="max-w-[640px] text-[14.5px] leading-[1.7] text-[var(--text-muted)]">
        A real person receives, reads and routes every ticket, at any hour. Triage is included;
        the technical work that follows comes out of your hours.
      </p>

      <TicketForm />

      <section className="mt-6 flex flex-col gap-3">
        {tickets.length === 0 ? (
          <p className="rounded-[18px] border border-[var(--line-mint)] bg-white px-6 py-10 text-center text-[13.5px] text-[var(--text-muted)]">
            No tickets yet.
          </p>
        ) : (
          tickets.map((t) => {
            const tone = TONE[t.status] ?? TONE.open;
            return (
              <article
                key={t.id}
                className="flex items-center justify-between gap-4 rounded-[18px] border border-[var(--line-mint)] bg-white px-6 py-5"
              >
                <div className="min-w-0">
                  <h2 className="truncate text-[15px] font-semibold text-[var(--ink-900)]">
                    {t.subject}
                  </h2>
                  <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">
                    <span className="font-mono">{t.reference}</span>
                    {t.category ? ` · ${t.category}` : ""} · updated{" "}
                    {new Date(t.updatedAt).toLocaleDateString("en-US", {
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
