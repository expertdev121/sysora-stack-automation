import type { Metadata } from "next";

import { PortalShell } from "@/components/portal/PortalShell";
import { requireClient } from "@/lib/portal/auth";
import { getBalance, getLedger, getTickets, getChrome } from "@/lib/portal/queries";

export const metadata: Metadata = { title: "Hours", robots: { index: false, follow: false } };

const hrs = (n: number) => `${Math.round(n * 100) / 100}h`;

const KIND_LABEL: Record<string, string> = {
  build: "Build",
  troubleshooting: "Troubleshooting",
  configuration: "Configuration",
  cleanup: "Cleanup",
  data: "Data",
  call: "Call",
  meeting: "Meeting",
  documentation: "Documentation",
};

/**
 * The ledger the terms promise: every entry, with its date, what it was
 * and how long it took. Non-billable entries are shown too and marked,
 * because a client should be able to see the work we did not charge for.
 */
export default async function HoursPage() {
  const session = await requireClient();
  const chrome = await getChrome(session.customerId);
  const [balance, ledger, tickets] = await Promise.all([
    getBalance(session.customerId),
    getLedger(session.customerId),
    getTickets(session.customerId),
  ]);

  const open = tickets.filter((t) => t.status !== "resolved").length;

  return (
    <PortalShell eyebrow="Hours" title="Hours and usage" openTickets={chrome.openTickets}
      remaining={chrome.remaining}
      purchased={chrome.purchased}
      userName={session.fullName}
      userEmail={session.email}
      company={chrome.company}>
      <div className="grid grid-cols-4 gap-4 to-860:grid-cols-2">
        {[
          ["Purchased", hrs(balance.purchased)],
          ["Used", hrs(balance.used)],
          ["Remaining", hrs(balance.remaining)],
          [
            balance.nextReset ? "Resets" : "Expires",
            balance.nextReset
              ? new Date(balance.nextReset).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : balance.nextExpiry
                ? new Date(balance.nextExpiry).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "—",
          ],
        ].map(([k, v]) => (
          <div key={k} className="rounded-[14px] border border-[var(--line-mint)] bg-white p-4">
            <p className="text-[11.5px] font-semibold uppercase tracking-[1px] text-[var(--text-muted)]">
              {k}
            </p>
            <p className="mt-2 font-display text-[24px] font-black text-[var(--ink-900)]">{v}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 overflow-hidden rounded-[18px] border border-[var(--line-mint)] bg-white">
        <table className="w-full border-collapse text-left text-[14px]">
          <thead>
            <tr className="bg-[var(--surface-1)]">
              <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.8px] text-[var(--text-muted)]">Date</th>
              <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.8px] text-[var(--text-muted)]">Work</th>
              <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.8px] text-[var(--text-muted)]">Type</th>
              <th className="px-5 py-3 text-right text-[12px] font-semibold uppercase tracking-[0.8px] text-[var(--text-muted)]">Hours</th>
            </tr>
          </thead>
          <tbody>
            {ledger.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-[13.5px] text-[var(--text-muted)]">
                  No hours logged yet. Every entry we log appears here the moment it is saved.
                </td>
              </tr>
            ) : (
              ledger.map((l) => (
                <tr key={l.id} className="border-t border-[var(--line-mint-2)]">
                  <td className="whitespace-nowrap px-5 py-[13px] text-[var(--text-muted)]">
                    {new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-5 py-[13px] text-[var(--ink-600)]">
                    {l.description}
                    {!l.billable && (
                      <span className="ml-2 rounded-full bg-[var(--mint-50)] px-2 py-[2px] text-[11.5px] font-semibold text-[var(--accent-strong)]">
                        not billed
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-[13px] text-[var(--text-muted)]">
                    {KIND_LABEL[l.kind] ?? l.kind}
                  </td>
                  <td className="px-5 py-[13px] text-right font-semibold text-[var(--ink-900)]">
                    {l.hours.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <p className="mt-4 text-[12.5px] leading-[1.7] text-[var(--text-muted)]">
        Time is tracked in 15-minute increments. If you disagree with an entry, open a ticket and we
        will go through the task log with you.
      </p>
    </PortalShell>
  );
}
