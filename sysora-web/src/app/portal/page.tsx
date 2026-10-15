import type { Metadata } from "next";
import Link from "next/link";

import { HoursRing } from "@/components/portal/HoursRing";
import { PortalShell } from "@/components/portal/PortalShell";
import { requireClient } from "@/lib/portal/auth";
import { getBalance, getLedger, getTasks, getTickets, getChrome } from "@/lib/portal/queries";

export const metadata: Metadata = {
  title: "Client portal",
  robots: { index: false, follow: false },
};

const hrs = (n: number) => `${Math.round(n * 100) / 100}h`;

const TASK_TONE: Record<string, { bg: string; fg: string; label: string }> = {
  queued: { bg: "#F7F9F7", fg: "#475569", label: "Queued" },
  in_progress: { bg: "#F0FAF6", fg: "#00A87E", label: "In progress" },
  in_review: { bg: "#EEF6EF", fg: "#3E6B4F", label: "In review" },
  blocked: { bg: "#FFF4E5", fg: "#C2410C", label: "Blocked" },
};

export default async function PortalOverview() {
  const session = await requireClient();
  const chrome = await getChrome(session.customerId);
  const [balance, tasks, tickets, ledger] = await Promise.all([
    getBalance(session.customerId),
    getTasks(session.customerId),
    getTickets(session.customerId),
    getLedger(session.customerId, 5),
  ]);

  const open = tickets.filter((t) => t.status !== "resolved");
  const first = (session.fullName ?? "").split(" ")[0];
  const resetLabel = balance.nextReset
    ? `Resets ${new Date(balance.nextReset).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : balance.nextExpiry
      ? `Expires ${new Date(balance.nextExpiry).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : "No expiry";

  return (
    <PortalShell
      eyebrow="Client portal"
      title={first ? `Hello, ${first}` : "Your account"}
      openTickets={chrome.openTickets}
      remaining={chrome.remaining}
      purchased={chrome.purchased}
      userName={session.fullName}
      userEmail={session.email}
      company={chrome.company}
    >
      <div className="grid grid-cols-[320px_1fr] gap-6 to-980:grid-cols-1">
        <section className="rounded-[18px] border border-[var(--line-slate)] bg-white p-6">
          <HoursRing remaining={balance.remaining} purchased={balance.purchased} />
          <dl className="mt-5 grid grid-cols-2 gap-3 text-[13px]">
            {[
              ["Purchased", hrs(balance.purchased)],
              ["Used", hrs(balance.used)],
              ["Remaining", hrs(balance.remaining)],
              ["Validity", resetLabel],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[var(--text-muted)]">{k}</dt>
                <dd className="font-semibold text-[var(--text-heading)]">{v}</dd>
              </div>
            ))}
          </dl>
          {/* Into the portal's own plan picker, not the public page: a
              signed-in client should never retype details we hold. */}
          <Link
            href="/portal/plans"
            className="mt-5 block rounded-xl bg-[var(--accent)] px-4 py-[11px] text-center text-[14px] font-semibold text-white"
          >
            Buy more hours
          </Link>
        </section>

        <div className="flex flex-col gap-6">
          <section className="rounded-[18px] border border-[var(--line-slate)] bg-white p-6">
            <h2 className="text-[15px] font-bold text-[var(--text-heading)]">Work in flight</h2>
            {tasks.length === 0 ? (
              <p className="mt-3 text-[13.5px] text-[var(--text-muted)]">
                Nothing open right now. Send us a list and it appears here.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col divide-y divide-[var(--line-slate-2)]">
                {tasks.map((t) => {
                  const tone = TASK_TONE[t.status] ?? TASK_TONE.queued;
                  return (
                    <li key={t.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-[var(--text-heading)]">
                          {t.title}
                        </p>
                        <p className="truncate text-[12.5px] text-[var(--text-muted)]">
                          {t.detail ?? (t.estimateHours ? `Estimated ${hrs(t.estimateHours)}` : "—")}
                        </p>
                      </div>
                      <div className="flex flex-none items-center gap-3">
                        <span className="text-[13px] text-[var(--text-muted)]">
                          {hrs(t.loggedHours)}
                        </span>
                        <span
                          className="rounded-full px-[10px] py-[3px] text-[12px] font-semibold"
                          style={{ background: tone.bg, color: tone.fg }}
                        >
                          {tone.label}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-[18px] border border-[var(--line-slate)] bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-[var(--text-heading)]">Recent hours</h2>
              <Link href="/portal/hours" className="text-[13px] font-semibold text-[var(--accent-strong)]">
                Full ledger →
              </Link>
            </div>
            {ledger.length === 0 ? (
              <p className="mt-3 text-[13.5px] text-[var(--text-muted)]">
                No hours logged yet.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col divide-y divide-[var(--line-slate-2)]">
                {ledger.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-4 py-[10px]">
                    <span className="min-w-0 truncate text-[13.5px] text-[var(--text-body)]">
                      {l.description}
                    </span>
                    <span className="flex-none text-[13px] font-semibold text-[var(--text-heading)]">
                      {hrs(l.hours)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </PortalShell>
  );
}
