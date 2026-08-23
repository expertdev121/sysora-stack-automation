import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { ActivityProgress } from "@/components/admin/ActivityProgress";
import { EodForm, type RecentReports } from "@/components/admin/EodForm";
import { formatDay } from "@/components/admin/TargetProgress";
import { Card, CardHeader, EmptyState, PageHeading, Table, Td, Th } from "@/components/admin/ui";
import { canEditAnyEod, requireStaff } from "@/lib/admin/auth";
import type {
  ActivityByUserRow,
  ActivityProgressRow,
  ActivityType,
} from "@/lib/admin/types";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Today" };

/** The last fortnight is what the date picker can reach back through. */
const HISTORY_DAYS = 14;

export default async function TodayPage() {
  const session = await requireStaff();
  const db = salesDb();

  // What this person is responsible for. Everything on this page is
  // scoped to it: their form, their targets, their history.
  const { data: assigned } = await db
    .from("user_activities")
    .select("activity_type_id, activity_types(id, slug, label, question, sort_order, is_active)")
    .eq("user_id", session.userId);

  const activities = ((assigned ?? [])
    .map((row) => row.activity_types)
    .filter(Boolean) as unknown as ActivityType[])
    .filter((a) => a.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  const mineIds = new Set(activities.map((a) => a.id));

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - HISTORY_DAYS);
  const sinceISO = since.toISOString().slice(0, 10);

  const [{ data: recent }, { data: progress }, { data: byUser }] = await Promise.all([
    db
      .from("eod_reports")
      .select("id, reported_on, notes, eod_entries(activity_type_id, count)")
      .eq("user_id", session.userId)
      .gte("reported_on", sinceISO)
      .order("reported_on", { ascending: false }),
    db
      .from("activity_progress")
      .select("*")
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
    db.from("activity_progress_by_user").select("*").eq("user_id", session.userId),
  ]);

  const reports: RecentReports = {};
  for (const row of recent ?? []) {
    const entries = (row.eod_entries ?? []) as { activity_type_id: string; count: number }[];
    reports[row.reported_on as string] = {
      notes: (row.notes as string | null) ?? "",
      counts: Object.fromEntries(entries.map((e) => [e.activity_type_id, e.count])),
    };
  }

  // Only the lead measures this person actually works on.
  const mine = ((progress ?? []) as ActivityProgressRow[]).filter((row) =>
    mineIds.has(row.activity_type_id),
  );

  const myShare = Object.fromEntries(
    ((byUser ?? []) as ActivityByUserRow[]).map((row) => [row.activity_type_id, row.achieved]),
  );

  const serverToday = new Date().toISOString().slice(0, 10);

  return (
    <AdminShell session={session}>
      <PageHeading
        eyebrow="End of day"
        title={session.fullName ? `Hi ${session.fullName.split(" ")[0]}.` : "Your day"}
      />

      {mine.length > 0 && (
        <div className="mb-8">
          <p className="m-0 mb-3 font-mono text-[10px] tracking-[1.6px] uppercase text-[var(--ink-200)]">
            What we&apos;re chasing
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {mine.map((row) => (
              <ActivityProgress
                key={row.activity_target_id}
                row={row}
                mine={myShare[row.activity_type_id] ?? 0}
              />
            ))}
          </div>
          <p className="mt-3 mb-0 max-w-[70ch] text-[13px] leading-[1.65] text-[var(--ink-300)]">
            The target is the team&apos;s, not yours alone —{" "}
            {mine[0].contributors > 1
              ? `${mine[0].contributors} people are working the same number.`
              : "everyone assigned to it works the same number."}{" "}
            Your own contribution is on each card.
          </p>
        </div>
      )}

      <EodForm
        activities={activities}
        reports={reports}
        serverToday={serverToday}
        canBackdate={canEditAnyEod(session.role)}
      />

      <div className="mt-8">
        <Card>
          <CardHeader
            title="Your last two weeks"
            hint={`${(recent ?? []).length} of ${HISTORY_DAYS} days reported`}
          />
          {(recent ?? []).length === 0 ? (
            <EmptyState>Nothing filed yet. The first one takes a minute.</EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Day</Th>
                  {activities.map((a) => (
                    <Th key={a.id}>{a.label}</Th>
                  ))}
                  <Th>Note</Th>
                </tr>
              </thead>
              <tbody>
                {(recent ?? []).map((row) => {
                  const entries = (row.eod_entries ?? []) as {
                    activity_type_id: string;
                    count: number;
                  }[];
                  const byType = Object.fromEntries(
                    entries.map((e) => [e.activity_type_id, e.count]),
                  );

                  return (
                    <tr key={row.id as string}>
                      <Td className="whitespace-nowrap font-semibold text-[var(--ink-800)]">
                        {formatDay(row.reported_on as string)}
                      </Td>
                      {activities.map((a) => (
                        <Td key={a.id} className="font-mono">
                          {byType[a.id] ?? <span className="text-[var(--ink-100)]">—</span>}
                        </Td>
                      ))}
                      <Td className="text-[13px] text-[var(--ink-400)]">
                        {(row.notes as string | null) ?? ""}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}
