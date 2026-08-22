import { Eyebrow } from "@/components/ui/Eyebrow";
import { whyUs } from "@/content/landing/why-us";

export function WhyUs() {
  return (
    <section className="px-6 py-[clamp(104px,13vh,152px)] bg-[var(--surface-1)] border-t-[1.5px] border-b-[1.5px] border-[var(--border-faint)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[740px]">
          <Eyebrow>{whyUs.eyebrow}</Eyebrow>
          <h2 className="mt-0 mb-[22px] text-[clamp(34px,4.4vw,54px)] font-extrabold leading-[1.2] tracking-[-0.8px] text-[var(--ink-900)]">
            {whyUs.headline}
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-5 mt-12 items-stretch">
          {whyUs.reasons.map((reason) => (
            <div
              key={reason.number}
              className="p-card flex flex-col p-8 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_4px_rgba(0,80,50,0.04),0_20px_44px_rgba(0,80,50,0.07)]"
            >
              <span className="font-mono text-[13px] font-semibold text-[var(--accent-strong)]">
                {reason.number}
              </span>
              <h3 className="mt-[18px] mb-3 min-h-[52px] text-[17px] font-bold tracking-[-0.3px] leading-[1.2] text-[var(--ink-900)]">
                {reason.title}
              </h3>
              <p className="m-0 text-[15.5px] leading-[1.75] text-[var(--ink-500)]">{reason.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
