import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardHeader, EmptyState, PageHeading, Pill, Table, Td, Th } from "@/components/admin/ui";
import { requirePipeline } from "@/lib/admin/auth";
import type { ContactRow } from "@/lib/admin/types";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Contacts" };

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requirePipeline();
  const { q = "" } = await searchParams;
  const db = salesDb();

  let query = db.from("customers").select("*").order("created_at", { ascending: false });

  if (q.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(
      `email.ilike.${term},full_name.ilike.${term},company_name.ilike.${term}`,
    );
  }

  const { data: customers } = await query.limit(200);
  const rows = (customers ?? []) as ContactRow[];

  // How many requests each contact has, so the list shows who is active.
  const { data: requests } = await db.from("requests").select("customer_id");
  const counts = new Map<string, number>();
  for (const row of (requests ?? []) as { customer_id: string }[]) {
    counts.set(row.customer_id, (counts.get(row.customer_id) ?? 0) + 1);
  }

  return (
    <AdminShell session={session}>
      <PageHeading eyebrow="Everyone who ever gave us an email" title="Contacts" />

      <form method="get" className="flex flex-wrap gap-2 mb-6">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name, email or company"
          className="flex-1 min-w-[260px] px-[14px] py-[10px] rounded-[10px] border-[1.5px] border-[var(--border-default)] bg-white text-[14px] outline-none focus:border-[var(--accent)] focus:shadow-[var(--focus-shadow)]"
        />
        <button
          type="submit"
          className="px-5 py-[10px] rounded-[10px] border-[1.5px] border-[var(--border-default)] bg-white text-[14px] font-semibold leading-[normal] text-[var(--ink-600)] cursor-pointer hover:bg-[var(--mint-50)]"
        >
          Search
        </button>
        {q && (
          <Link
            href="/admin/contacts"
            className="px-5 py-[10px] rounded-[10px] text-[14px] font-semibold text-[var(--ink-300)] self-center"
          >
            Clear
          </Link>
        )}
      </form>

      <Card>
        <CardHeader title={q ? `Matching “${q}”` : "All contacts"} hint={`${rows.length} shown`} />
        {rows.length === 0 ? (
          <EmptyState>{q ? "Nobody matches that." : "No contacts yet."}</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Company</Th>
                <Th>Requests</Th>
                <Th>Source</Th>
                <Th>First seen</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-[var(--surface-1)] transition-colors duration-150">
                  <Td className="font-semibold text-[var(--ink-800)]">{row.full_name ?? "—"}</Td>
                  <Td>
                    <a href={`mailto:${row.email}`}>{row.email}</a>
                  </Td>
                  <Td>{row.company_name ?? "—"}</Td>
                  <Td>
                    {counts.get(row.id) ? (
                      <Pill tone="mint">{counts.get(row.id)}</Pill>
                    ) : (
                      <span className="text-[13px] text-[var(--ink-100)]">—</span>
                    )}
                  </Td>
                  <Td className="text-[13px] text-[var(--ink-300)]">
                    {row.utm_source ? `${row.utm_source}${row.utm_campaign ? ` / ${row.utm_campaign}` : ""}` : "Direct"}
                  </Td>
                  <Td className="text-[13px] text-[var(--ink-300)] whitespace-nowrap">
                    {new Date(row.created_at).toLocaleDateString()}
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
