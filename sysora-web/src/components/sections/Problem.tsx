import { Eyebrow } from "@/components/ui/Eyebrow";
import { problem } from "@/content/landing/problem";

export function Problem() {
  return (
    <section
      id="problem"
      className="px-6 py-[clamp(78px,10vh,126px)] bg-[var(--surface-1)] border-y-[1.5px] border-[var(--border-faint)]"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-[clamp(32px,4vw,64px)] items-start to-860:grid-cols-1">
          <div>
            <Eyebrow className="text-[var(--mint-700)]">{problem.eyebrow}</Eyebrow>
            <h2 className="text-[clamp(30px,3.6vw,46px)] font-black leading-[1.1] tracking-[-1px] text-[var(--ink-900)]">
              {problem.headline}
            </h2>
          </div>
          <p className="m-0 text-[17px] leading-[1.8] text-[var(--ink-500)]">{problem.lead}</p>
        </div>

        <div className="mt-11 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.07)] overflow-hidden">
          {problem.rows.map((row) => (
            <div
              key={row.n}
              className="sx-row grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-[clamp(18px,3vw,44px)] px-[clamp(24px,3vw,34px)] py-7 border-b-[1.5px] border-[var(--border-faint)] items-start to-860:grid-cols-1 to-860:gap-4"
            >
              <div className="flex items-start gap-4">
                <span className="inline-flex items-center justify-center w-9 h-9 flex-none rounded-[10px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] font-mono text-[12.5px] font-semibold text-[var(--mint-700)]">
                  {row.n}
                </span>
                <h3 className="text-[19.5px] font-bold leading-[1.35] text-[var(--ink-900)]">
                  {row.title}
                </h3>
              </div>
              <p className="m-0 text-[15.5px] leading-[1.75] text-[var(--ink-500)]">{row.body}</p>
            </div>
          ))}

          <p className="m-0 px-[clamp(24px,3vw,34px)] py-[26px] bg-[var(--mint-50)] text-[16.5px] leading-[1.75] text-[var(--ink-700)]">
            {problem.callout}
          </p>
        </div>
      </div>
    </section>
  );
}
