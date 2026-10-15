import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
import { HealthPill } from "@/components/admin/console/HealthPill";
import { LogTimePanel } from "@/components/admin/console/LogTimePanel";
import { Card, EmptyState, PageHeading, Table, Td, Th } from "@/components/admin/ui";
import { requirePipeline } from "@/lib/admin/auth";
import { getClients } from "@/lib/admin/console";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Clients", robots: { index: false } };

const hrs = (n: number) => `${Math.round(n * 100) / 100}h`;

/**
 * Every client, with the hours they bought, the hours we delivered and
 * what that leaves. Sorted so the accounts that need something today
 * float to the top rather than being buried under the healthy ones.
 */
export default async function ClientsPage() {
  const session = await requirePipeline();
  const clients = await getClients();

  const rank = { "Payment failed": 0, Expiring: 1, "Low balance": 2, "Used up": 3, Healthy: 4 };
  const sorted = [...clients].sort(
    (a, b) => rank[a.health] - rank[b.health] || b.lifetimeValue - a.lifetimeValue,
  );

  return (
    <AdminShell session={session}>
      <PageHeading
        title="Clients"
        eyebrow={`${clients.length} ${clients.length === 1 ? "account" : "accounts"}`}
      />

      <LogTimePanel
        clients={clients.map((c) => ({ id: c.customerId, label: `${c.name} — ${hrs(c.remaining)} left` }))}
      />

      {/* The design's filter chips. Counts come from the same health
          verdict the table and the overview use. */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(["All", "Healthy", "Low balance", "Expiring", "Payment failed", "Used up"] as const).map(
          (f) => {
            const n = f === "All" ? clients.length : clients.filter((c) => c.health === f).length;
            return (
              <span
                key={f}
                className="inline-flex items-center gap-[6px] rounded-full border border-[var(--line-mint)] bg-white px-[13px] py-[6px] text-[12.5px] font-medium text-[var(--ink-600)]"
              >
                {f}
                <span className="font-semibold text-[var(--text-muted)]">{n}</span>
              </span>
            );
          },
        )}
      </div>

      <Card className="mt-6">
        {sorted.length === 0 ? (
          <EmptyState>No clients yet. The first paid order creates one.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Status</Th>
                <Th className="text-right">Hours</Th>
                <Th className="text-right">Remaining</Th>
                <Th className="text-right">Lifetime</Th>
                <Th className="text-right">Tickets</Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.customerId}>
                  <Td>
                    <Link
                      href={`/admin/clients/${c.customerId}`}
                      className="block font-semibold text-[var(--ink-900)] hover:text-[var(--accent-strong)]"
                    >
                      {c.name}
                    </Link>
                    <span className="block text-[12.5px] text-[var(--text-muted)]">{c.email}</span>
                  </Td>
                  <Td>
                    <HealthPill health={c.health} />
                    {c.reason && (
                      <span className="mt-1 block text-[12px] text-[var(--text-muted)]">
                        {c.reason}
                      </span>
                    )}
                  </Td>
                  <Td className="text-right">
                    {hrs(c.used)} of {hrs(c.purchased)}
                  </Td>
                  <Td className="text-right font-semibold">{hrs(c.remaining)}</Td>
                  <Td className="text-right">{formatMoney(c.lifetimeValue, "USD")}</Td>
                  <Td className="text-right">{c.openTickets || "—"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </AdminShell>
  );
}
