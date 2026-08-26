"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { formatDay } from "@/components/TargetProgress";
import {
  Button,
  Card,
  CardHeader,
  Table,
  Td,
  Th,
  inputClass,
  labelClass,
} from "@/components/ui";
import { settlePayment } from "@/lib/admin/revenue-actions";
import { formatMoney } from "@/lib/money";
import type { RevenueLedgerRow } from "@/lib/admin/types";

/**
 * Checkout payments still waiting on their rupee figure.
 *
 * Stripe charges the card today and settles to the bank days later at a
 * rate nobody knows at the moment of payment. Rather than estimate one,
 * those rows carry no rupee amount and sit out of every rupee total —
 * which is honest, but only useful if there is somewhere to put the
 * number once the payout lands. This is that place.
 *
 * Deliberately not bounded by the date filter above it: a payment from
 * six weeks ago still needs clearing, and hiding it behind a range
 * would make the gap look smaller than it is.
 */
export function PendingSettlements({ payments }: { payments: RevenueLedgerRow[] }) {
  if (payments.length === 0) return null;

  const owed = payments.reduce((sum, p) => sum + (p.amount_usd ?? 0), 0);

  return (
    <Card className="mb-8">
      <CardHeader
        title="Waiting on rupees"
        hint={`${payments.length} ${payments.length === 1 ? "payment" : "payments"} · ${formatMoney(owed, "USD")}`}
      />
      <div className="px-6 pt-5">
        <p className="m-0 mb-1 max-w-[74ch] text-[13.5px] leading-[1.7] text-[var(--ink-400)]">
          These were charged but haven&apos;t been given a rupee figure, so they count toward
          nothing. Put in what actually reached the bank and the date it did — that is the number a
          rupee target counts, and it is the only one that reconciles.
        </p>
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Charged</Th>
            <Th>Client</Th>
            <Th>What for</Th>
            <Th>Amount</Th>
            <Th>What landed</Th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <SettlementRow key={payment.id} payment={payment} />
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

function todayISO(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function SettlementRow({ payment }: { payment: RevenueLedgerRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [landedOn, setLandedOn] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);

  const implied =
    amount.trim() && payment.amount_usd
      ? (Number(amount) / (payment.amount_usd / 100)).toFixed(2)
      : null;

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await settlePayment(payment.id, Number(amount || 0), landedOn);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  return (
    <tr className="hover:bg-[var(--surface-1)] transition-colors duration-150">
      <Td className="whitespace-nowrap text-[13px] text-[var(--ink-500)]">
        {formatDay(payment.earned_on)}
      </Td>
      <Td className="font-semibold text-[var(--ink-800)]">{payment.client ?? "—"}</Td>
      <Td className="text-[13px] text-[var(--ink-500)]">{payment.source_label}</Td>
      <Td className="whitespace-nowrap font-semibold text-[var(--ink-800)] [font-variant-numeric:tabular-nums]">
        {formatMoney(payment.amount_usd ?? 0, "USD")}
      </Td>
      <Td>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-[4px]">
            <label className={labelClass}>Rupees</label>
            <input
              className={`${inputClass} w-[120px]`}
              inputMode="decimal"
              placeholder="4100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-[4px]">
            <label className={labelClass}>Landed</label>
            <input
              className={`${inputClass} w-[150px]`}
              type="date"
              value={landedOn}
              max={todayISO()}
              onChange={(e) => setLandedOn(e.target.value)}
            />
          </div>
          <Button size="sm" variant="ghost" disabled={pending || !amount.trim()} onClick={save}>
            {pending ? "Saving…" : "Record"}
          </Button>
        </div>

        {implied && (
          <p className="mt-1 mb-0 text-[12px] text-[var(--ink-300)]">
            ₹{implied} to the dollar — a fact about this payout, not a rate applied to anything
            else.
          </p>
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
