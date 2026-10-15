import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { HealthPill } from "@/components/admin/console/HealthPill";
import { LogTimePanel } from "@/components/admin/console/LogTimePanel";
import { Card, CardHeader, EmptyState, PageHeading } from "@/components/admin/ui";
import { requirePipeline } from "@/lib/admin/auth";
import { getClientDetail } from "@/lib/admin/console";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Client", robots: { index: false } };

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
 * One client in full: balance, plan, lifetime value, the ledger, and
 * the controls to log time or top them up.
 *
 * The design shows this as a drawer over the table. It is a page here
 * because a drawer cannot be linked to, and "send me that client" is
 * the first thing anyone asks for.
 */
export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const session = await requirePipeline();
  const { customerId } = await params;
  const { client, ledger, entitlements } = await getClientDetail(customerId);

  if (!client) notFound();

  return (
    <AdminShell session={session}>
      <Link
        href="/admin/clients"
        className="text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-heading)]"
      >
        ← All clients
      </Link>

      <div className="mt-3">
        <PageHeading title={client.name} eyebrow={client.email} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <HealthPill health={client.health} />
        {client.reason && (
          <span className="text-[13px] text-[var(--text-muted)]">{client.reason}</span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4 to-860:grid-cols-2">
        {[
          ["Purchased", hrs(client.purchased)],
          ["Used", hrs(client.used)],
          ["Left", hrs(client.remaining)],
          ["Lifetime value", formatMoney(client.lifetimeValue, "USD")],
        ].map(([k, v]) => (
          <div key={k} className="rounded-[14px] border border-[var(--line-slate)] bg-white p-4">
            <p className="text-[11.5px] font-semibold uppercase tracking-[1px] text-[var(--text-muted)]">
              {k}
            </p>
            <p className="mt-2 font-display text-[22px] font-black text-[var(--text-heading)]">{v}</p>
          </div>
        ))}
      </div>

      <LogTimePanel
        clients={[{ id: client.customerId, label: `${client.name} — ${hrs(client.remaining)} left` }]}
      />

      <div className="mt-6 grid grid-cols-[1.4fr_1fr] gap-6 to-980:grid-cols-1">
        <Card>
          <CardHeader title="Time logged" hint={`${ledger.length} entries`} />
          {ledger.length === 0 ? (
            <EmptyState>Nothing logged against this client yet.</EmptyState>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--line-slate-2)]">
              {ledger.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-4 py-[11px]">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] text-[var(--text-heading)]">
                      {l.description}
                      {!l.billable && (
                        <span className="ml-2 rounded-full bg-[var(--mint-50)] px-2 py-[1px] text-[11px] font-semibold text-[var(--accent-strong)]">
                          not billed
                        </span>
                      )}
                    </p>
                    <p className="text-[12px] text-[var(--text-muted)]">
                      {new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" · "}
                      {KIND_LABEL[l.kind] ?? l.kind}
                    </p>
                  </div>
                  <span className="flex-none font-semibold text-[var(--text-heading)]">
                    {l.hours.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Hours granted" hint="Every entitlement on the account" />
          {entitlements.length === 0 ? (
            <EmptyState>No hours granted yet.</EmptyState>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--line-slate-2)]">
              {entitlements.map((e) => (
                <li key={e.id as string} className="py-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-[var(--text-heading)]">
                      {Number(e.hours)}h
                    </span>
                    <span className="text-[12px] capitalize text-[var(--text-muted)]">
                      {String(e.source)}
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--text-muted)]">
                    {new Date(String(e.starts_at)).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {e.expires_at
                      ? ` · expires ${new Date(String(e.expires_at)).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                      : e.resets_at
                        ? ` · resets ${new Date(String(e.resets_at)).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                        : ""}
                  </p>
                  {e.note ? (
                    <p className="mt-1 text-[12px] italic text-[var(--text-muted)]">{String(e.note)}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}
