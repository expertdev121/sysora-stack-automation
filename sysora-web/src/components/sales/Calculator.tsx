"use client";

import { Button } from "@/components/ui/Button";
import { StarIcon } from "@/components/ui/Icon";
import { BillingToggle } from "@/components/sales/Packages";
import { checkoutHref, money, packs, useSales } from "@/components/sales/SalesProvider";
import { calculator } from "@/content/landing/sales";

export function Calculator() {
  const { billing, pick, setPick } = useSales();
  const pack = packs[pick];
  const monthly = billing === "monthly";

  return (
    <section id="calculator" className="px-6 py-[clamp(78px,10vh,120px)]">
      <div className="max-w-[1160px] mx-auto">
        <div className="max-w-[720px]">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--accent-strong)]">
            {calculator.eyebrow}
          </span>
          <h2 className="mt-[14px] text-[clamp(30px,3.6vw,44px)] font-black tracking-[-1.1px] leading-[1.1] text-[var(--ink-900)]">
            {calculator.headline}
          </h2>
        </div>

        <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] gap-6 mt-10 items-stretch to-860:grid-cols-1">
          <div className="p-[clamp(24px,3vw,36px)] rounded-[22px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_4px_10px_rgba(0,80,50,0.06),0_30px_64px_rgba(0,80,50,0.12)]">
            <p className="text-[13.5px] font-semibold text-[var(--ink-700)]">
              {calculator.billingLabel}
            </p>
            <div className="mt-[10px]">
              <BillingToggle compact />
            </div>

            <p className="mt-6 text-[13.5px] font-semibold text-[var(--ink-700)]">
              {calculator.packLabel}
            </p>
            <div className="grid grid-cols-7 gap-2 mt-[10px] to-640:grid-cols-4">
              {packs.map((p, i) => (
                <button
                  key={p.hours}
                  type="button"
                  className="sx-chip"
                  data-on={i === pick ? "1" : "0"}
                  aria-pressed={i === pick}
                  onClick={() => setPick(i)}
                >
                  {p.hours}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 mt-7">
              <div className="p-[18px] rounded-[14px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
                <p className="font-mono text-[10.5px] tracking-[1.1px] uppercase text-[var(--ink-300)]">
                  {calculator.tiles.total}
                </p>
                <p className="mt-2 font-mono text-[30px] font-semibold tracking-[-1px] text-[var(--ink-900)]">
                  {money(pack.price)}
                  {monthly ? " / mo" : ""}
                </p>
              </div>
              <div className="p-[18px] rounded-[14px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
                <p className="font-mono text-[10.5px] tracking-[1.1px] uppercase text-[var(--ink-300)]">
                  {calculator.tiles.rate}
                </p>
                <p className="mt-2 font-mono text-[30px] font-semibold tracking-[-1px] text-[var(--accent-strong)]">
                  ${pack.rate} / hr
                </p>
              </div>
              <div className="p-[18px] rounded-[14px] bg-[var(--surface-1)] border-[1.5px] border-[var(--border-faint)]">
                <p className="font-mono text-[10.5px] tracking-[1.1px] uppercase text-[var(--ink-300)]">
                  {calculator.tiles.validity}
                </p>
                <p className="mt-2 text-[15px] font-semibold leading-[1.4] text-[var(--ink-800)]">
                  {monthly ? calculator.validityMonthly : calculator.validityOnce}
                </p>
              </div>
              <div className="p-[18px] rounded-[14px] bg-[var(--surface-1)] border-[1.5px] border-[var(--border-faint)]">
                <p className="font-mono text-[10.5px] tracking-[1.1px] uppercase text-[var(--ink-300)]">
                  {calculator.tiles.support}
                </p>
                <p className="mt-2 text-[15px] font-semibold leading-[1.4] text-[var(--ink-800)]">
                  {calculator.tiles.supportValue}
                </p>
              </div>
            </div>

            <p className="mt-[18px] text-[14px] leading-[1.7] text-[var(--ink-600)]">
              {monthly ? calculator.noteMonthly : calculator.noteOnce}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-6 pt-[22px] border-t-[1.5px] border-[var(--border-faint)]">
              <Button size="lg" arrow href={checkoutHref(pack.hours, billing)}>
                {calculator.cta}
              </Button>
              <p className="flex-1 min-w-[220px] text-[12.5px] leading-[1.6] text-[var(--ink-500)]">
                {calculator.ctaNote}
              </p>
            </div>
          </div>

          <figure className="sx-card m-0 flex flex-col justify-between p-8 rounded-[22px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
            <div>
              <span className="flex gap-[2px] text-[#F97316]" aria-label="5 stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon key={i} size={15} />
                ))}
              </span>
              <blockquote className="mt-5 mb-0 font-heading text-[24px] font-bold leading-[1.38] tracking-[-0.3px] text-[var(--ink-900)]">
                {calculator.quote}
              </blockquote>
            </div>
            <figcaption className="mt-6 pt-4 border-t-[1.5px] border-[var(--border-default)] text-[12.5px] italic leading-[1.6] text-[var(--ink-500)]">
              {calculator.quoteSource}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
