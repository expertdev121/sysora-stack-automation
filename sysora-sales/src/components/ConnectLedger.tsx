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
  deleteConnectPurchase,
  saveConnectPurchase,
} from "@/lib/admin/acquisition-actions";
import { formatMoney } from "@/lib/money";
import type { ConnectPosition, ConnectPurchase } from "@/lib/admin/types";

/** Upwork's list price. A starting point for the form, never a stored value. */
const DEFAULT_USD_PER_CONNECT = 0.15;

/**
 * What connects cost and how many are left.
 *
 * The rate is computed here only for display — it lives in
 * sales.connect_position, derived from what was actually paid. Nothing in this
 * component decides what a connect is worth.
 */
export function ConnectLedger({
  position,
  purchases,
}: {
  position: ConnectPosition;
  purchases: ConnectPurchase[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <Card className="mb-8">
      <CardHeader
        title="Connects"
        action={
          <span className="flex flex-wrap items-center gap-3">
            <span className="text-[12.5px] text-[var(--ink-300)]">
              {position.rate_inr === null
                ? "No purchases yet"
                : `${formatMoney(Math.round(position.rate_inr))} each, all in`}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setAdding((v) => !v)}>
              {adding ? "Cancel" : "Record a purchase"}
            </Button>
          </span>
        }
      />

      <div className="px-6 py-5">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-5">
          <Figure label="Left" value={position.connects_left.toLocaleString()} tone="accent" />
          <Figure label="Bought" value={position.connects_bought.toLocaleString()} />
          <Figure label="Free" value={position.connects_free.toLocaleString()} />
          <Figure label="Spent" value={position.connects_spent.toLocaleString()} />
          <Figure label="Refunded" value={position.connects_refunded.toLocaleString()} />
        </div>

        {position.rate_inr !== null && (
          <p className="mt-4 mb-0 max-w-[78ch] text-[13px] leading-[1.7] text-[var(--ink-400)]">
            {formatMoney(position.paid_inr)} for {position.connects_acquired.toLocaleString()}{" "}
            connects — {formatMoney(Math.round(position.rate_inr))} each, tax included and free
            grants counted. This is what was actually paid divided by what actually arrived, so a
            price change or a bulk deal needs no adjustment anywhere.
            {position.tax_usd > 0 && (
              <>
                {" "}
                {formatMoney(position.tax_usd, "USD")} of it was tax, kept separate in case
                it&rsquo;s reclaimable.
              </>
            )}
          </p>
        )}
      </div>

      {adding && <PurchaseForm onDone={() => setAdding(false)} />}

      {purchases.length === 0 ? (
        <EmptyState>No connect purchases recorded.</EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Bought</Th>
              <Th>Connects</Th>
              <Th>Paid</Th>
              <Th>Tax</Th>
              <Th>Note</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <PurchaseRow key={purchase.id} purchase={purchase} />
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}

function todayISO(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function PurchaseForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [purchasedOn, setPurchasedOn] = useState(todayISO());
  const [connects, setConnects] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [taxUsd, setTaxUsd] = useState("");
  const [amountInr, setAmountInr] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [note, setNote] = useState("");

  // Prefill the list price as soon as a quantity is known. Editable, because
  // the whole point is that the stored figure is what you actually paid.
  function onConnectsChange(next: string) {
    setConnects(next);
    const n = Number(next);
    if (!isFree && Number.isFinite(n) && n > 0 && !amountUsd) {
      setAmountUsd((n * DEFAULT_USD_PER_CONNECT).toFixed(2));
    }
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveConnectPurchase({
        purchasedOn,
        connects: Number(connects),
        amountUsd: amountUsd.trim() === "" ? null : Number(amountUsd),
        taxUsd: taxUsd.trim() === "" ? null : Number(taxUsd),
        amountInr: amountInr.trim() === "" ? null : Number(amountInr),
        isFree,
        note,
      });
      if (result.ok) {
        onDone();
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  const implied =
    connects && amountInr && Number(connects) > 0
      ? Number(amountInr) / Number(connects)
      : null;

  return (
    <div className="mx-6 mb-5 rounded-[10px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-1)] p-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Date">
          <input
            className={`${inputClass} w-[150px]`}
            type="date"
            value={purchasedOn}
            max={todayISO()}
            onChange={(e) => setPurchasedOn(e.target.value)}
          />
        </Field>

        <Field label="Connects">
          <input
            className={`${inputClass} w-[110px]`}
            inputMode="numeric"
            placeholder="500"
            value={connects}
            onChange={(e) => onConnectsChange(e.target.value)}
          />
        </Field>

        {!isFree && (
          <>
            <Field label="Paid ($, before tax)">
              <input
                className={`${inputClass} w-[140px]`}
                inputMode="decimal"
                placeholder="75.00"
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
              />
            </Field>

            <Field label="Tax ($)">
              <input
                className={`${inputClass} w-[110px]`}
                inputMode="decimal"
                placeholder="13.50"
                value={taxUsd}
                onChange={(e) => setTaxUsd(e.target.value)}
              />
            </Field>

            <Field label="Charged (₹)">
              <input
                className={`${inputClass} w-[140px]`}
                inputMode="decimal"
                placeholder="7420"
                value={amountInr}
                onChange={(e) => setAmountInr(e.target.value)}
              />
            </Field>
          </>
        )}

        <label className="flex items-center gap-2 pb-[10px] text-[13px] text-[var(--ink-600)]">
          <input
            type="checkbox"
            className="accent-[var(--accent)]"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
          />
          Free with membership
        </label>

        <Field label="Note">
          <input
            className={`${inputClass} w-[180px]`}
            placeholder="optional"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>

        <Button size="sm" disabled={pending || !connects.trim()} onClick={save}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>

      <p className="mt-3 mb-0 max-w-[80ch] text-[12px] leading-[1.6] text-[var(--ink-300)]">
        The dollar figures are prefilled at Upwork&rsquo;s {DEFAULT_USD_PER_CONNECT.toFixed(2)} list
        price — change them to whatever the invoice says. The rupee figure is what your card was
        actually charged; it&rsquo;s the one the budget counts, and it&rsquo;s never converted from
        the dollars.
        {implied !== null && (
          <>
            {" "}
            That works out at {formatMoney(Math.round(implied))} a connect.
          </>
        )}
      </p>

      {error && (
        <p role="alert" className="mt-2 mb-0 text-[12.5px] text-[var(--danger-600)]">
          {error}
        </p>
      )}
    </div>
  );
}

function PurchaseRow({ purchase }: { purchase: ConnectPurchase }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <tr className="hover:bg-[var(--surface-1)] transition-colors duration-150">
      <Td className="whitespace-nowrap text-[13px] text-[var(--ink-500)]">
        {formatDay(purchase.purchased_on)}
      </Td>
      <Td className="font-semibold text-[var(--ink-800)] [font-variant-numeric:tabular-nums]">
        {purchase.connects.toLocaleString()}
        {purchase.is_free && (
          <span className="ml-2 inline-block align-middle">
            <Pill tone="mint">free</Pill>
          </span>
        )}
      </Td>
      <Td className="whitespace-nowrap [font-variant-numeric:tabular-nums]">
        {purchase.amount_inr === null ? (
          <span className="text-[var(--ink-100)]">—</span>
        ) : (
          <span className="font-semibold text-[var(--ink-800)]">
            {formatMoney(purchase.amount_inr)}
          </span>
        )}
        {purchase.amount_usd !== null && (
          <span className="block text-[12px] text-[var(--ink-300)]">
            {formatMoney(purchase.amount_usd, "USD")}
          </span>
        )}
      </Td>
      <Td className="whitespace-nowrap text-[13px] text-[var(--ink-500)] [font-variant-numeric:tabular-nums]">
        {purchase.tax_usd === null ? "—" : formatMoney(purchase.tax_usd, "USD")}
      </Td>
      <Td className="text-[13px] text-[var(--ink-400)]">{purchase.note ?? ""}</Td>
      <Td>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await deleteConnectPurchase(purchase.id);
              router.refresh();
            })
          }
        >
          Delete
        </Button>
      </Td>
    </tr>
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

function Figure({ label, value, tone }: { label: string; value: string; tone?: "accent" }) {
  return (
    <div>
      <p className="m-0 font-mono text-[10px] tracking-[1.4px] uppercase text-[var(--ink-200)]">
        {label}
      </p>
      <p
        className={`mt-1 mb-0 text-[24px] font-extrabold leading-none tracking-[-0.5px] [font-variant-numeric:tabular-nums] ${
          tone === "accent" ? "text-[var(--accent-strong)]" : "text-[var(--ink-900)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
