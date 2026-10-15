import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { TicketStatusSelect } from "@/components/admin/console/TicketStatusSelect";
import { TicketPill } from "@/components/admin/console/HealthPill";
import { Card, EmptyState, PageHeading, Table, Td, Th } from "@/components/admin/ui";
import { requirePipeline } from "@/lib/admin/auth";
import { getTickets } from "@/lib/admin/console";

export const metadata: Metadata = { title: "Support tickets", robots: { index: false } };

const PRIORITY_TONE: Record<string, string> = {
  urgent: "#B4472F",
  high: "#C2410C",
  normal: "var(--text-muted)",
};

/** How long a ticket has been waiting, which is the thing that matters. */
function age(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export default async function TicketsPage() {
  const session = await requirePipeline();
  const tickets = await getTickets();

  const open = tickets.filter((t) => t.status !== "resolved");
  const resolved = tickets.filter((t) => t.status === "resolved");

  // Urgent first, then oldest — the queue you would work top to bottom.
  const rank: Record<string, number> = { urgent: 0, high: 1, normal: 2 };
  const queue = [...open].sort(
    (a, b) =>
      (rank[a.priority] ?? 2) - (rank[b.priority] ?? 2) ||
      Date.parse(a.createdAt) - Date.parse(b.createdAt),
  );

  return (
    <AdminShell session={session}>
      <PageHeading
        title="Support tickets"
        eyebrow={`${open.length} open, ${resolved.length} resolved`}
      />

      <Card className="mt-6">
        {queue.length === 0 ? (
          <EmptyState>Nothing open. Every ticket is resolved.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Ticket</Th>
                <Th>Client</Th>
                <Th>Priority</Th>
                <Th>Waiting</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {queue.map((t) => (
                <tr key={t.id}>
                  <Td>
                    <span className="block font-semibold text-[var(--text-heading)]">
                      {t.subject}
                    </span>
                    <span className="block font-mono text-[12px] text-[var(--text-muted)]">
                      {t.reference}
                    </span>
                  </Td>
                  <Td>{t.clientName}</Td>
                  <Td>
                    <span
                      className="text-[13px] font-semibold capitalize"
                      style={{ color: PRIORITY_TONE[t.priority] ?? "var(--text-muted)" }}
                    >
                      {t.priority}
                    </span>
                  </Td>
                  <Td>{age(t.createdAt)}</Td>
                  <Td>
                    <TicketStatusSelect ticketId={t.id} status={t.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {resolved.length > 0 && (
        <Card className="mt-6">
          <Table>
            <thead>
              <tr>
                <Th>Resolved</Th>
                <Th>Client</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {resolved.slice(0, 25).map((t) => (
                <tr key={t.id}>
                  <Td>
                    <span className="block text-[var(--text-heading)]">{t.subject}</span>
                    <span className="block font-mono text-[12px] text-[var(--text-muted)]">
                      {t.reference}
                    </span>
                  </Td>
                  <Td>{t.clientName}</Td>
                  <Td>
                    <TicketPill status={t.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </AdminShell>
  );
}
