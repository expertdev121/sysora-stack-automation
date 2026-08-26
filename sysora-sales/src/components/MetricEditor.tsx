"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Pill,
  Table,
  Td,
  Th,
  inputClass,
  labelClass,
} from "@/components/ui";
import { saveWorkMetric, setWorkMetricActive } from "@/lib/admin/activity-actions";
import type { WorkMetric } from "@/lib/admin/types";

/**
 * The list of things worth counting at the end of a day.
 *
 * Rows, not an enum — adding the next kind of outreach is a form
 * submission, never a migration. There is no delete: end-of-day reports
 * and sales targets point at these, so a retired metric stops appearing
 * on new forms and keeps every number it ever earned.
 */
export function MetricEditor({ metrics }: { metrics: WorkMetric[] }) {
  const [creating, setCreating] = useState(false);

  const live = metrics.filter((m) => m.is_active);
  const retired = metrics.filter((m) => !m.is_active);

  return (
    <div className="flex flex-col gap-6">
      {creating ? (
        <MetricForm onDone={() => setCreating(false)} />
      ) : (
        <div>
          <Button size="sm" variant="ghost" onClick={() => setCreating(true)}>
            New metric
          </Button>
        </div>
      )}

      <Card>
        <CardHeader title="In use" hint={`${live.length} active`} />
        {live.length === 0 ? (
          <EmptyState>
            Nothing to measure yet. A metric is anything a person can count at the end of a day.
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Metric</Th>
                <Th>The daily question</Th>
                <Th>Unit</Th>
                <Th>Sales</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {live.map((metric) => (
                <MetricRow key={metric.id} metric={metric} />
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {retired.length > 0 && (
        <Card>
          <CardHeader title="Retired" hint={String(retired.length)} />
          <Table>
            <thead>
              <tr>
                <Th>Metric</Th>
                <Th>Key</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {retired.map((metric) => (
                <MetricRow key={metric.id} metric={metric} compact />
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function MetricRow({ metric, compact }: { metric: WorkMetric; compact?: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <tr>
        <td colSpan={compact ? 3 : 5} className="p-0">
          <div className="px-6 py-4">
            <MetricForm metric={metric} onDone={() => setEditing(false)} inline />
          </div>
        </td>
      </tr>
    );
  }

  const toggle = () =>
    startTransition(async () => {
      const result = await setWorkMetricActive(metric.id, !metric.is_active);
      if (result.ok) router.refresh();
      else setError(result.error);
    });

  return (
    <tr className="hover:bg-[var(--surface-1)] transition-colors duration-150">
      <Td>
        <span className="block font-semibold text-[var(--ink-800)]">{metric.label}</span>
        {compact && <Pill tone="slate">{metric.slug}</Pill>}
        {error && (
          <span role="alert" className="block text-[12.5px] text-[var(--danger-600)]">
            {error}
          </span>
        )}
      </Td>
      {!compact && <Td className="text-[13.5px] text-[var(--ink-500)]">{metric.question}</Td>}
      {!compact && (
        <Td>
          <Pill tone="slate">{metric.unit}</Pill>
        </Td>
      )}
      {!compact && (
        <Td>
          {metric.feeds_sales ? (
            <Pill tone="mint">Counts</Pill>
          ) : (
            <span className="text-[13px] text-[var(--ink-200)]">Tracked only</span>
          )}
        </Td>
      )}
      {compact && (
        <Td>
          <Pill tone="slate">{metric.slug}</Pill>
        </Td>
      )}
      <Td>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={toggle}>
            {pending ? "…" : metric.is_active ? "Retire" : "Bring back"}
          </Button>
        </div>
      </Td>
    </tr>
  );
}

function MetricForm({
  metric,
  onDone,
  inline,
}: {
  metric?: WorkMetric;
  onDone: () => void;
  inline?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState(metric?.label ?? "");
  const [slug, setSlug] = useState(metric?.slug ?? "");
  const [question, setQuestion] = useState(metric?.question ?? "");
  const [unit, setUnit] = useState(metric?.unit ?? "count");
  const [sortOrder, setSortOrder] = useState(String(metric?.sort_order ?? 40));
  const [feedsSales, setFeedsSales] = useState(metric?.feeds_sales ?? true);
  const [error, setError] = useState<string | null>(null);

  /** Only for new rows: the key is an identifier and shouldn't drift. */
  function suggestSlug(next: string) {
    setLabel(next);
    if (metric) return;
    setSlug(next.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveWorkMetric({
        id: metric?.id,
        slug,
        label,
        question,
        unit,
        sortOrder: Number(sortOrder || 0),
        feedsSales,
      });
      if (result.ok) {
        router.refresh();
        onDone();
      } else {
        setError(result.error);
      }
    });
  }

  const body = (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Name</label>
          <input
            className={inputClass}
            placeholder="Cold calls"
            value={label}
            onChange={(e) => suggestSlug(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Key</label>
          <input
            className={inputClass}
            placeholder="cold_calls"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Measured in</label>
          <input
            className={inputClass}
            placeholder="count"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Order</label>
          <input
            className={inputClass}
            inputMode="numeric"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value.replace(/[^0-9]/g, ""))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[6px]">
        <label className={labelClass}>What the daily report asks</label>
        <input
          className={inputClass}
          placeholder="How many calls did you make?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      <label className="flex items-start gap-3 text-[13px] leading-[1.6] text-[var(--ink-500)]">
        <input
          type="checkbox"
          className="mt-[3px] accent-[var(--accent)]"
          checked={feedsSales}
          onChange={(e) => setFeedsSales(e.target.checked)}
        />
        <span>
          <span className="font-semibold text-[var(--ink-700)]">Counts toward sales targets.</span>{" "}
          Leave off for something worth tracking but not selling.
        </span>
      </label>

      {error && (
        <p
          role="alert"
          className="m-0 px-4 py-3 rounded-[10px] bg-[var(--danger-bg)] border-[1.5px] border-[var(--danger-border)] text-[13.5px] text-[var(--danger-600)]"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button size="sm" disabled={pending} onClick={save}>
          {pending ? "Saving…" : metric ? "Save changes" : "Add metric"}
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );

  if (inline) return body;

  return (
    <Card>
      <CardHeader title="New metric" />
      <div className="px-6 py-5">{body}</div>
    </Card>
  );
}
