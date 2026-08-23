import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { EodReports } from "@/components/admin/EodReports";
import type { RecentReports } from "@/components/admin/EodForm";
import { PageHeading } from "@/components/admin/ui";
import { requireActivityView } from "@/lib/admin/auth";
import type { ActivityType, EodReportRow, StaffRole } from "@/lib/admin/types";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Daily reports" };

/** How far back the correction form can reach for existing numbers. */
const HISTORY_DAYS = 60;

export default async function ReportsPage() {
  const session = await requireActivityView();
  const db = salesDb();

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - HISTORY_DAYS);
  const sinceISO = since.toISOString().slice(0, 10);

  const [{ data: reports }, { data: staff }, { data: assigned }, { data: raw }] = await Promise.all([
    db
      .from("eod_report_overview")
      .select("*")
      .order("reported_on", { ascending: false })
      .limit(400),
    db.from("users").select("id, full_name, email, role, is_active").eq("is_active", true),
    db
      .from("user_activities")
      .select("user_id, activity_types(id, slug, label, question, sort_order, is_active)"),
    db
      .from("eod_reports")
      .select("user_id, reported_on, notes, eod_entries(activity_type_id, count)")
      .gte("reported_on", sinceISO),
  ]);

  // Only people who actually have something to report belong in the picker.
  const activitiesByUser: Record<string, ActivityType[]> = {};
  for (const row of (assigned ?? []) as unknown as {
    user_id: string;
    activity_types: ActivityType | null;
  }[]) {
    if (!row.activity_types?.is_active) continue;
    (activitiesByUser[row.user_id] ??= []).push(row.activity_types);
  }
  for (const list of Object.values(activitiesByUser)) {
    list.sort((a, b) => a.sort_order - b.sort_order);
  }

  const reportsByUser: Record<string, RecentReports> = {};
  for (const row of (raw ?? []) as unknown as {
    user_id: string;
    reported_on: string;
    notes: string | null;
    eod_entries: { activity_type_id: string; count: number }[];
  }[]) {
    const forUser = (reportsByUser[row.user_id] ??= {});
    forUser[row.reported_on] = {
      notes: row.notes ?? "",
      counts: Object.fromEntries((row.eod_entries ?? []).map((e) => [e.activity_type_id, e.count])),
    };
  }

  const people = ((staff ?? []) as {
    id: string;
    full_name: string | null;
    email: string;
    role: StaffRole;
  }[])
    .filter((person) => (activitiesByUser[person.id] ?? []).length > 0)
    .map((person) => ({
      id: person.id,
      name: person.full_name ?? person.email,
      role: person.role,
    }));

  return (
    <AdminShell session={session}>
      <PageHeading eyebrow="Cadence" title="Daily reports" />
      <p className="mt-[-16px] mb-8 max-w-[72ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
        Everyone can fix their own today and yesterday. Older days come here, so a number that
        changes a week later has somebody&apos;s name against it. Every edit is written to the audit
        log either way.
      </p>

      <EodReports
        reports={(reports ?? []) as EodReportRow[]}
        people={people}
        activitiesByUser={activitiesByUser}
        reportsByUser={reportsByUser}
        serverToday={new Date().toISOString().slice(0, 10)}
      />
    </AdminShell>
  );
}
