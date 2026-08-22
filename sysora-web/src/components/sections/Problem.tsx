import { ChartIcon, GearIcon, HandoffIcon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { problem } from "@/content/landing/problem";

const iconFor = {
  handoff: HandoffIcon,
  gear: GearIcon,
  chart: ChartIcon,
} as const;

export function Problem() {
  return (
    <section id="problem" className="px-6 py-[clamp(104px,13vh,152px)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[740px]">
          <Eyebrow>{problem.eyebrow}</Eyebrow>
          <h2 className="mt-0 mb-[22px] text-[clamp(34px,4.4vw,54px)] font-extrabold leading-[1.2] tracking-[-0.8px] text-[var(--ink-900)]">
            {problem.headline}
            <span className="text-[var(--accent-strong)]">{problem.headlineAccent}</span>
          </h2>
          <p className="m-0 text-[19px] leading-[1.75] text-[var(--ink-600)]">{problem.lead}</p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-5 mt-12 items-stretch">
          {problem.cards.map((card) => {
            const CardIcon = iconFor[card.icon];
            return (
              <div
                key={card.title}
                className="p-card flex flex-col p-8 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_4px_rgba(0,80,50,0.04),0_20px_44px_rgba(0,80,50,0.07)]"
              >
                <span className="inline-flex items-center justify-center w-[46px] h-[46px] rounded-[13px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] text-[var(--accent-strong)]">
                  <CardIcon />
                </span>
                <h3 className="mt-[22px] mb-3 min-h-[52px] text-[17px] font-bold tracking-[-0.3px] leading-[1.2] text-[var(--ink-900)]">
                  {card.title}
                </h3>
                <p className="m-0 text-[15.5px] leading-[1.75] text-[var(--ink-500)]">{card.body}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 px-10 py-9 rounded-[18px] bg-[linear-gradient(120deg,#153826,#194430)] grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 items-start">
          <p className="m-0 text-[20px] font-bold leading-[1.5] tracking-[-0.3px] text-white">
            {problem.callout.title}
          </p>
          <p className="m-0 max-w-[52ch] text-[15px] leading-[1.75] text-[var(--text-on-dark-muted)]">
            {problem.callout.body}
          </p>
        </div>
      </div>
    </section>
  );
}
