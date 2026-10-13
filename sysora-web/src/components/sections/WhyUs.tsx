import { Eyebrow } from "@/components/ui/Eyebrow";
import { whyUs } from "@/content/landing/why-us";

export function WhyUs() {
  return (
    <section
      id="why"
      className="px-6 py-[clamp(78px,10vh,126px)] bg-[var(--surface-1)] border-y-[1.5px] border-[var(--border-faint)]"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[720px]">
          <Eyebrow className="text-[var(--mint-700)]">{whyUs.eyebrow}</Eyebrow>
          <h2 className="text-[clamp(30px,3.6vw,46px)] font-black leading-[1.1] tracking-[-1px] text-[var(--ink-900)]">
            {whyUs.headline}
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mt-11 items-stretch">
          {whyUs.cards.map((card) => (
            <article
              key={card.n}
              className="sx-card p-[34px] rounded-[18px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_16px_36px_rgba(0,80,50,0.07)]"
            >
              <span className="font-mono text-[34px] font-semibold tracking-[-1.4px] leading-none text-[var(--mint-300)]">
                {card.n}
              </span>
              <h3 className="mt-[18px] mb-[10px] text-[19.5px] font-bold leading-[1.3] text-[var(--ink-900)]">
                {card.title}
              </h3>
              <p className="m-0 text-[15.5px] leading-[1.75] text-[var(--ink-500)]">{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
