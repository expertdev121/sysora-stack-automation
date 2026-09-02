"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { formatDay } from "@/components/TargetProgress";
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
import {
  deleteRecurringCost,
  endRecurringCost,
  recordCostPayment,
  saveRecurringCost,
} from "@/lib/admin/cost-actions";
import { formatMoney } from "@/lib/money";
import {
  CADENCE_LABELS,
  type BillingCadence,
  type RecurringCharge,
  type RecurringCost,
  type SpendCategory,
} from "@/lib/admin/types";

function todayISO(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * What is due this month, and whether it has actually been charged yet.
 *
 * Two columns that look like they should agree and often don't: what you
 * committed to, and what left the account. A price rise, a proration, a failed
 * payment — each shows up as a gap here rather than as a total that is quietly
 * wrong.
 */
export function MonthDue({
  charges,
  paidIds,
}: {
  charges: RecurringCharge[];
  /** Commitments with a recorded payment in this month. */
  paidIds: Set<string>;
}) {
  if (charges.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader title="Due this month" />
        <EmptyState>Nothing recurring is due in this month.</EmptyState>
      </Card>
    );
  }

  const unpaid = charges.filter((c) => !paidIds.has(c.recurring_cost_id));

  return (
    <Card className="mb-8">
      <CardHeader
        title="Due this month"
        hint={
          unpaid.length === 0
            ? "All recorded"
            : `${unpaid.length} of ${charges.length} not recorded yet`
        }
      />
      <Table>
        <thead>
          <tr>
            <Th>Bills on</Th>
            <Th>What</Th>
            <Th>Amount</Th>
            <Th>Every</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {charges.map((charge) => (
            <DueRow
              key={`${charge.recurring_cost_id}-${charge.month}`}
              charge={charge}
              paid={paidIds.has(charge.recurring_cost_id)}
            />
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

function DueRow({ charge, paid }: { charge: RecurringCharge; paid: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [recording, setRecording] = useState(false);
  const [amount, setAmount] = useState(
    charge.amount_inr === null ? "" : String(charge.amount_inr / 100),
  );
  const [spentOn, setSpentOn] = useState(charge.due_on);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <tr className="hover:bg-[var(--surface-1)] transition-colors duration-150">
        <Td className="whitespace-nowrap text-[13px] text-[var(--ink-500)]">
          {formatDay(charge.due_on)}
        </Td>
        <Td>
          <span className="block font-semibold text-[var(--ink-800)]">{charge.name}</span>
          {charge.vendor && (
            <span className="block text-[12px] text-[var(--ink-300)]">{charge.vendor}</span>
          )}
        </Td>
        <Td className="whitespace-nowrap [font-variant-numeric:tabular-nums]">
          {charge.amount_inr === null ? (
            <span className="text-[13px] font-semibold text-[var(--warning)]">₹ not set</span>
          ) : (
            <span className="font-semibold text-[var(--ink-800)]">
              {formatMoney(charge.amount_inr)}
            </span>
          )}
          {charge.amount_usd !== null && (
            <span className="block text-[12px] text-[var(--ink-300)]">
              {formatMoney(charge.amount_usd, "USD")}
            </span>
          )}
        </Td>
        <Td className="text-[13px] text-[var(--ink-500)]">{CADENCE_LABELS[charge.cadence]}</Td>
        <Td>
          <div className="flex items-center justify-end gap-2">
            {paid ? (
              <Pill tone="mint">Recorded</Pill>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setRecording((v) => !v)}>
                {recording ? "Cancel" : "Record payment"}
              </Button>
            )}
          </div>
        </Td>
      </tr>

      {recording && !paid && (
        <tr className="bg-[var(--surface-1)]">
          <td colSpan={5} className="px-6 pt-0 pb-4">
            <div className="flex flex-wrap items-end gap-3 rounded-[10px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] p-3">
              <div className="flex flex-col gap-[4px]">
                <label className={labelClass}>Charged (₹)</label>
                <input
                  className={`${inputClass} w-[140px]`}
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <label className={labelClass}>On</label>
                <input
                  className={`${inputClass} w-[150px]`}
                  type="date"
                  value={spentOn}
                  max={todayISO()}
                  onChange={(e) => setSpentOn(e.target.value)}
                />
              </div>
              <Button
                size="sm"
                disabled={pending || !amount.trim()}
                onClick={() =>
                  startTransition(async () => {
                    setError(null);
                    const result = await recordCostPayment({
                      recurringCostId: charge.recurring_cost_id,
                      spentOn,
                      amountInr: Number(amount),
                      amountUsd: null,
                      categoryId: charge.category_id,
                      description: charge.name,
                    });
                    if (result.ok) {
                      setRecording(false);
                      router.refresh();
                    } else setError(result.error);
                  })
                }
              >
                {pending ? "Saving…" : "Record it"}
              </Button>
              <p className="m-0 max-w-[42ch] text-[12px] leading-[1.6] text-[var(--ink-300)]">
                Prefilled with what you committed to. Change it if the charge differed — that
                difference is the point of recording it separately.
              </p>
              {error && (
                <p role="alert" className="m-0 text-[12.5px] text-[var(--danger-600)]">
                  {error}
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/** Everything that repeats, running or stopped. */
export function CostList({
  costs,
  categories,
}: {
  costs: RecurringCost[];
  categories: SpendCategory[];
}) {
  const [adding, setAdding] = useState(costs.length === 0);

  const running = costs.filter((c) => !c.ended_on);
  const stopped = costs.filter((c) => c.ended_on);

  return (
    <Card>
      <CardHeader
        title="Everything that repeats"
        action={
          <span className="flex flex-wrap items-center gap-3">
            <span className="text-[12.5px] text-[var(--ink-300)]">
              {running.length} running{stopped.length > 0 ? ` · ${stopped.length} stopped` : ""}
            </span>
            <Button size="sm" onClick={() => setAdding((v) => !v)}>
              {adding ? "Cancel" : "Add a subscription"}
            </Button>
          </span>
        }
      />

      {adding && (
        <CostForm categories={categories} onDone={() => setAdding(false)} />
      )}

      {costs.length === 0 ? (
        <div className="px-6 pb-6">
          <p className="m-0 max-w-[64ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
            Nothing added yet. Add each subscription once — Zapier, ClickUp, a retainer, anything
            that bills again — and every month totals itself from then on.
          </p>
          {!adding && (
            <Button className="mt-4" onClick={() => setAdding(true)}>
              Add your first subscription
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>What</Th>
              <Th>Amount</Th>
              <Th>Every</Th>
              <Th>Bills on</Th>
              <Th>Since</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {[...running, ...stopped].map((cost) => (
              <CostRow key={cost.id} cost={cost} />
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}

function CostRow({ cost }: { cost: RecurringCost }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const stopped = Boolean(cost.ended_on);

  function run(fn: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    startTransition(async () => {
      setError(null);
      const result = await fn();
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  return (
    <tr
      className={`hover:bg-[var(--surface-1)] transition-colors duration-150 ${stopped ? "opacity-60" : ""}`}
    >
      <Td>
        <span className="block font-semibold text-[var(--ink-800)]">{cost.name}</span>
        {cost.vendor && (
          <span className="block text-[12px] text-[var(--ink-300)]">{cost.vendor}</span>
        )}
        {error && (
          <span role="alert" className="block text-[12px] text-[var(--danger-600)]">
            {error}
          </span>
        )}
      </Td>
      <Td className="whitespace-nowrap [font-variant-numeric:tabular-nums]">
        {cost.amount_inr === null ? (
          <span className="text-[13px] text-[var(--warning)]">₹ not set</span>
        ) : (
          <span className="font-semibold text-[var(--ink-800)]">
            {formatMoney(cost.amount_inr)}
          </span>
        )}
        {cost.amount_usd !== null && (
          <span className="block text-[12px] text-[var(--ink-300)]">
            {formatMoney(cost.amount_usd, "USD")}
          </span>
        )}
      </Td>
      <Td className="text-[13px] text-[var(--ink-500)]">{CADENCE_LABELS[cost.cadence]}</Td>
      <Td className="text-[13px] text-[var(--ink-500)]">day {cost.billing_day}</Td>
      <Td className="whitespace-nowrap text-[13px] text-[var(--ink-500)]">
        {formatDay(cost.started_on)}
        {cost.ended_on && (
          <span className="block text-[12px] text-[var(--ink-300)]">
            stopped {formatDay(cost.ended_on)}
          </span>
        )}
      </Td>
      <Td>
        <div className="flex items-center justify-end gap-2">
          {stopped ? (
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => run(() => endRecurringCost(cost.id, null))}
            >
              Restart
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => run(() => endRecurringCost(cost.id, todayISO()))}
            >
              Stop
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => run(() => deleteRecurringCost(cost.id))}
          >
            Delete
          </Button>
        </div>
      </Td>
    </tr>
  );
}

function CostForm({
  categories,
  onDone,
}: {
  categories: SpendCategory[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [vendor, setVendor] = useState("");
  const [cadence, setCadence] = useState<BillingCadence>("monthly");
  const [amountInr, setAmountInr] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [billingDay, setBillingDay] = useState("1");
  const [startedOn, setStartedOn] = useState(todayISO());
  const [categoryId, setCategoryId] = useState(
    categories.find((c) => c.slug === "software")?.id ?? categories[0]?.id ?? "",
  );

  return (
    <div className="mx-6 mt-5 rounded-[10px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-1)] p-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="What">
          <input
            className={`${inputClass} w-[200px]`}
            autoFocus
            placeholder="Zapier"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Vendor">
          <input
            className={`${inputClass} w-[150px]`}
            placeholder="optional"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
          />
        </Field>
        <Field label="Rupees">
          <input
            className={`${inputClass} w-[120px]`}
            inputMode="decimal"
            placeholder="2000"
            value={amountInr}
            onChange={(e) => setAmountInr(e.target.value)}
          />
        </Field>
        <Field label="Dollars">
          <input
            className={`${inputClass} w-[110px]`}
            inputMode="decimal"
            placeholder="optional"
            value={amountUsd}
            onChange={(e) => setAmountUsd(e.target.value)}
          />
        </Field>
        <Field label="Every">
          <select
            className={`${inputClass} w-[130px]`}
            value={cadence}
            onChange={(e) => setCadence(e.target.value as BillingCadence)}
          >
            {(Object.keys(CADENCE_LABELS) as BillingCadence[]).map((c) => (
              <option key={c} value={c}>
                {CADENCE_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Bills on day">
          <input
            className={`${inputClass} w-[90px]`}
            inputMode="numeric"
            value={billingDay}
            onChange={(e) => setBillingDay(e.target.value)}
          />
        </Field>
        <Field label="Since">
          <input
            className={`${inputClass} w-[150px]`}
            type="date"
            value={startedOn}
            onChange={(e) => setStartedOn(e.target.value)}
          />
        </Field>
        <Field label="Category">
          <select
            className={`${inputClass} w-[160px]`}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Button
          size="sm"
          disabled={pending || !name.trim()}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await saveRecurringCost({
                name,
                vendor,
                categoryId: categoryId || null,
                cadence,
                amountInr: amountInr.trim() === "" ? null : Number(amountInr),
                amountUsd: amountUsd.trim() === "" ? null : Number(amountUsd),
                billingDay: Number(billingDay || 1),
                startedOn,
                notes: "",
              });
              if (result.ok) {
                onDone();
                router.refresh();
              } else setError(result.error);
            })
          }
        >
          {pending ? "Adding…" : "Add"}
        </Button>
      </div>

      <p className="mt-3 mb-0 max-w-[80ch] text-[12px] leading-[1.6] text-[var(--ink-300)]">
        Billing day is capped at 28 so the charge exists in February too. A yearly plan lands in
        its billing month rather than being spread across twelve — that is what actually leaves
        the account, and the smoothed figure is shown separately above.
      </p>

      {error && (
        <p role="alert" className="mt-2 mb-0 text-[12.5px] text-[var(--danger-600)]">
          {error}
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[4px]">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}
