"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Card, CardHeader, Pill, Table, Td, Th, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { saveTarget } from "@/lib/admin/actions";
import type { TargetRow } from "@/lib/admin/types";
import { formatMoney } from "@/lib/money";

const monthName = (period: string) =>
  new Date(period + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });

export function TargetEditor({ months }: { months: TargetRow[] }) {
  return (
    <Card>
      <CardHeader title="By month" hint="Last 12 months" />
      <Table>
        <thead>
          <tr>
            <Th>Month</Th>
            <Th>Revenue target</Th>
            <Th>Requests target</Th>
            <Th>Actual</Th>
            <Th>Note</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <TargetRowEditor key={month.period_start} month={month} />
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

function TargetRowEditor({ month }: { month: TargetRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [revenue, setRevenue] = useState(
    month.revenue_target ? (month.revenue_target / 100).toString() : "",
  );
  const [requests, setRequests] = useState(month.requests_target?.toString() ?? "");
  const [notes, setNotes] = useState(month.notes ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    revenue !== (month.revenue_target ? (month.revenue_target / 100).toString() : "") ||
    requests !== (month.requests_target?.toString() ?? "") ||
    notes !== (month.notes ?? "");

  const hit = month.revenue_target > 0 && month.revenue_actual >= month.revenue_target;

  return (
    <tr>
      <Td className="font-semibold whitespace-nowrap text-[var(--ink-800)]">
        {monthName(month.period_start)}
      </Td>
      <Td>
        <input
          className={`${inputClass} w-[130px]`}
          inputMode="decimal"
          placeholder="0"
          value={revenue}
          onChange={(e) => {
            setRevenue(e.target.value);
            setSaved(false);
          }}
        />
      </Td>
      <Td>
        <input
          className={`${inputClass} w-[110px]`}
          inputMode="numeric"
          placeholder="—"
          value={requests}
          onChange={(e) => {
            setRequests(e.target.value);
            setSaved(false);
          }}
        />
      </Td>
      <Td className="whitespace-nowrap">
        <span className="font-mono text-[14px] text-[var(--ink-800)]">
          {formatMoney(month.revenue_actual)}
        </span>
        {hit && <Pill tone="mint">Hit</Pill>}
      </Td>
      <Td>
        <input
          className={inputClass}
          placeholder="Optional"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved(false);
          }}
        />
        {error && (
          <p role="alert" className="mt-1 mb-0 text-[12.5px] text-[var(--danger-600)]">
            {error}
          </p>
        )}
      </Td>
      <Td>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={pending || !dirty}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                const result = await saveTarget(
                  month.period_start,
                  Number(revenue || 0),
                  requests.trim() ? Number(requests) : null,
                  notes,
                );
                if (result.ok) {
                  setSaved(true);
                  router.refresh();
                } else {
                  setError(result.error);
                }
              })
            }
          >
            {pending ? "Saving…" : "Save"}
          </Button>
          {saved && <Pill tone="mint">Saved</Pill>}
        </div>
      </Td>
    </tr>
  );
}
