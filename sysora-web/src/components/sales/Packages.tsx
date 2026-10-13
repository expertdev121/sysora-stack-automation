"use client";

import Link from "next/link";

import { packages } from "@/content/landing/sales";
import { routes } from "@/config/site";
import {
  checkoutHref,
  money,
  packs,
  rateBar,
  useSales,
} from "@/components/sales/SalesProvider";

export function BillingToggle({ compact = false }: { compact?: boolean }) {
  const { billing, setBilling } = useSales();
  return (
    <div
      className={
        "sx-seg flex gap-1 p-1 rounded-xl border-[1.5px] border-[var(--border-default)] " +
        (compact ? "bg-[var(--mint-50)] inline-flex" : "bg-[var(--mint-100)]")
      }
      role="group"
      aria-label="Billing"
    >
      <button
        type="button"
        data-on={billing === "once" ? "1" : "0"}
        aria-pressed={billing === "once"}
        onClick={() => setBilling("once")}
      >
        {packages.onceLabel}
      </button>
      <button
        type="button"
        data-on={billing === "monthly" ? "1" : "0"}
        aria-pressed={billing === "monthly"}
        onClick={() => setBilling("monthly")}
      >
        {packages.monthlyLabel}
      </button>
    </div>
  );
}

export function Packages() {
  const { billing } = useSales();
  const per = billing === "monthly" ? " / mo" : "";

  return (
    <section
      id="packages"
      className="px-6 pt-[clamp(56px,7vh,88px)] pb-[clamp(78px,10vh,120px)] bg-[var(--mint-50)]"
    >
      <div className="max-w-[1160px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--accent-strong)]">
              {packages.eyebrow}
            </span>
            <h2 className="mt-3 text-[clamp(32px,3.8vw,46px)] font-black tracking-[-1.2px] leading-[1.08] text-[var(--ink-900)]">
              {packages.headline}
            </h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <BillingToggle />
            <span className="text-[12.5px] text-[var(--ink-500)]">{packages.billingNote}</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3 mt-8 to-980:grid-cols-4 to-640:grid-cols-2">
          {packs.map((pack) => (
            <Link
              key={pack.hours}
              href={checkoutHref(pack.hours, billing)}
              className="sx-pk-tile relative flex flex-col px-4 pt-5 pb-4 rounded-[16px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05)] text-inherit no-underline"
            >
              <span className="font-mono text-[10.5px] tracking-[1.2px] uppercase text-[var(--ink-300)]">
                Hours
              </span>
              <span className="mt-1 font-mono text-[34px] font-semibold tracking-[-1.2px] leading-[1.1] text-[var(--ink-900)]">
                {pack.hours}
              </span>
              <span className="mt-[14px] font-mono text-[18px] font-semibold text-[var(--ink-900)]">
                {money(pack.price)}
                <span className="text-[12px] font-medium text-[var(--ink-300)]">{per}</span>
              </span>
              <span className="mt-[3px] text-[12.5px] text-[var(--ink-500)]">
                ${pack.rate} / hour
              </span>
              <span className="mt-3 h-[6px] rounded-[6px] bg-[var(--mint-50)] border border-[var(--border-faint)] overflow-hidden">
                <span
                  className="sx-bar-fill block h-full rounded-[6px] bg-[var(--mint-300)]"
                  style={{ width: rateBar(pack.rate) }}
                />
              </span>
              <span className="sx-pk-cta mt-4 flex items-center justify-center px-2 py-[9px] rounded-[10px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] text-[13px] font-semibold text-[var(--accent-strong)] whitespace-nowrap">
                Buy {pack.hours} hours
              </span>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-7 gap-y-[10px] mt-[22px] text-[13.5px] leading-[1.6] text-[var(--ink-500)]">
          <span className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            {packages.footnotes[0]}
          </span>
          <span className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
              <circle cx="7.5" cy="7.5" r="1.2" />
            </svg>
            {packages.footnotes[1]}
          </span>
          <span className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {packages.customLead}{" "}
            <Link href={routes.requestEstimate} className="font-semibold">
              {packages.customCta}
            </Link>
          </span>
        </div>
      </div>
    </section>
  );
}
