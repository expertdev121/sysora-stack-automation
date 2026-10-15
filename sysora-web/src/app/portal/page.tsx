import type { Metadata } from "next";
import Link from "next/link";

import { HoursRing } from "@/components/portal/HoursRing";
import { PortalShell } from "@/components/portal/PortalShell";
import { QuickActions, type QuickAction } from "@/components/portal/QuickActions";
import { requireClient } from "@/lib/portal/auth";
import {
  getBalance,
  getCardOnFile,
  getChrome,
  getPlan,
  getTasks,
  getTickets,
} from "@/lib/portal/queries";

export const metadata: Metadata = {
  title: "Client portal",
  robots: { index: false, follow: false },
};

const hrs = (n: number) => `${(Math.round(n * 100) / 100).toFixed(2)}h`;
const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fullDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const money = (minor: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(minor / 100);

/** Pill and dot share a colour per status, so a row reads at a glance. */
const TASK_TONE: Record<string, { bg: string; fg: string; label: string }> = {
  queued: { bg: "#F7F9F7", fg: "#475569", label: "Queued" },
  in_progress: { bg: "#F0FAF6", fg: "#00A87E", label: "In progress" },
  in_review: { bg: "#EEF6EF", fg: "#3E6B4F", label: "In review" },
  blocked: { bg: "#FFF4E5", fg: "#C2410C", label: "Blocked" },
};

/** "2h ago" for today, a date once it is older. */
function since(iso: string): string {
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  return day(iso);
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function PortalOverview() {
  const session = await requireClient();
  const chrome = await getChrome(session.customerId);
  const [balance, tasks, tickets, plan, card] = await Promise.all([
    getBalance(session.customerId),
    getTasks(session.customerId),
    getTickets(session.customerId),
    getPlan(session.customerId),
    getCardOnFile(session.customerId),
  ]);

  const openTickets = tickets.filter((t) => t.status !== "resolved");
  const first = (session.fullName ?? "").split(" ")[0];
  const currency = plan?.currency ?? "USD";

  // Hours already promised to work that has not started. Queued tasks
  // only: anything in flight is already showing up in the ledger.
  const pendingEst = tasks
    .filter((t) => t.status === "queued")
    .reduce((sum, t) => sum + (t.estimateHours ?? 0), 0);

  const usedRatio = balance.purchased > 0 ? Math.min(1, balance.used / balance.purchased) : 0;

  const planName = plan
    ? `${plan.hours}-hour ${plan.monthly ? "monthly plan" : "pack"}`
    : "No active plan";

  const renewal = balance.nextReset ?? balance.nextExpiry;
  const resetCopy = balance.nextReset
    ? `Balance resets on ${fullDay(balance.nextReset)}. Unused hours do not roll over, and the unused part of this cycle is refundable before it resets.`
    : balance.nextExpiry
      ? `These hours are valid until ${fullDay(balance.nextExpiry)}. Unused hours do not roll over once the pack expires.`
      : "These hours do not expire. Buy more at any time and they are added to the same balance.";

  const actions: QuickAction[] = [
    { href: "/portal/support", icon: "ticket", label: "Submit a support ticket", sub: "Triage any hour" },
    { href: "/portal/build-requests", icon: "build", label: "Request a build", sub: "Free scope and quote" },
    { href: "/portal/invoices", icon: "invoice", label: "View invoices", sub: "Download receipts" },
    {
      href: "/portal/billing",
      icon: "card",
      label: "Update payment card",
      sub: card?.last4 ? `${card.brand ?? "Card"} ending ${card.last4}` : "No card on file",
    },
  ];

  return (
    <PortalShell
      eyebrow="Client portal"
      title={first ? `${greeting()}, ${first}` : "Your account"}
      openTickets={chrome.openTickets}
      remaining={chrome.remaining}
      purchased={chrome.purchased}
      userName={session.fullName}
      userEmail={session.email}
      company={chrome.company}
    >
      <div className="flex flex-col gap-5">
        <section className="grid grid-cols-[150px_1fr] items-center gap-9 rounded-[18px] border border-[var(--line-mint)] bg-white p-[30px] to-860:grid-cols-1 to-860:justify-items-center to-860:gap-6">
          <HoursRing remaining={balance.remaining} purchased={balance.purchased} />

          <div className="flex w-full flex-col gap-[14px]">
            <div className="flex items-center gap-[10px]">
              <h2 className="text-[22px] font-bold text-[var(--ink-900)]">{planName}</h2>
              {plan ? (
                <span className="rounded-full bg-[#F0FAF6] px-[10px] py-[4px] text-[12px] font-semibold text-[var(--accent-strong)]">
                  Active
                </span>
              ) : null}
            </div>

            <p className="text-[13.5px] leading-[1.65] text-[var(--ink-600)]">{resetCopy}</p>

            <div
              className="h-[10px] w-full overflow-hidden rounded-full bg-[var(--line-mint-2)]"
              role="img"
              aria-label={`${hrs(balance.used)} of ${hrs(balance.purchased)} used`}
            >
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#00C896,#00A87E)]"
                style={{ width: `${Math.round(usedRatio * 1000) / 10}%` }}
              />
            </div>

            <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-[13px]">
              {[
                [hrs(balance.purchased), "purchased"],
                [hrs(balance.used), "used"],
                [hrs(pendingEst), "estimated on queued work"],
                [plan ? money(plan.rate, currency) : "—", "/ hr"],
              ].map(([value, label]) => (
                <div key={label} className="flex items-baseline gap-[6px]">
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-bold text-[var(--ink-900)]">{value}</dd>
                  <span className="text-[var(--text-muted)]">{label}</span>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <QuickActions actions={actions} />

        <div className="grid grid-cols-[1.45fr_1fr] items-start gap-5 to-980:grid-cols-1">
          <section className="overflow-hidden rounded-[18px] border border-[var(--line-mint)] bg-white">
            <header className="flex items-center justify-between border-b border-[var(--line-mint-2)] px-[22px] py-[18px]">
              <h2 className="text-[18px] font-bold text-[var(--ink-900)]">Work in progress</h2>
              <Link
                href="/portal/hours"
                className="text-[13px] font-semibold text-[var(--accent-strong)]"
              >
                Hours ledger →
              </Link>
            </header>

            {tasks.length === 0 ? (
              <p className="px-[22px] py-8 text-[13.5px] text-[var(--text-muted)]">
                Nothing open right now. Send us a list and it appears here.
              </p>
            ) : (
              <ul className="flex flex-col">
                {tasks.map((t) => {
                  const tone = TASK_TONE[t.status] ?? TASK_TONE.queued;
                  return (
                    <li
                      key={t.id}
                      className="flex items-center gap-3 border-b border-[var(--line-mint-2)] px-[22px] py-[15px] last:border-b-0"
                    >
                      <span
                        className="h-[8px] w-[8px] flex-none rounded-full"
                        style={{ background: tone.fg }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-[var(--ink-900)]">
                          {t.title}
                        </p>
                        <p className="truncate text-[12.5px] text-[var(--text-muted)]">
                          {t.detail ?? (t.estimateHours ? `est. ${t.estimateHours}h` : "—")}
                        </p>
                      </div>
                      <span
                        className="flex-none rounded-full px-[10px] py-[4px] text-[12px] font-semibold"
                        style={{ background: tone.bg, color: tone.fg }}
                      >
                        {tone.label}
                      </span>
                      <span className="w-[52px] flex-none text-right text-[13.5px] font-semibold text-[var(--ink-900)]">
                        {hrs(t.loggedHours)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="overflow-hidden rounded-[18px] border border-[var(--line-mint)] bg-white">
            <header className="flex items-center justify-between border-b border-[var(--line-mint-2)] px-[22px] py-[18px]">
              <h2 className="text-[18px] font-bold text-[var(--ink-900)]">Open tickets</h2>
              <Link
                href="/portal/support"
                className="text-[13px] font-semibold text-[var(--accent-strong)]"
              >
                All tickets →
              </Link>
            </header>

            {openTickets.length === 0 ? (
              <p className="px-[22px] py-8 text-[13.5px] text-[var(--text-muted)]">
                No open tickets.
              </p>
            ) : (
              <ul className="flex flex-col">
                {openTickets.slice(0, 3).map((k) => (
                  <li
                    key={k.id}
                    className="border-b border-[var(--line-mint-2)] px-[22px] py-[15px]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[12px] text-[var(--accent-strong)]">
                        {k.reference}
                      </span>
                      <span className="text-[12px] text-[var(--text-muted)]">
                        {since(k.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-[2px] truncate text-[14px] font-semibold text-[var(--ink-900)]">
                      {k.subject}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {plan?.monthly && renewal ? (
              <div className="flex items-center justify-between gap-[10px] px-[22px] py-4">
                <span className="text-[13px] text-[var(--text-muted)]">
                  Next invoice {day(renewal)}
                </span>
                <span className="text-[14px] font-semibold text-[var(--ink-900)]">
                  {money(plan.amount, currency)}
                </span>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </PortalShell>
  );
}
