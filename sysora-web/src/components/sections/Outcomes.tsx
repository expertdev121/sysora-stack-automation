import { CrossIcon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { outcomes } from "@/content/landing/outcomes";

const { comparison } = outcomes;

export function Outcomes() {
  return (
    <section className="px-6 py-[clamp(104px,13vh,152px)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[740px]">
          <Eyebrow>{outcomes.eyebrow}</Eyebrow>
          <h2 className="mt-0 mb-[22px] text-[clamp(34px,4.4vw,54px)] font-extrabold leading-[1.2] tracking-[-0.8px] text-[var(--ink-900)]">
            {outcomes.headline}
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 mt-12 items-stretch">
          {outcomes.cards.map((card) => (
            <div
              key={card.title}
              className="p-card flex flex-col p-8 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-faint)] shadow-[0_2px_4px_rgba(0,80,50,0.04),0_20px_44px_rgba(0,80,50,0.07)]"
            >
              <span className="inline-flex items-center justify-center w-[38px] h-[38px] rounded-[11px] bg-[var(--mint-100)] text-[var(--mint-700)]">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <h3 className="mt-5 mb-3 text-[17px] font-bold tracking-[-0.3px] leading-[1.2] text-[var(--ink-900)]">
                {card.title}
              </h3>
              <p className="m-0 text-[15.5px] leading-[1.75] text-[var(--ink-500)]">{card.body}</p>
            </div>
          ))}
        </div>

        <div className="p-card grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-0 mt-8 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_4px_rgba(0,80,50,0.04),0_20px_44px_rgba(0,80,50,0.07)] overflow-hidden to-860:grid-cols-1 to-860:gap-8">
          {/* Today, by hand */}
          <div className="px-8 py-[34px] bg-[var(--surface-1)] border-r-[1.5px] border-[var(--border-faint)]">
            <p className="mt-0 mb-[6px] font-mono text-[10px] tracking-[1.4px] uppercase text-[var(--ink-200)]">
              {comparison.before.label}
            </p>
            <p className="mt-0 mb-[22px] text-[20px] font-extrabold tracking-[-0.3px] text-[var(--ink-900)]">
              {comparison.before.title}
            </p>
            <div className="flex flex-col gap-[14px]">
              {comparison.before.steps.map((step) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="flex-none mt-[3px] w-4 h-4 rounded-full border-[1.5px] border-[var(--line-slate)] inline-flex items-center justify-center text-[var(--ink-100)]">
                    <CrossIcon />
                  </span>
                  <span className="text-[15px] leading-[1.65] text-[var(--ink-500)]">{step}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 mb-0 pt-[18px] border-t-[1.5px] border-[var(--border-faint)] font-mono text-[13px] text-[var(--ink-300)]">
              {comparison.before.metricLabel}
              <span className="text-[var(--ink-900)]">{comparison.before.metricValue}</span>
            </p>
          </div>

          {/* With Sysora */}
          <div className="px-8 py-[34px] bg-[var(--mint-50)]">
            <p className="mt-0 mb-[6px] font-mono text-[10px] tracking-[1.4px] uppercase text-[var(--mint-700)]">
              {comparison.after.label}
            </p>
            <p className="mt-0 mb-[22px] text-[20px] font-extrabold tracking-[-0.3px] text-[var(--ink-900)]">
              {comparison.after.title}
            </p>
            <div className="flex flex-col gap-[14px]">
              {comparison.after.steps.map((step) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="flex-none mt-[3px] w-4 h-4 rounded-full bg-[var(--accent)] inline-flex items-center justify-center text-white">
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-[15px] leading-[1.65] text-[var(--ink-700)]">{step}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 mb-0 pt-[18px] border-t-[1.5px] border-[var(--border-default)] font-mono text-[13px] text-[var(--ink-500)]">
              {comparison.after.metricLabel}
              <span className="text-[var(--accent-strong)]">{comparison.after.metricValue}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
