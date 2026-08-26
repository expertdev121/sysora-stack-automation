import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
import {
  Card,
  CardHeader,
  EmptyState,
  PageHeading,
  Stat,
  StatusPill,
  Table,
  Td,
  Th,
} from "@/components/admin/ui";
import { redirect } from "next/navigation";

import { canSeeFinances, canSeePipeline, homePathFor, requireStaff } from "@/lib/admin/auth";
import { KIND_LABELS, type RequestRow } from "@/lib/admin/types";
import { formatMoney } from "@/lib/money";
import { salesDb } from "@/lib/supabase/admin";

export default async function AdminOverviewPage() {
  const session = await requireStaff();

  // A field role has no overview to look at; their page is the day.
  if (!canSeePipeline(session.role)) redirect(homePathFor(session.role));

  const seesFinances = canSeeFinances(session.role);
  const db = salesDb();

  const [{ data: requests }, { data: metrics }, { count: contactCount }] = await Promise.all([
    db.from("request_overview").select("*").order("created_at", { ascending: false }).limit(8),
    db.from("daily_metrics").select("*").order("day", { ascending: false }).limit(30),
    db.from("customers").select("id", { count: "exact", head: true }),
  ]);

  const rows = (requests ?? []) as RequestRow[];
  const days = (metrics ?? []) as {
    day: string;
    new_customers: number;
    requests: number;
    survey_starts: number;
    survey_completions: number;
    payments: number;
    revenue_minor: number;
  }[];

  const sum = (key: keyof (typeof days)[number]) =>
    days.reduce((total, day) => total + Number(day[key] ?? 0), 0);

  const openCount = rows.filter((r) =>
    ["submitted", "awaiting_payment", "paid", "in_review", "scoped", "proposal_sent"].includes(
      r.status,
    ),
  ).length;

  return (
    <AdminShell session={session}>
      <PageHeading
        eyebrow="Last 30 days"
        title={`Morning${session.fullName ? `, ${session.fullName.split(" ")[0]}` : ""}.`}
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-10">
        {seesFinances && (
          <Stat
            label="Revenue"
            value={formatMoney(sum("revenue_minor"))}
            accent
            sub={`${sum("payments")} payments`}
          />
        )}
        <Stat label="Requests" value={String(sum("requests"))} sub={`${openCount} open right now`} />
        <Stat
          label="Survey completion"
          value={
            sum("survey_starts") > 0
              ? `${Math.round((sum("survey_completions") / sum("survey_starts")) * 100)}%`
              : "—"
          }
          sub={`${sum("survey_completions")} of ${sum("survey_starts")} finished`}
        />
        <Stat label="Contacts" value={String(contactCount ?? 0)} sub="All time" />
        {!seesFinances && (
          <Stat label="New contacts" value={String(sum("new_customers"))} sub="Last 30 days" />
        )}
      </div>

      {seesFinances && (
        <p className="mb-10 px-4 py-3 rounded-[10px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] text-[13.5px] leading-[1.6] text-[var(--ink-600)]">
          Revenue, targets, spend and the daily activity now live in the{" "}
          <a href="http://localhost:3100" className="font-semibold text-[var(--accent-strong)]">
            sales app
          </a>{" "}
          — one place each, so two screens can never disagree about a number.
        </p>
      )}

      <Card>
        <CardHeader title="Latest requests" hint={`${rows.length} shown`} />
        {rows.length === 0 ? (
          <EmptyState>Nothing yet. Requests land here the moment someone submits a form.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Reference</Th>
                <Th>Contact</Th>
                <Th>Offer</Th>
                <Th>Status</Th>
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
                      {row.customer_email}
                    </span>
                  </Td>
                  <Td>{KIND_LABELS[row.kind]}</Td>
                  <Td>
                    <StatusPill status={row.status} />
                  </Td>
                  {seesFinances && (
                    <Td className="font-mono">
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
