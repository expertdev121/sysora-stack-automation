import { Eyebrow } from "@/components/ui/Eyebrow";
import { shift } from "@/content/landing/shift";

export function Shift() {
  return (
    <section id="shift" className="px-6 py-[clamp(78px,10vh,126px)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[800px]">
          <Eyebrow className="text-[var(--mint-700)]">{shift.eyebrow}</Eyebrow>
          <h2 className="text-[clamp(30px,3.8vw,48px)] font-black leading-[1.1] tracking-[-1px] text-[var(--ink-900)]">
            {shift.headline}
          </h2>
          <p className="mt-[18px] mb-0 text-[17px] leading-[1.75] text-[var(--ink-500)]">
            {shift.lead}
          </p>
        </div>

        <div className="flex flex-wrap gap-[9px] mt-[26px]">
          {shift.tools.map((tool) => (
            <span
              key={tool}
              className="px-[15px] py-2 rounded-full bg-[var(--surface-1)] border-[1.5px] border-[var(--line-slate)] text-[13px] font-medium text-[var(--ink-600)]"
            >
              {tool}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6 mt-10 items-stretch">
          <div className="relative p-[34px] rounded-[18px] bg-[var(--surface-1)] border-[1.5px] border-[var(--line-slate)]">
            <p className="mt-0 mb-[14px] font-mono text-[10.5px] tracking-[1.3px] uppercase text-[var(--ink-300)]">
              {shift.before.label}
            </p>
            <p className="m-0 text-[21px] font-bold leading-[1.5] text-[var(--ink-500)]">
              {shift.before.quote}
            </p>
            <p className="mt-4 mb-0 text-[15.5px] leading-[1.75] text-[var(--ink-500)]">
              {shift.before.body}
            </p>
          </div>

          <div className="sx-card relative p-[34px] rounded-[18px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] shadow-[0_3px_8px_rgba(0,80,50,0.06),0_22px_48px_rgba(0,80,50,0.10)]">
            <span
              aria-hidden="true"
              className="absolute top-0 left-[34px] right-[34px] h-1 rounded-b bg-[linear-gradient(90deg,var(--accent),rgba(0,200,150,0))]"
            />
            <p className="mt-0 mb-[14px] font-mono text-[10.5px] tracking-[1.3px] uppercase text-[var(--mint-700)]">
              {shift.after.label}
            </p>
            <p className="m-0 text-[21px] font-bold leading-[1.5] text-[var(--ink-900)]">
              {shift.after.quote}
            </p>
            <p className="mt-4 mb-0 text-[15.5px] leading-[1.75] text-[var(--ink-600)]">
              {shift.after.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
