import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
import { Scoreboard } from "@/components/admin/Scoreboard";
import { formatDay } from "@/components/admin/TargetProgress";
import {
  Card,
  CardHeader,
  EmptyState,
  PageHeading,
  Pill,
  Table,
  Td,
  Th,
} from "@/components/admin/ui";
import { requireActivityView } from "@/lib/admin/auth";
import {
  ROLE_LABELS,
  type ActivityByUserRow,
  type ActivityProgressRow,
  type TargetRow,
  type UnattributedActivity,
} from "@/lib/admin/types";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Scoreboard" };

/**
 * Everything about the current period on one page: the lag measure, the
 * lead measures, who is doing the work, and which days nobody reported.
 *
 * The missing-days list is not an afterthought. A lead measure whose
 * numbers arrive on four days out of ten isn't a measure, and the only
 * way anybody notices is if the gaps are shown as loudly as the totals.
 */
export default async function ScoreboardPage() {
  const session = await requireActivityView();
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
      <AdminShell session={session}>
        <PageHeading eyebrow="This period" title="Scoreboard" />
        <Card>
          <EmptyState>
            No target is running today. Set one under{" "}
            <Link href="/admin/targets" className="font-semibold text-[var(--accent-strong)]">
              Targets
            </Link>{" "}
            and the scoreboard fills in.
          </EmptyState>
        </Card>
      </AdminShell>
    );
  }

  const [{ data: activities }, { data: byUser }, { data: reported }, { data: outside }] =
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
  const reports = (reported ?? []) as {
    id: string;
    user_id: string;
    full_name: string | null;
    email: string;
    role: keyof typeof ROLE_LABELS;
    reported_on: string;
    notes: string | null;
    total_count: number;
  }[];
  const unattributed = (outside ?? []) as UnattributedActivity[];

  // Which days inside the window so far have no report from anybody.
  const elapsed: string[] = [];
  const start = new Date(target.starts_on + "T00:00:00Z");
  for (let i = 0; i < target.days_elapsed; i += 1) {
    const day = new Date(start);
    day.setUTCDate(day.getUTCDate() + i);
    elapsed.push(day.toISOString().slice(0, 10));
  }
  const filed = new Set(reports.map((r) => r.reported_on));
  const silent = elapsed.filter((day) => !filed.has(day));

  // Count only days that have both elapsed and been reported. A report
  // may legitimately be dated a day ahead of the server — somebody east
  // of UTC filing after their midnight — and counting those against
  // elapsed days would claim more coverage than exists.
  const covered = elapsed.length - silent.length;

  // One row per person, with a column per activity.
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
    <AdminShell session={session}>
      <PageHeading
        eyebrow={`${formatDay(target.starts_on)} → ${formatDay(target.ends_on)}`}
        title="Scoreboard"
      />

      <Scoreboard
        target={target}
        activities={rows}
        footer={
          <Link href="/admin/targets" className="text-[13px] font-semibold">
            Adjust targets →
          </Link>
        }
      />

      {rows.length === 0 && (
        <Card className="mt-6">
          <EmptyState>
            This target has no lead measures yet. Revenue tells you what already happened; add the
            activities that produce it under{" "}
            <Link href="/admin/targets" className="font-semibold text-[var(--accent-strong)]">
              Targets
            </Link>
            .
          </EmptyState>
        </Card>
      )}

      {people.size > 0 && (
        <Card className="mt-8">
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
                    <Td key={row.activity_type_id} className="font-mono">
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

      <Card className="mt-8">
        <CardHeader title="Reporting" hint={`${covered} of ${elapsed.length} days covered`} />
        <div className="px-6 py-5">
          {silent.length === 0 ? (
            <p className="m-0 text-[14px] text-[var(--ink-500)]">
              Every day of this period has a report. The numbers above are complete.
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
        <Card className="mt-8">
          <CardHeader title="Outside every target" />
          <div className="px-6 py-5">
            <p className="m-0 mb-3 text-[13.5px] leading-[1.7] text-[var(--ink-400)]">
              Work logged on days no target window covers. It counted toward nothing — create a
              target over those dates if it should have.
            </p>
            <div className="flex flex-wrap gap-4">
              {unattributed.map((row) => (
                <div key={row.activity_type_id}>
                  <p className="m-0 font-mono text-[10px] tracking-[1.4px] uppercase text-[var(--ink-200)]">
                    {row.label}
                  </p>
                  <p className="mt-1 mb-0 font-mono text-[20px] font-semibold text-[var(--ink-800)]">
                    {row.achieved.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="mt-8">
        <Card>
          <CardHeader title="Reports this period" hint={`${reports.length} filed`} />
          {reports.length === 0 ? (
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
                {reports.slice(0, 60).map((row) => (
                  <tr key={row.id}>
                    <Td className="whitespace-nowrap">{formatDay(row.reported_on)}</Td>
                    <Td className="font-semibold text-[var(--ink-800)]">
                      {row.full_name ?? row.email}
                    </Td>
                    <Td className="font-mono">{row.total_count.toLocaleString()}</Td>
                    <Td className="text-[13px] text-[var(--ink-400)]">{row.notes ?? ""}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}
