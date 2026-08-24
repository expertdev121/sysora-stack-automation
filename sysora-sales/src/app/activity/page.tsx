import type { Metadata } from "next";
import Link from "next/link";

import { ActivityProgress } from "@/components/ActivityProgress";
import { Shell } from "@/components/Shell";
import { formatDay } from "@/components/TargetProgress";
import { Card, CardHeader, EmptyState, PageHeading, Pill, Table, Td, Th } from "@/components/ui";
import { requireFinance } from "@/lib/admin/auth";
import {
  ROLE_LABELS,
  type ActivityByUserRow,
  type ActivityProgressRow,
  type EodReportRow,
  type TargetRow,
  type UnattributedActivity,
} from "@/lib/admin/types";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Activity" };

/**
 * The lead measures.
 *
 * Revenue reports a week that already finished. These are the things
 * somebody can still change today, which is why they get their own page
 * rather than a footnote under the money.
 */
export default async function ActivityPage() {
  const session = await requireFinance();
  const db = salesDb();

  const { data: current } = await db
    .from("target_progress")
    .select("*")
    .eq("status", "active")
    .order("starts_on", { ascending: false })
    .limit(1)
    .maybeSingle();

  const target = current as TargetRow | null;

  if (!target) {
    return (
      <Shell session={session}>
        <PageHeading eyebrow="Lead measures" title="Activity" />
        <Card>
          <EmptyState>
            No target is running today. Set one under{" "}
            <Link href="/targets" className="font-semibold text-[var(--accent-strong)]">
              Targets
            </Link>{" "}
            and attach the activity numbers that produce it.
          </EmptyState>
        </Card>
      </Shell>
    );
  }

  const [{ data: activities }, { data: byUser }, { data: reports }, { data: outside }] =
    await Promise.all([
      db
        .from("activity_progress")
        .select("*")
        .eq("revenue_target_id", target.id)
        .order("sort_order", { ascending: true }),
      db.from("activity_progress_by_user").select("*").eq("revenue_target_id", target.id),
      db
        .from("eod_report_overview")
        .select("*")
        .gte("reported_on", target.starts_on)
        .lte("reported_on", target.ends_on)
        .order("reported_on", { ascending: false }),
      db.from("unattributed_activity").select("*"),
    ]);

  const rows = (activities ?? []) as ActivityProgressRow[];
  const contributions = (byUser ?? []) as ActivityByUserRow[];
  const filed = (reports ?? []) as EodReportRow[];
  const unattributed = (outside ?? []) as UnattributedActivity[];

  // Which elapsed days of this window nobody reported at all.
  const elapsed: string[] = [];
  const start = new Date(target.starts_on + "T00:00:00Z");
  for (let i = 0; i < target.days_elapsed; i += 1) {
    const day = new Date(start);
    day.setUTCDate(day.getUTCDate() + i);
    elapsed.push(day.toISOString().slice(0, 10));
  }
  const reportedDays = new Set(filed.map((r) => r.reported_on));
  const silent = elapsed.filter((day) => !reportedDays.has(day));
  const covered = elapsed.length - silent.length;

  const people = new Map<string, { name: string; role: string; counts: Record<string, number> }>();
  for (const row of contributions) {
    const entry = people.get(row.user_id) ?? {
      name: row.full_name ?? row.email,
      role: ROLE_LABELS[row.role] ?? row.role,
      counts: {},
    };
    entry.counts[row.activity_type_id] = row.achieved;
    people.set(row.user_id, entry);
  }

  return (
    <Shell session={session}>
      <PageHeading
        eyebrow={`${formatDay(target.starts_on)} → ${formatDay(target.ends_on)}`}
        title="Activity"
      />

      {rows.length === 0 ? (
        <Card>
          <EmptyState>
            This target has no activity numbers yet. Add them under{" "}
            <Link href="/targets" className="font-semibold text-[var(--accent-strong)]">
              Targets
            </Link>
            .
          </EmptyState>
        </Card>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 mb-8">
          {rows.map((row) => (
            <ActivityProgress key={row.activity_target_id} row={row} />
          ))}
        </div>
      )}

      {people.size > 0 && (
        <Card className="mb-8">
          <CardHeader title="Who's doing the work" hint={`${people.size} contributing`} />
          <Table>
            <thead>
              <tr>
                <Th>Person</Th>
                {rows.map((row) => (
                  <Th key={row.activity_type_id}>{row.label}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...people.entries()].map(([id, person]) => (
                <tr key={id} className="hover:bg-[var(--surface-1)] transition-colors duration-150">
                  <Td>
                    <span className="block font-semibold text-[var(--ink-800)]">{person.name}</span>
                    <span className="block text-[12.5px] text-[var(--ink-300)]">{person.role}</span>
                  </Td>
                  {rows.map((row) => (
                    <Td
                      key={row.activity_type_id}
                      className="[font-variant-numeric:tabular-nums]"
                    >
                      {person.counts[row.activity_type_id] ?? (
                        <span className="text-[var(--ink-100)]">—</span>
                      )}
                    </Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader title="Reporting" hint={`${covered} of ${elapsed.length} days covered`} />
        <div className="px-6 py-5">
          {silent.length === 0 ? (
            <p className="m-0 text-[14px] text-[var(--ink-500)]">
              Every elapsed day of this period has a report. The numbers above are complete.
            </p>
          ) : (
            <>
              <p className="m-0 mb-3 text-[14px] leading-[1.7] text-[var(--ink-500)]">
                {silent.length} {silent.length === 1 ? "day has" : "days have"} no report at all.
                Those days are missing, not zero — the totals above are the floor, not the number.
              </p>
              <div className="flex flex-wrap gap-2">
                {silent.map((day) => (
                  <Pill key={day} tone="amber">
                    {formatDay(day)}
                  </Pill>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      {unattributed.length > 0 && (
        <Card className="mb-8">
          <CardHeader title="Outside every target" />
          <div className="px-6 py-5">
            <p className="m-0 mb-3 text-[13.5px] leading-[1.7] text-[var(--ink-400)]">
              Work logged on days no target window covers. It counted toward nothing.
            </p>
            <div className="flex flex-wrap gap-6">
              {unattributed.map((row) => (
                <div key={row.activity_type_id}>
                  <p className="m-0 font-mono text-[10px] tracking-[1.4px] uppercase text-[var(--ink-200)]">
                    {row.label}
                  </p>
                  <p className="mt-1 mb-0 text-[20px] font-semibold text-[var(--ink-800)]">
                    {row.achieved.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Daily reports" hint={`${filed.length} filed this period`} />
        {filed.length === 0 ? (
          <EmptyState>Nothing filed inside this window yet.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Day</Th>
                <Th>Person</Th>
                <Th>Total</Th>
                <Th>Note</Th>
              </tr>
            </thead>
            <tbody>
              {filed.slice(0, 80).map((row) => (
                <tr key={row.id}>
                  <Td className="whitespace-nowrap">{formatDay(row.reported_on)}</Td>
                  <Td className="font-semibold text-[var(--ink-800)]">
                    {row.full_name ?? row.email}
                  </Td>
                  <Td className="[font-variant-numeric:tabular-nums]">
                    {row.total_count.toLocaleString()}
                  </Td>
                  <Td className="text-[13px] text-[var(--ink-400)]">{row.notes ?? ""}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </Shell>
  );
}
