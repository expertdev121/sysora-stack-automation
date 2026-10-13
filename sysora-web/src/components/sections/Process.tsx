import { ArrowRightIcon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { process } from "@/content/landing/process";

export function Process() {
  return (
    <section id="how" className="px-6 py-[clamp(78px,10vh,126px)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[720px]">
          <Eyebrow className="text-[var(--mint-700)]">{process.eyebrow}</Eyebrow>
          <h2 className="text-[clamp(30px,3.6vw,46px)] font-black leading-[1.1] tracking-[-1px] text-[var(--ink-900)]">
            {process.headline}
          </h2>
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-[14px] mt-[34px] px-[22px] py-4 rounded-[14px] bg-[var(--surface-1)] border-[1.5px] border-[var(--border-default)] overflow-hidden">
          <span aria-hidden="true" className="sx-wire" />
          <span
            aria-hidden="true"
            className="sx-packet"
            style={{ animationDuration: "4.6s" }}
          />
          <span className="text-[14px] font-semibold text-[var(--ink-500)]">
            {process.banner.from}
          </span>
          <ArrowRightIcon size={20} strokeWidth={1.75} />
          <span className="text-[14px] font-bold text-[var(--accent-strong)]">
            {process.banner.to}
          </span>
        </div>

        <div className="grid grid-cols-4 mt-[26px] rounded-[20px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.07)] overflow-hidden to-980:grid-cols-2 to-640:grid-cols-1">
          {process.stages.map((stage) => (
            <div
              key={stage.n}
              className="sx-row px-7 py-8 border-r-[1.5px] border-b-[1.5px] border-[var(--border-faint)] last:border-r-0"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[26px] font-semibold tracking-[-1px] leading-none text-[var(--mint-300)]">
                  {stage.n}
                </span>
                <h3 className="text-[20px] font-bold leading-[1.2] text-[var(--ink-900)]">
                  {stage.title}
                </h3>
              </div>
              <p className="mt-4 mb-0 text-[15px] leading-[1.75] text-[var(--ink-500)]">
                {stage.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
