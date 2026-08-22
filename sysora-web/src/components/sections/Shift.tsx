import { Eyebrow } from "@/components/ui/Eyebrow";
import { shift } from "@/content/landing/shift";

export function Shift() {
  return (
    <section className="px-6 py-[clamp(104px,13vh,152px)] bg-[linear-gradient(165deg,#153826,#194430)]">
      <div className="max-w-[1200px] mx-auto grid grid-cols-[minmax(260px,0.85fr)_minmax(320px,1.15fr)] gap-14 items-start to-860:grid-cols-1 to-860:gap-8">
        <div>
          <Eyebrow>{shift.eyebrow}</Eyebrow>
          <h2 className="mt-0 mb-[22px] text-[clamp(34px,4.4vw,54px)] font-extrabold leading-[1.2] tracking-[-0.8px] text-white">
            {shift.headline}
          </h2>
          <p className="m-0 text-[15px] leading-[1.75] text-[var(--text-on-dark-muted)]">
            {shift.lead}
          </p>
          <div className="flex flex-wrap gap-[9px] mt-6">
            {shift.tools.map((tool) => (
              <span
                key={tool}
                className="px-[14px] py-[7px] rounded-full border-[1.5px] border-white/[0.16] text-[13px] font-semibold text-white/80"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[18px]">
          <div className="px-7 py-[26px] rounded-2xl bg-white/[0.035] border-[1.5px] border-white/[0.09]">
            <p className="mt-0 mb-2 font-mono text-[12px] tracking-[1px] uppercase text-white/[0.42]">
              {shift.wrongQuestion.label}
            </p>
            <p className="m-0 text-[17px] leading-[1.65] text-white/[0.72]">
              {shift.wrongQuestion.body}
            </p>
          </div>

          <div className="px-7 py-[26px] rounded-2xl bg-[rgba(0,200,150,0.09)] border-[1.5px] border-[rgba(0,200,150,0.30)]">
            <p className="mt-0 mb-2 font-mono text-[12px] tracking-[1px] uppercase text-[var(--accent)]">
              {shift.rightQuestion.label}
            </p>
            <p className="m-0 text-[17px] font-semibold leading-[1.65] text-white">
              {shift.rightQuestion.body}
            </p>
          </div>

          <p className="mt-[6px] mb-0 text-[15px] leading-[1.75] text-[var(--text-on-dark-muted)]">
            {shift.closing}
          </p>
        </div>
      </div>
    </section>
  );
}
