import { ArrowRightIcon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { offers } from "@/content/landing/offers";
import { cn } from "@/lib/cn";

const { chooser } = offers;

function TickIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-none mt-[3px]"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function Offers() {
  return (
    <section id="start" className="px-6 py-[clamp(104px,13vh,152px)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[740px]">
          <Eyebrow>{offers.eyebrow}</Eyebrow>
          <h2 className="mt-0 mb-[22px] text-[clamp(34px,4.4vw,54px)] font-extrabold leading-[1.2] tracking-[-0.8px] text-[var(--ink-900)]">
            {offers.headline}
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 mt-12 items-stretch">
          {offers.plans.map((plan) => (
            <div
              key={plan.number}
              className={cn(
                "p-card p-price flex flex-col px-8 py-[34px] rounded-[20px] bg-[var(--surface-0)] border-[1.5px]",
                plan.featured
                  ? "border-[var(--accent)] shadow-[var(--glow-featured)]"
                  : "border-[var(--border-default)] shadow-[0_2px_4px_rgba(0,80,50,0.04),0_20px_44px_rgba(0,80,50,0.07)]",
              )}
            >
              <div className="flex items-center justify-between gap-3 min-h-[26px] mb-[22px]">
                <span
                  className={cn(
                    "font-mono text-[13px] font-semibold",
                    plan.featured ? "text-[var(--accent-strong)]" : "text-[var(--ink-200)]",
                  )}
                >
                  {plan.number}
                </span>
                {plan.badge && (
                  <span className="px-3 py-[5px] rounded-full bg-[var(--accent)] text-[11px] font-bold tracking-[1.5px] uppercase text-white">
                    {plan.badge}
                  </span>
                )}
              </div>

              <h3 className="m-0 min-h-[62px] text-[clamp(20px,2.5vw,26px)] font-extrabold tracking-[-0.8px] leading-[1.2] text-[var(--ink-900)]">
                {plan.title}
              </h3>

              <div className="flex items-baseline flex-wrap gap-2 min-h-[52px] pb-5 mb-[22px] border-b-[1.5px] border-[var(--border-faint)]">
                <span
                  className={cn(
                    "font-mono text-[34px] font-semibold tracking-[-1px] leading-none",
                    plan.featured ? "text-[var(--accent-strong)]" : "text-[var(--ink-900)]",
                  )}
                >
                  {plan.price}
                </span>
                <span className="text-[13px] text-[var(--text-muted)]">{plan.priceNote}</span>
              </div>

              <p className="mt-0 mb-4 min-h-[66px] text-[15px] font-semibold leading-[1.65] text-[var(--ink-700)]">
                {plan.summary}
              </p>

              <ul className="mt-0 mb-4 p-0 list-none flex flex-col gap-[10px]">
                {plan.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-[10px] text-[15.5px] leading-[1.65] text-[var(--ink-500)]"
                  >
                    <TickIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {plan.footnote && (
                <p className="m-0 text-[13px] leading-[1.65] text-[var(--ink-300)]">
                  {plan.footnote}
                </p>
              )}

              <div className="mt-auto pt-7">
                <Button
                  size="lg"
                  fullWidth
                  variant={plan.cta.variant}
                  arrow={plan.cta.arrow}
                  href={plan.cta.href}
                >
                  {plan.cta.label}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {chooser.show && (
          <div className="mt-16 px-10 py-11 rounded-[22px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
            <div className="text-center max-w-[560px] mx-auto mb-[34px]">
              <h3 className="mt-0 mb-2 text-[clamp(24px,2.6vw,32px)] font-extrabold tracking-[-0.8px] leading-[1.2] text-[var(--ink-900)]">
                {chooser.title}
              </h3>
              <p className="m-0 text-[15.5px] leading-[1.75] text-[var(--ink-500)]">
                {chooser.lead}
              </p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[18px] items-stretch">
              {chooser.cards.map((card) => (
                <div
                  key={card.answer}
                  className="p-card flex flex-col gap-[18px] p-[26px] rounded-[18px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_4px_rgba(0,80,50,0.04),0_14px_32px_rgba(0,80,50,0.06)]"
                >
                  <p className="m-0 flex-1 text-[16.5px] italic leading-[1.65] text-[var(--ink-700)]">
                    {card.quote}
                  </p>
                  <div className="flex items-center gap-[10px] pt-4 border-t-[1.5px] border-[var(--border-faint)]">
                    <ArrowRightIcon />
                    <span className="flex flex-col gap-[2px]">
                      <span className="text-[15px] font-bold text-[var(--accent-strong)]">
                        {card.answer}
                      </span>
                      <span className="font-mono text-[12.5px] text-[var(--ink-300)]">
                        {card.price}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <Button variant="ghost" arrow href={chooser.cta.href}>
                {chooser.cta.label}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
