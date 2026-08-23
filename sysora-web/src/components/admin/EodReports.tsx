"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { EodForm, type RecentReports } from "@/components/admin/EodForm";
import { formatDay } from "@/components/admin/TargetProgress";
import {
  Card,
  CardHeader,
  EmptyState,
  Pill,
  Table,
  Td,
  Th,
  inputClass,
  labelClass,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { deleteEod } from "@/lib/admin/eod-actions";
import { ROLE_LABELS, type ActivityType, type EodReportRow } from "@/lib/admin/types";

/**
 * Everybody's daily reports, for the people who can fix them.
 *
 * A BDE can correct today and yesterday. Anything older is here,
 * because a number that quietly changed a week after the fact should
 * have somebody's name against it — and every edit through this screen
 * writes an audit row that has one.
 */
export function EodReports({
  reports,
  people,
  activitiesByUser,
  reportsByUser,
  serverToday,
}: {
  reports: EodReportRow[];
  people: { id: string; name: string; role: keyof typeof ROLE_LABELS }[];
  /** User id → the activities they're assigned. */
  activitiesByUser: Record<string, ActivityType[]>;
  /** User id → their recent reports, so the form can load a day. */
  reportsByUser: Record<string, RecentReports>;
  serverToday: string;
}) {
  const [filingFor, setFilingFor] = useState<string | null>(null);

  const target = people.find((p) => p.id === filingFor) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title="File or fix a day" />
        <div className="flex flex-wrap items-end gap-3 px-6 py-5">
          <div className="flex flex-col gap-[6px] min-w-[220px]">
            <label htmlFor="eod-person" className={labelClass}>
              Whose day
            </label>
            <select
              id="eod-person"
              className={inputClass}
              value={filingFor ?? ""}
              onChange={(e) => setFilingFor(e.target.value || null)}
            >
              <option value="">Pick someone…</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} · {ROLE_LABELS[person.role]}
                </option>
              ))}
            </select>
          </div>
          <p className="m-0 flex-1 min-w-[240px] text-[12.5px] leading-[1.6] text-[var(--ink-300)]">
            Filing for someone else is recorded against your name, not theirs.
          </p>
        </div>
      </Card>

      {target && (
        <EodForm
          activities={activitiesByUser[target.id] ?? []}
          reports={reportsByUser[target.id] ?? {}}
          serverToday={serverToday}
          canBackdate
          forUserId={target.id}
          forUserName={target.name}
        />
      )}

      <Card>
        <CardHeader title="Everything filed" hint={`${reports.length} reports`} />
        {reports.length === 0 ? (
          <EmptyState>No daily reports yet.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Day</Th>
                <Th>Person</Th>
                <Th>Total</Th>
                <Th>Note</Th>
                <Th>Filed</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <ReportRow key={report.id} report={report} />
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function ReportRow({ report }: { report: EodReportRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const edited = report.updated_at !== report.submitted_at;

  return (
    <tr className="hover:bg-[var(--surface-1)] transition-colors duration-150">
      <Td className="whitespace-nowrap font-semibold text-[var(--ink-800)]">
        {formatDay(report.reported_on)}
      </Td>
      <Td>
        <span className="block font-semibold text-[var(--ink-800)]">
          {report.full_name ?? report.email}
        </span>
        <span className="block text-[12.5px] text-[var(--ink-300)]">
          {ROLE_LABELS[report.role]}
        </span>
      </Td>
      <Td className="font-mono">{report.total_count.toLocaleString()}</Td>
      <Td className="text-[13px] text-[var(--ink-400)]">{report.notes ?? ""}</Td>
      <Td className="whitespace-nowrap text-[12.5px] text-[var(--ink-300)]">
        {new Date(report.submitted_at).toLocaleDateString()}
        {edited && (
          <Pill tone="slate">
            <span className="text-[10.5px]">edited</span>
          </Pill>
        )}
      </Td>
      <Td>
        {confirming ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteEod(report.id);
                  if (result.ok) router.refresh();
                  else setError(result.error);
                  setConfirming(false);
                })
              }
            >
              {pending ? "Removing…" : "Confirm"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              Keep
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
            Remove
          </Button>
        )}
        {error && (
          <p role="alert" className="mt-1 mb-0 text-[12.5px] text-[var(--danger-600)]">
            {error}
          </p>
        )}
      </Td>
    </tr>
  );
}
