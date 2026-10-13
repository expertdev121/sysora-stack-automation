import { CheckIcon, CrossIcon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { outcomes } from "@/content/landing/outcomes";

export function Outcomes() {
  const { compare } = outcomes;

  return (
    <section
      id="outcome"
      className="px-6 py-[clamp(78px,10vh,126px)] bg-[var(--surface-1)] border-y-[1.5px] border-[var(--border-faint)]"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[740px]">
          <Eyebrow className="text-[var(--mint-700)]">{outcomes.eyebrow}</Eyebrow>
          <h2 className="text-[clamp(30px,3.6vw,46px)] font-black leading-[1.1] tracking-[-1px] text-[var(--ink-900)]">
            {outcomes.headline}
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mt-11 items-stretch">
          {outcomes.cards.map((card) => (
            <article
              key={card.title}
              className="sx-card p-8 rounded-[18px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_16px_36px_rgba(0,80,50,0.07)]"
            >
              <span aria-hidden="true" className="sx-accent-bar" />
              <h3 className="mt-[22px] mb-[10px] text-[19.5px] font-bold leading-[1.3] text-[var(--ink-900)]">
                {card.title}
              </h3>
              <p className="m-0 text-[15.5px] leading-[1.75] text-[var(--ink-500)]">{card.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-7 rounded-[20px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.07)] overflow-hidden">
          <div className="grid grid-cols-2 to-860:grid-cols-1">
            <div className="p-8 border-r-[1.5px] border-[var(--border-faint)] bg-[var(--surface-1)] to-860:border-r-0 to-860:border-b-[1.5px]">
              <p className="mt-0 mb-5 font-mono text-[10.5px] tracking-[1.3px] uppercase text-[var(--ink-300)]">
                {compare.todayLabel}
              </p>
              {compare.today.map((row) => (
                <p
                  key={row}
                  className="mt-0 mb-3 flex gap-[10px] text-[15px] leading-[1.6] text-[var(--ink-500)]"
                >
                  <CrossIcon
                    size={15}
                    strokeWidth={1.75}
                    className="flex-none mt-1 text-[var(--ink-300)]"
                  />
                  <span>{row}</span>
                </p>
              ))}
            </div>

            <div className="p-8 bg-[var(--mint-50)]">
              <p className="mt-0 mb-5 font-mono text-[10.5px] tracking-[1.3px] uppercase text-[var(--mint-700)]">
                {compare.withUsLabel}
              </p>
              {compare.withUs.map((row) => (
                <p
                  key={row}
                  className="mt-0 mb-3 flex gap-[10px] text-[15px] leading-[1.6] text-[var(--ink-700)]"
                >
                  <CheckIcon
                    size={15}
                    strokeWidth={2.2}
                    className="flex-none mt-1 text-[var(--accent-strong)]"
                  />
                  <span>{row}</span>
                </p>
              ))}
            </div>
          </div>

          <p className="m-0 px-8 py-[13px] border-t-[1.5px] border-[var(--border-faint)] bg-[var(--surface-1)] font-mono text-[10px] tracking-[1px] uppercase text-[var(--ink-300)]">
            {compare.disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}
