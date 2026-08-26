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
import { deleteExpense, saveExpense } from "@/lib/admin/expense-actions";
import { formatMoney, impliedRate } from "@/lib/money";
import type { ActivityType, SpendCategory, ExpenseRow } from "@/lib/admin/types";

/**
 * Every cost: the Connects that win work and the salaries that run it.
 *
 * Rupees lead, because that is what leaves the account. A dollar
 * figure sits underneath where the cost was billed in dollars — never
 * converted, just recorded.
 *
 * Tagging an entry to a lead measure is optional but it is where the
 * useful number comes from: spend tagged to bidding, divided by bids
 * submitted, is a cost per bid — the figure that says whether to buy
 * more Connects or write better proposals.
 */

function formatDay(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ExpenseTable({
  entries,
  categories,
  activities,
}: {
  entries: ExpenseRow[];
  categories: SpendCategory[];
  activities: ActivityType[];
}) {
  const [adding, setAdding] = useState(false);
  const total = entries.reduce((sum, entry) => sum + (entry.amount_inr ?? 0), 0);
  const awaiting = entries.filter((entry) => entry.amount_inr === null).length;

  return (
    <div className="flex flex-col gap-4">
      {adding ? (
        <ExpenseForm
          categories={categories}
          activities={activities}
          onDone={() => setAdding(false)}
        />
      ) : (
        <div>
          <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>
            Record spend
          </Button>
        </div>
      )}

      <Card>
        <CardHeader
          title="Every entry"
          hint={
            entries.length
              ? `${entries.length} ${entries.length === 1 ? "entry" : "entries"} · ${formatMoney(total)}${awaiting ? ` · ${awaiting} awaiting rupees` : ""}`
              : "None yet"
          }
        />
        {entries.length === 0 ? (
          <EmptyState>
            Connects, ads, salaries, rent — every rupee that leaves goes here.
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>What</Th>
                <Th>Category</Th>
                <Th>Who</Th>
                <Th>Bought</Th>
                <Th>Spent</Th>
                <Th>Amount</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <ExpenseRowLine
                  key={entry.id}
                  entry={entry}
                  categories={categories}
                  activities={activities}
                />
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function ExpenseRowLine({
  entry,
  categories,
  activities,
}: {
  entry: ExpenseRow;
  categories: SpendCategory[];
  activities: ActivityType[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <tr>
        <td colSpan={7} className="p-0">
          <div className="px-6 py-4">
            <ExpenseForm
              entry={entry}
              categories={categories}
              activities={activities}
              onDone={() => setEditing(false)}
              inline
            />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-[var(--surface-1)] transition-colors duration-150">
      <Td>
        <span className="block font-semibold text-[var(--ink-800)]">
          {entry.description ?? entry.category_label}
        </span>
        {!entry.is_acquisition && (
          <span className="block text-[12px] text-[var(--ink-300)]">
            Not counted in cost per client
          </span>
        )}
      </Td>
      <Td>
        <Pill tone="slate">{entry.category_label}</Pill>
      </Td>
      <Td className="whitespace-nowrap text-[13px] text-[var(--ink-600)]">
        {entry.paid_to ?? <span className="text-[var(--ink-100)]">—</span>}
      </Td>
      <Td className="whitespace-nowrap">
        {entry.activity_label ? (
          <Pill tone="mint">{entry.activity_label}</Pill>
        ) : (
          <span className="text-[13px] text-[var(--ink-100)]">—</span>
        )}
      </Td>
      <Td className="whitespace-nowrap text-[13px] text-[var(--ink-500)]">
        {formatDay(entry.spent_on)}
      </Td>
      <Td className="whitespace-nowrap">
        {entry.amount_inr === null ? (
          <span className="text-[13px] font-semibold text-[var(--warning)]">₹ pending</span>
        ) : (
          <span className="font-semibold text-[var(--ink-800)] [font-variant-numeric:tabular-nums]">
            {formatMoney(entry.amount_inr, "INR")}
          </span>
        )}
        {entry.amount_usd !== null && (
          <span className="block text-[12px] text-[var(--ink-300)] [font-variant-numeric:tabular-nums]">
            {formatMoney(entry.amount_usd, "USD")}
            {entry.amount_inr !== null && (
              <> · ₹{impliedRate(entry.amount_usd, entry.amount_inr)}/$</>
            )}
          </span>
        )}
      </Td>
      <Td>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Edit
          </Button>
          {confirming ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await deleteExpense(entry.id);
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
            </>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
              Remove
            </Button>
          )}
        </div>
        {error && (
          <p role="alert" className="mt-1 mb-0 text-[12.5px] text-[var(--danger-600)]">
            {error}
          </p>
        )}
      </Td>
    </tr>
  );
}

function todayISO(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function ExpenseForm({
  entry,
  categories,
  activities,
  onDone,
  inline,
}: {
  entry?: ExpenseRow;
  categories: SpendCategory[];
  activities: ActivityType[];
  onDone: () => void;
  inline?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const byKey = categories.find((c) => c.slug === entry?.category_key);
  const [categoryId, setCategoryId] = useState(byKey?.id ?? categories[0]?.id ?? "");
  const [description, setDescription] = useState(entry?.description ?? "");
  const [amountUsd, setAmountUsd] = useState(
    entry?.amount_usd != null ? (entry.amount_usd / 100).toString() : "",
  );
  const [amountInr, setAmountInr] = useState(
    entry?.amount_inr != null ? (entry.amount_inr / 100).toString() : "",
  );
  const [paidTo, setPaidTo] = useState(entry?.paid_to ?? "");
  const [spentOn, setSpentOn] = useState(entry?.spent_on ?? todayISO());
  const [activityTypeId, setActivityTypeId] = useState(entry?.activity_type_id ?? "");
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveExpense({
        id: entry?.id,
        categoryId,
        description,
        paidTo,
        amountUsd: amountUsd.trim() ? Number(amountUsd) : null,
        amountInr: amountInr.trim() ? Number(amountInr) : null,
        spentOn,
        activityTypeId: activityTypeId || null,
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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Category</label>
          <select
            className={inputClass}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Rupees paid</label>
          <input
            className={inputClass}
            inputMode="decimal"
            placeholder="3400"
            value={amountInr}
            onChange={(e) => setAmountInr(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Dollars billed (optional)</label>
          <input
            className={inputClass}
            inputMode="decimal"
            placeholder="40"
            value={amountUsd}
            onChange={(e) => setAmountUsd(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Spent on</label>
          <input
            className={inputClass}
            type="date"
            value={spentOn}
            onChange={(e) => setSpentOn(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-[6px]">
          <label className={labelClass}>Bought what? (optional)</label>
          <select
            className={inputClass}
            value={activityTypeId}
            onChange={(e) => setActivityTypeId(e.target.value)}
          >
            <option value="">Not tied to an activity</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-[6px]">
        <label className={labelClass}>Who was paid? (salaries)</label>
        <input
          className={inputClass}
          placeholder="Leave blank unless this is somebody's pay"
          value={paidTo}
          onChange={(e) => setPaidTo(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-[6px]">
        <label className={labelClass}>Description</label>
        <input
          className={inputClass}
          placeholder="80 Connects for the September push"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <p className="m-0 text-[12.5px] leading-[1.6] text-[var(--ink-300)]">
        Tag it to an activity and this becomes a cost per unit — spend on bidding divided by
        bids submitted.
      </p>

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
          {pending ? "Saving…" : entry ? "Save changes" : "Record it"}
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
      <CardHeader title="Record spend" />
      <div className="px-6 py-5">{body}</div>
    </Card>
  );
}
