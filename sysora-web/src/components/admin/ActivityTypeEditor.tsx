"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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
import { saveActivityType, setActivityTypeActive } from "@/lib/admin/activity-actions";
import type { ActivityType } from "@/lib/admin/types";

/**
 * The list of things worth counting.
 *
 * Adding the fourth kind of outreach has to be a form submission, not a
 * migration — that was the point of making these rows. There is no
 * delete: reports and targets refer to them, so a retired activity stops
 * appearing on new forms and keeps every number it ever earned.
 */
export function ActivityTypeEditor({ types }: { types: ActivityType[] }) {
  const [creating, setCreating] = useState(false);

  const live = types.filter((t) => t.is_active);
  const retired = types.filter((t) => !t.is_active);

  return (
    <div className="flex flex-col gap-6">
      {creating ? (
        <TypeForm onDone={() => setCreating(false)} />
      ) : (
        <div>
          <Button size="sm" variant="ghost" onClick={() => setCreating(true)}>
            New activity
          </Button>
        </div>
      )}

      <Card>
        <CardHeader title="In use" hint={`${live.length} active`} />
        {live.length === 0 ? (
          <EmptyState>
            Nothing to measure yet. An activity is anything a person can count at the end of a day.
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Activity</Th>
                <Th>The daily question</Th>
                <Th>Key</Th>
                <Th>Order</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {live.map((type) => (
                <TypeRow key={type.id} type={type} />
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {retired.length > 0 && (
        <Card>
          <CardHeader title="Retired" hint={`${retired.length}`} />
          <Table>
            <thead>
              <tr>
                <Th>Activity</Th>
                <Th>Key</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {retired.map((type) => (
                <TypeRow key={type.id} type={type} compact />
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function TypeRow({ type, compact }: { type: ActivityType; compact?: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <tr>
        <td colSpan={compact ? 3 : 5} className="p-0">
          <div className="px-6 py-4">
            <TypeForm type={type} onDone={() => setEditing(false)} inline />
          </div>
        </td>
      </tr>
    );
  }

  const toggle = () =>
    startTransition(async () => {
      const result = await setActivityTypeActive(type.id, !type.is_active);
      if (result.ok) router.refresh();
      else setError(result.error);
    });

  return (
    <tr className="hover:bg-[var(--surface-1)] transition-colors duration-150">
      <Td>
        <span className="block font-semibold text-[var(--ink-800)]">{type.label}</span>
        {error && (
          <span role="alert" className="block text-[12.5px] text-[var(--danger-600)]">
            {error}
          </span>
        )}
      </Td>
      {!compact && <Td className="text-[13.5px] text-[var(--ink-500)]">{type.question}</Td>}
      <Td>
        <Pill tone="slate">{type.slug}</Pill>
      </Td>
      {!compact && <Td className="font-mono text-[13px]">{type.sort_order}</Td>}
      <Td>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={toggle}>
            {pending ? "…" : type.is_active ? "Retire" : "Bring back"}
          </Button>
        </div>
      </Td>
    </tr>
  );
}

function TypeForm({
  type,
  onDone,
  inline,
}: {
  type?: ActivityType;
  onDone: () => void;
  inline?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState(type?.label ?? "");
  const [slug, setSlug] = useState(type?.slug ?? "");
  const [question, setQuestion] = useState(type?.question ?? "");
  const [sortOrder, setSortOrder] = useState(String(type?.sort_order ?? 40));
  const [error, setError] = useState<string | null>(null);

  /** Only for new rows: the key is an identifier and shouldn't drift. */
  function suggestSlug(next: string) {
    setLabel(next);
    if (type) return;
    setSlug(
      next
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, ""),
    );
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveActivityType({
        id: type?.id,
        slug,
        label,
        question,
        sortOrder: Number(sortOrder || 0),
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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
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
        <label className={labelClass}>What the daily form asks</label>
        <input
          className={inputClass}
          placeholder="How many calls did you make?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

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
          {pending ? "Saving…" : type ? "Save changes" : "Add activity"}
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
      <CardHeader title="New activity" />
      <div className="px-6 py-5">{body}</div>
    </Card>
  );
}
