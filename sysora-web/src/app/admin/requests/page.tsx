import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
import {
  Card,
  CardHeader,
  EmptyState,
  PageHeading,
  Pill,
  StatusPill,
  Table,
  Td,
  Th,
} from "@/components/admin/ui";
import { canSeeFinances, requirePipeline } from "@/lib/admin/auth";
import { KIND_LABELS, type RequestRow, type Staff } from "@/lib/admin/types";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/cn";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Requests" };

const FILTERS = [
  { key: "open", label: "Open" },
  { key: "all", label: "All" },
  { key: "build_request", label: "Build requests" },
  { key: "systems_review", label: "Reviews" },
  { key: "systems_team", label: "Systems team" },
  { key: "mine", label: "Assigned to me" },
] as const;

const OPEN_STATUSES = [
  "submitted",
  "awaiting_payment",
  "paid",
  "in_review",
  "scoped",
  "proposal_sent",
];

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await requirePipeline();
  const seesFinances = canSeeFinances(session.role);
  const { filter = "open" } = await searchParams;
  const db = salesDb();

  let query = db.from("request_overview").select("*").order("created_at", { ascending: false });

  if (filter === "open") query = query.in("status", OPEN_STATUSES);
  else if (filter === "mine") query = query.eq("assigned_to", session.userId);
  else if (filter !== "all") query = query.eq("kind", filter);

  const [{ data: requests }, { data: staff }] = await Promise.all([
    query.limit(200),
    db.from("users").select("id, full_name, email").eq("is_active", true),
  ]);

  const rows = (requests ?? []) as RequestRow[];
  const team = new Map(
    ((staff ?? []) as Staff[]).map((s) => [s.id, s.full_name ?? s.email ?? "Someone"]),
  );

  return (
    <AdminShell session={session}>
      <PageHeading eyebrow="Pipeline" title="Requests" />

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((option) => (
          <Link
            key={option.key}
            href={`/admin/requests?filter=${option.key}`}
            className={cn(
              "px-[14px] py-[7px] rounded-full border-[1.5px] text-[13px] font-semibold transition-colors duration-150",
              filter === option.key
                ? "border-[var(--accent)] bg-[var(--mint-50)] text-[var(--accent-strong)]"
                : "border-[var(--border-default)] bg-white text-[var(--ink-500)] hover:bg-[var(--surface-1)]",
            )}
          >
            {option.label}
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader
          title={FILTERS.find((f) => f.key === filter)?.label ?? "Requests"}
          hint={`${rows.length} ${rows.length === 1 ? "request" : "requests"}`}
        />
        {rows.length === 0 ? (
          <EmptyState>Nothing here. Try another filter.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Reference</Th>
                <Th>Contact</Th>
                <Th>Offer</Th>
                <Th>Status</Th>
                <Th>Assigned</Th>
                {seesFinances && <Th>Amount</Th>}
                <Th>Submitted</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-[var(--surface-1)] transition-colors duration-150">
                  <Td>
                    <Link
                      href={`/admin/requests/${row.reference}`}
                      className="font-mono font-semibold text-[var(--accent-strong)]"
                    >
                      {row.reference}
                    </Link>
                  </Td>
                  <Td>
                    <span className="block font-semibold text-[var(--ink-800)]">
                      {row.customer_name ?? "—"}
                    </span>
                    <span className="block text-[12.5px] text-[var(--ink-300)]">
                      {row.customer_company ?? row.customer_email}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap">{KIND_LABELS[row.kind]}</Td>
                  <Td>
                    <StatusPill status={row.status} />
                  </Td>
                  <Td className="whitespace-nowrap">
                    {row.assigned_to ? (
                      <Pill tone="mint">{team.get(row.assigned_to) ?? "Unknown"}</Pill>
                    ) : (
                      <span className="text-[13px] text-[var(--ink-100)]">Unassigned</span>
                    )}
                  </Td>
                  {seesFinances && (
                    <Td className="font-mono whitespace-nowrap">
                      {row.amount > 0 ? formatMoney(row.amount, row.currency) : "Free"}
                    </Td>
                  )}
                  <Td className="text-[13px] text-[var(--ink-300)] whitespace-nowrap">
                    {new Date(row.submitted_at).toLocaleDateString()}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </AdminShell>
  );
}
