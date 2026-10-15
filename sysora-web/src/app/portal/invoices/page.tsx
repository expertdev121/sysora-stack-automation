import type { Metadata } from "next";

import { PortalShell } from "@/components/portal/PortalShell";
import { requireClient } from "@/lib/portal/auth";
import { getCardOnFile, getInvoices, getTickets, getChrome } from "@/lib/portal/queries";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Invoices", robots: { index: false, follow: false } };

const TONE: Record<string, { bg: string; fg: string }> = {
  Paid: { bg: "#F0FAF6", fg: "#00A87E" },
  Scheduled: { bg: "#F7F9F7", fg: "#475569" },
  Unpaid: { bg: "#FFF4E5", fg: "#C2410C" },
};

export default async function InvoicesPage() {
  const session = await requireClient();
  const chrome = await getChrome(session.customerId);
  const [invoices, card, tickets] = await Promise.all([
    getInvoices(session.customerId),
    getCardOnFile(session.customerId),
    getTickets(session.customerId),
  ]);

  const open = tickets.filter((t) => t.status !== "resolved").length;

  return (
    <PortalShell eyebrow="Billing" title="Invoices" openTickets={chrome.openTickets}
      remaining={chrome.remaining}
      purchased={chrome.purchased}
      userName={session.fullName}
      userEmail={session.email}
      company={chrome.company}>
      <section className="overflow-hidden rounded-[18px] border border-[var(--line-mint)] bg-white">
        <table className="w-full border-collapse text-left text-[14px]">
          <thead>
            <tr className="bg-[var(--surface-1)]">
              <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.8px] text-[var(--text-muted)]">Reference</th>
              <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.8px] text-[var(--text-muted)]">Date</th>
              <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.8px] text-[var(--text-muted)]">Item</th>
              <th className="px-5 py-3 text-right text-[12px] font-semibold uppercase tracking-[0.8px] text-[var(--text-muted)]">Amount</th>
              <th className="px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.8px] text-[var(--text-muted)]">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[13.5px] text-[var(--text-muted)]">
                  No invoices yet.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const tone = TONE[inv.status] ?? TONE.Unpaid;
                return (
                  <tr key={inv.id} className="border-t border-[var(--line-mint-2)]">
                    <td className="whitespace-nowrap px-5 py-[13px] font-mono text-[12.5px] text-[var(--text-muted)]">
                      {inv.reference}
                    </td>
                    <td className="whitespace-nowrap px-5 py-[13px] text-[var(--text-muted)]">
                      {new Date(inv.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-[13px] text-[var(--ink-600)]">{inv.item}</td>
                    <td className="px-5 py-[13px] text-right font-semibold text-[var(--ink-900)]">
                      {formatMoney(inv.amount, inv.currency)}
                    </td>
                    <td className="px-5 py-[13px]">
                      <span
                        className="rounded-full px-[10px] py-[3px] text-[12px] font-semibold"
                        style={{ background: tone.bg, color: tone.fg }}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-[13px] text-right">
                      {inv.receiptUrl && (
                        <a
                          href={inv.receiptUrl}
                          target="_blank"
                          rel="noopener"
                          className="text-[13px] font-semibold text-[var(--accent-strong)]"
                        >
                          Receipt
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      <section className="mt-6 rounded-[18px] border border-[var(--line-mint)] bg-white p-6">
        <h2 className="text-[15px] font-bold text-[var(--ink-900)]">Payment method</h2>
        {card?.last4 ? (
          <p className="mt-2 text-[14px] text-[var(--ink-600)]">
            <span className="uppercase">{card.brand}</span> ending {card.last4}
          </p>
        ) : (
          <p className="mt-2 text-[14px] text-[var(--text-muted)]">No card on file yet.</p>
        )}
        <p className="mt-3 text-[12.5px] leading-[1.7] text-[var(--text-muted)]">
          Card details are held by Stripe, never by us. To change the card on file, email{" "}
          <a href="mailto:team@sysorastack.com" className="font-medium text-[var(--accent-strong)] underline underline-offset-2">
            team@sysorastack.com
          </a>{" "}
          and we will send a secure link.
        </p>
      </section>
    </PortalShell>
  );
}
