import type { Metadata } from "next";

import { Shell } from "@/components/Shell";
import { formatDay } from "@/components/TargetProgress";
import { TargetEditor } from "@/components/TargetEditor";
import { Card, CardHeader, EmptyState, PageHeading, Table, Td, Th } from "@/components/ui";
import { canDeleteTarget, requireFinance } from "@/lib/admin/auth";
import type {
  ActivityProgressRow,
  WorkMetric,
  TargetEconomics,
  TargetRow,
} from "@/lib/admin/types";
import { formatMoney } from "@/lib/money";
import { publicDb, salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Targets" };

export default async function TargetsPage() {
  const session = await requireFinance();
  const db = salesDb();

  const [{ data: targets }, { data: types }, { data: attached }, { data: economics }] =
    await Promise.all([
      db.from("target_progress").select("*").order("starts_on", { ascending: false }),
      publicDb()
        .from("work_metrics")
        .select("id, slug, label, question, unit, sort_order, is_active, feeds_sales")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      db.from("activity_progress").select("*").order("sort_order", { ascending: true }),
      db.from("target_economics").select("*").order("starts_on", { ascending: false }),
    ]);

  const rows = (targets ?? []) as TargetRow[];

  const activityTargets: Record<string, ActivityProgressRow[]> = {};
  for (const row of (attached ?? []) as ActivityProgressRow[]) {
    (activityTargets[row.revenue_target_id] ??= []).push(row);
  }

  const books = (economics ?? []) as TargetEconomics[];

  return (
    <Shell session={session}>
      <PageHeading eyebrow="What we're aiming at" title="Targets" />
      <p className="mt-[-16px] mb-8 max-w-[72ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
        A target runs between two dates. Every payment that succeeds in that window counts toward
        it, along with anything added by hand. Windows can&apos;t overlap, so each day belongs to
        exactly one target and no money is counted twice. The activity numbers underneath are the
        lead measures — the work that produces the money.
      </p>

      <TargetEditor
        targets={rows}
        activityTypes={(types ?? []) as WorkMetric[]}
        activityTargets={activityTargets}
        canDelete={canDeleteTarget(session.role)}
      />

      <div className="mt-10">
        <Card>
          <CardHeader title="What each period actually earned" hint="Revenue less what it cost" />
          {books.length === 0 ? (
            <EmptyState>No targets yet.</EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Period</Th>
                  <Th>Revenue</Th>
                  <Th>Spend</Th>
                  <Th>Net</Th>
                  <Th>Return</Th>
                  <Th>Clients</Th>
                  <Th>Each cost</Th>
                </tr>
              </thead>
              <tbody>
                {books.map((row) => (
                  <tr
                    key={row.revenue_target_id}
                    className="hover:bg-[var(--surface-1)] transition-colors duration-150"
                  >
                    <Td>
                      <span className="block font-semibold text-[var(--ink-800)]">
                        {row.name ?? "Unnamed"}
                      </span>
                      <span className="block text-[12.5px] text-[var(--ink-300)] whitespace-nowrap">
                        {formatDay(row.starts_on)} → {formatDay(row.ends_on)}
                      </span>
                    </Td>
                    <Td className="[font-variant-numeric:tabular-nums]">
                      {formatMoney(row.revenue_achieved)}
                    </Td>
                    <Td className="[font-variant-numeric:tabular-nums]">
                      {formatMoney(row.spend_total)}
                    </Td>
                    <Td
                      className={`[font-variant-numeric:tabular-nums] font-semibold ${
                        row.net < 0 ? "text-[var(--danger-600)]" : "text-[var(--ink-800)]"
                      }`}
                    >
                      {formatMoney(row.net)}
                    </Td>
                    <Td className="[font-variant-numeric:tabular-nums]">
                      {row.return_multiple === null ? (
                        <span className="text-[var(--ink-100)]">—</span>
                      ) : (
                        `${row.return_multiple}×`
                      )}
                    </Td>
                    <Td className="[font-variant-numeric:tabular-nums]">{row.paying_clients}</Td>
                    <Td className="[font-variant-numeric:tabular-nums]">
                      {row.cost_per_client === null ? (
                        <span className="text-[var(--ink-100)]">—</span>
                      ) : (
                        formatMoney(row.cost_per_client)
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
        <p className="mt-3 mb-0 max-w-[72ch] text-[12.5px] leading-[1.65] text-[var(--ink-300)]">
          Return is blank when nothing was spent — &ldquo;we made 4×&rdquo; and &ldquo;we spent
          nothing&rdquo; are different statements, and showing a zero would read as the first.
        </p>
      </div>
    </Shell>
  );
}
