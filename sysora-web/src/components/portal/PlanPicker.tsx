"use client";

import { useState, useTransition } from "react";

import { PaymentPanel } from "@/components/checkout/PaymentPanel";
import { completePortalSimulated, purchaseHours } from "@/lib/portal/purchase";
import type { PaymentSession } from "@/lib/sales/payments";
import { cn } from "@/lib/cn";

type Pack = { hours: number; price: number; rate: number };

/**
 * The rate card, inside the portal.
 *
 * Picking a pack creates the order from the session and drops straight
 * to the card field — no name, email or company, because the account
 * already has all three. Upgrading and downgrading are the same action:
 * each order stands alone at the tier chosen for it.
 */
export function PlanPicker({
  packs,
  currentHours,
  remaining,
}: {
  packs: Pack[];
  currentHours: number | null;
  remaining: number;
}) {
  const [billing, setBilling] = useState<"once" | "monthly">("once");
  const [picked, setPicked] = useState<number | null>(null);
  const [paying, setPaying] = useState<{ reference: string; session: PaymentSession } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function buy(hours: number) {
    setError(null);
    setPicked(hours);
    start(async () => {
      const result = await purchaseHours({ hours, billing });
      if (result.ok) setPaying({ reference: result.reference, session: result.session });
      else {
        setError(result.error);
        setPicked(null);
      }
    });
  }

  if (paying) {
    return (
      <section className="mt-6 rounded-[18px] border border-[var(--line-slate)] bg-white p-6">
        <h2 className="text-[16px] font-bold text-[var(--text-heading)]">
          Pay for {picked} hours
        </h2>
        <p className="mt-1 text-[13px] text-[var(--text-muted)]">
          Order <span className="font-mono">{paying.reference}</span> · billed to the card you
          enter below. Your details are already on file.
        </p>
        <div className="mt-5">
          <PaymentPanel
            session={paying.session}
            reference={paying.reference}
            completeSimulated={() => completePortalSimulated(paying.reference)}
          />
        </div>
        <button
          type="button"
          onClick={() => { setPaying(null); setPicked(null); }}
          className="mt-4 text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-heading)]"
        >
          ← Pick a different package
        </button>
      </section>
    );
  }

  return (
    <>
      <div className="mt-6 inline-flex rounded-xl border border-[var(--line-slate)] bg-white p-1">
        {(["once", "monthly"] as const).map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBilling(b)}
            className={cn(
              "rounded-lg px-4 py-[8px] text-[13.5px] font-semibold transition-colors",
              billing === b
                ? "bg-[var(--mint-50)] text-[var(--accent-strong)]"
                : "text-[var(--text-muted)]",
            )}
          >
            {b === "once" ? "One-time pack" : "Monthly plan"}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[12.5px] text-[var(--text-muted)]">
        {billing === "once"
          ? "Valid 60 days from purchase."
          : "Resets each billing cycle, no carryover. Cancel any time."}
      </p>

      {error && (
        <p className="mt-4 rounded-xl border-[1.5px] border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-[13.5px] text-[var(--danger-600)]">
          {error}
        </p>
      )}

      <div className="mt-5 grid grid-cols-4 gap-4 to-1180:grid-cols-3 to-860:grid-cols-2 to-520:grid-cols-1">
        {packs.map((p) => {
          const isCurrent = currentHours === p.hours;
          return (
            <article
              key={p.hours}
              className={cn(
                "flex flex-col rounded-[16px] border bg-white p-5",
                isCurrent ? "border-[var(--accent)] ring-1 ring-[var(--accent)]" : "border-[var(--line-slate)]",
              )}
            >
              {isCurrent && (
                <span className="mb-2 inline-flex w-fit rounded-full bg-[var(--mint-50)] px-[9px] py-[2px] text-[11px] font-bold text-[var(--accent-strong)]">
                  Your plan
                </span>
              )}
              <p className="font-display text-[26px] font-black leading-none text-[var(--text-heading)]">
                {p.hours}h
              </p>
              <p className="mt-2 text-[15px] font-semibold text-[var(--text-heading)]">
                ${p.price.toLocaleString()}
                {billing === "monthly" && (
                  <span className="text-[13px] font-medium text-[var(--text-muted)]"> / mo</span>
                )}
              </p>
              <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">${p.rate} / hour</p>

              <button
                type="button"
                disabled={pending}
                onClick={() => buy(p.hours)}
                className="mt-4 rounded-xl bg-[var(--accent)] px-4 py-[10px] text-[13.5px] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-60"
              >
                {pending && picked === p.hours ? "Starting…" : `Buy ${p.hours} hours`}
              </button>
            </article>
          );
        })}
      </div>

      <p className="mt-5 text-[12.5px] leading-[1.7] text-[var(--text-muted)]">
        You have {Math.round(remaining * 100) / 100}h left. Buying more adds to your balance; it
        does not replace it. Over 150 hours, open a ticket and we will quote it.
      </p>
    </>
  );
}
