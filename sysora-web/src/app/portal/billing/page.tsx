import type { Metadata } from "next";
import Link from "next/link";

import { PortalShell } from "@/components/portal/PortalShell";
import { requireClient } from "@/lib/portal/auth";
import { getBalance, getCardOnFile, getPlan, getTickets, getChrome } from "@/lib/portal/queries";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Payment and plan",
  robots: { index: false, follow: false },
};

const date = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

/**
 * Payment method, the plan, and who we bill — the three questions a
 * client opens billing to answer.
 *
 * The card is shown but not editable here: changing it means handling a
 * card number, which belongs to Stripe. The honest version is to say so
 * and route the request through support.
 */
export default async function BillingPage() {
  const session = await requireClient();
  const chrome = await getChrome(session.customerId);
  const [card, plan, balance, tickets] = await Promise.all([
    getCardOnFile(session.customerId),
    getPlan(session.customerId),
    getBalance(session.customerId),
    getTickets(session.customerId),
  ]);

  const open = tickets.filter((t) => t.status !== "resolved").length;

  return (
    <PortalShell eyebrow="Billing" title="Payment and plan" openTickets={chrome.openTickets}
      remaining={chrome.remaining}
      purchased={chrome.purchased}
      userName={session.fullName}
      userEmail={session.email}
      company={chrome.company}>
      <div className="grid grid-cols-2 gap-6 to-980:grid-cols-1">
        <section className="rounded-[18px] border border-[var(--line-mint)] bg-white p-6">
          <h2 className="text-[15px] font-bold text-[var(--ink-900)]">Payment method</h2>
          {card?.last4 ? (
            <div className="mt-4 rounded-[14px] border border-[var(--line-mint)] bg-[var(--surface-1)] p-5">
              <p className="text-[11.5px] font-semibold uppercase tracking-[1px] text-[var(--text-muted)]">
                Card on file
              </p>
              <p className="mt-2 font-mono text-[16px] tracking-[2px] text-[var(--ink-900)]">
                •••• •••• •••• {card.last4}
              </p>
              <p className="mt-2 text-[13px] text-[var(--text-muted)]">{card.brand}</p>
            </div>
          ) : (
            <p className="mt-3 text-[14px] text-[var(--text-muted)]">No card on file yet.</p>
          )}
          <p className="mt-4 text-[12.5px] leading-[1.7] text-[var(--text-muted)]">
            Payments are processed by Stripe. We never see or store your full card number. To
            change the card,{" "}
            <Link href="/portal/support" className="font-medium text-[var(--accent-strong)] underline underline-offset-2">
              open a ticket
            </Link>{" "}
            and we will send a secure link.
          </p>
        </section>

        <section className="rounded-[18px] border border-[var(--line-mint)] bg-white p-6">
          <h2 className="text-[15px] font-bold text-[var(--ink-900)]">Plan</h2>
          <dl className="mt-4 flex flex-col gap-3 text-[14px]">
            <div className="flex items-center justify-between">
              <dt className="text-[var(--text-muted)]">Package</dt>
              <dd className="font-semibold text-[var(--ink-900)]">
                {plan ? `${plan.hours} hours${plan.monthly ? " / month" : " pack"}` : "No active plan"}
              </dd>
            </div>
            {plan && (
              <div className="flex items-center justify-between">
                <dt className="text-[var(--text-muted)]">Price</dt>
                <dd className="font-semibold text-[var(--ink-900)]">
                  {formatMoney(plan.amount, plan.currency)}
                  {plan.monthly ? " / mo" : ""}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between">
              <dt className="text-[var(--text-muted)]">
                {balance.nextReset ? "Next renewal" : "Expires"}
              </dt>
              <dd className="font-semibold text-[var(--ink-900)]">
                {date(balance.nextReset ?? balance.nextExpiry)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[var(--text-muted)]">Hours remaining</dt>
              <dd className="font-semibold text-[var(--ink-900)]">
                {Math.round(balance.remaining * 100) / 100}h
              </dd>
            </div>
          </dl>

          <Link
            href="/portal/plans"
            className="mt-5 inline-block rounded-xl bg-[var(--accent)] px-5 py-[10px] text-[13.5px] font-semibold text-white"
          >
            Change plan or buy hours
          </Link>

          <p className="mt-4 text-[12.5px] leading-[1.7] text-[var(--text-muted)]">
            To cancel a monthly plan, open a ticket at least 24 hours before renewal. Cancelling
            stops future renewals; the unused part of the cycle you already paid for is
            refundable under the{" "}
            <Link href="/terms#s-7" className="font-medium text-[var(--accent-strong)] underline underline-offset-2">
              refund guarantee
            </Link>
            .
          </p>
        </section>
      </div>

      <section className="mt-6 rounded-[18px] border border-[var(--line-mint)] bg-white p-6">
        <h2 className="text-[15px] font-bold text-[var(--ink-900)]">Billing details</h2>
        <p className="mt-3 text-[14px] font-semibold text-[var(--ink-900)]">
          {session.fullName ?? "—"}
        </p>
        <p className="text-[13.5px] text-[var(--text-muted)]">{session.email}</p>
        <p className="mt-3 text-[12.5px] text-[var(--text-muted)]">
          Something wrong here? Open a ticket and we will correct it.
        </p>
      </section>
    </PortalShell>
  );
}
