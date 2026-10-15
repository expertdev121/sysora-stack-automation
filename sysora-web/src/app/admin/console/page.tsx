import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
import { HealthPill } from "@/components/admin/console/HealthPill";
import { Card, CardHeader, EmptyState, PageHeading } from "@/components/admin/ui";
import { requirePipeline } from "@/lib/admin/auth";
import { getClients, getTickets, getBuildRequests, getWeeklyHours } from "@/lib/admin/console";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Operations", robots: { index: false } };

const hrs = (n: number) => `${Math.round(n * 100) / 100}h`;

/**
 * The console overview: what is outstanding, who needs attention, and
 * how much work actually went out the door this week.
 *
 * "Hours outstanding" is the number that matters most and the one no
 * other page shows — it is unearned revenue, work already paid for and
 * still owed.
 */
export default async function ConsolePage() {
  const session = await requirePipeline();
  const [clients, tickets, builds, week] = await Promise.all([
    getClients(),
    getTickets(),
    getBuildRequests(),
    getWeeklyHours(),
  ]);

  const withHours = clients.filter((c) => c.purchased > 0);
  const sold = withHours.reduce((a, c) => a + c.purchased, 0);
  const delivered = withHours.reduce((a, c) => a + c.used, 0);
  const openTickets = tickets.filter((t) => t.status !== "resolved");
  const urgent = openTickets.filter((t) => t.priority === "urgent");
  const attention = clients.filter((c) => c.health !== "Healthy" && c.purchased > 0);
  const newBuilds = builds.filter((b) => b.stage === "new");
  const peak = Math.max(1, ...week.map((d) => d.hours));
  const weekTotal = week.reduce((a, d) => a + d.hours, 0);

  const kpis = [
    { k: "Clients with hours", v: String(withHours.length), d: `${clients.length} total` },
    { k: "Hours sold", v: hrs(sold), d: `${hrs(delivered)} delivered` },
    { k: "Hours outstanding", v: hrs(sold - delivered), d: "Work owed" },
    { k: "Open tickets", v: String(openTickets.length), d: `${urgent.length} urgent` },
    { k: "New build requests", v: String(newBuilds.length), d: "Waiting to be scoped" },
  ];

  return (
    <AdminShell session={session}>
      <PageHeading title="Operations overview" eyebrow="Hours, accounts and the queue" />

      <div className="mt-6 grid grid-cols-5 gap-4 to-1180:grid-cols-3 to-640:grid-cols-2">
        {kpis.map((kpi) => (
          <div
            key={kpi.k}
            className="rounded-[14px] border border-[var(--line-slate)] bg-white p-4"
          >
            <p className="text-[11.5px] font-semibold uppercase tracking-[1px] text-[var(--text-muted)]">
              {kpi.k}
            </p>
            <p className="mt-2 font-display text-[26px] font-black leading-none text-[var(--text-heading)]">
              {kpi.v}
            </p>
            <p className="mt-1 text-[12px] text-[var(--text-muted)]">{kpi.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-[1.3fr_1fr] gap-6 to-980:grid-cols-1">
        <Card>
          <CardHeader title="Needs attention" hint="Accounts that are not healthy" />
          {attention.length === 0 ? (
            <EmptyState>Every account with hours is healthy.</EmptyState>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--line-slate-2)]">
              {attention.map((c) => (
                <li key={c.customerId} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[var(--text-heading)]">
                      {c.name}
                    </p>
                    <p className="truncate text-[12.5px] text-[var(--text-muted)]">
                      {c.reason || c.email}
                    </p>
                  </div>
                  <HealthPill health={c.health} />
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/clients"
            className="mt-4 inline-block text-[13px] font-semibold text-[var(--accent-strong)]"
          >
            All clients →
          </Link>
        </Card>

        <Card>
          <CardHeader title="Delivered this week" hint={`${hrs(weekTotal)} logged`} />
          <div className="mt-4 flex h-[150px] items-end gap-2">
            {week.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[11px] text-[var(--text-muted)]">
                  {d.hours > 0 ? d.hours : ""}
                </span>
                <div
                  className="w-full rounded-t-[6px] bg-[linear-gradient(180deg,#00C896,#00A87E)]"
                  style={{ height: `${Math.max(2, (d.hours / peak) * 100)}%` }}
                />
                <span className="text-[11.5px] text-[var(--text-muted)]">{d.day}</span>
              </div>
            ))}
          </div>
          {weekTotal === 0 && (
            <p className="mt-3 text-[12.5px] text-[var(--text-muted)]">
              No time logged yet. Log it from Clients and it appears here and in the client&rsquo;s
              ledger.
            </p>
          )}
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6 to-980:grid-cols-1">
        <Card>
          <CardHeader title="Oldest open tickets" />
          {openTickets.length === 0 ? (
            <EmptyState>Nothing open.</EmptyState>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--line-slate-2)]">
              {openTickets.slice(0, 5).map((t) => (
                <li key={t.id} className="py-3">
                  <p className="text-[14px] font-semibold text-[var(--text-heading)]">{t.subject}</p>
                  <p className="text-[12.5px] text-[var(--text-muted)]">
                    {t.clientName} · {t.reference}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/tickets"
            className="mt-4 inline-block text-[13px] font-semibold text-[var(--accent-strong)]"
          >
            All tickets →
          </Link>
        </Card>

        <Card>
          <CardHeader title="Lifetime value" hint="Paid orders per client" />
          <ul className="flex flex-col divide-y divide-[var(--line-slate-2)]">
            {[...clients]
              .filter((c) => c.lifetimeValue > 0)
              .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
              .slice(0, 5)
              .map((c) => (
                <li key={c.customerId} className="flex items-center justify-between py-3">
                  <span className="truncate text-[14px] text-[var(--text-heading)]">{c.name}</span>
                  <span className="font-semibold text-[var(--text-heading)]">
                    {formatMoney(c.lifetimeValue, "USD")}
                  </span>
                </li>
              ))}
          </ul>
        </Card>
      </div>
    </AdminShell>
  );
}
