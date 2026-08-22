import { Eyebrow } from "@/components/ui/Eyebrow";
import { process } from "@/content/landing/process";

export function Process() {
  return (
    <section
      id="how"
      className="px-6 py-[clamp(104px,13vh,152px)] bg-[var(--surface-2)] border-t-[1.5px] border-b-[1.5px] border-[var(--border-faint)]"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[740px]">
          <Eyebrow>{process.eyebrow}</Eyebrow>
          <h2 className="mt-0 mb-[22px] text-[clamp(34px,4.4vw,54px)] font-extrabold leading-[1.2] tracking-[-0.8px] text-[var(--ink-900)]">
            {process.headline}
          </h2>
        </div>

        {/* Animated stage rail */}
        <div className="relative mt-12 p-10 rounded-[22px] bg-[linear-gradient(150deg,#153826,#194430)] overflow-hidden">
          <div
            aria-hidden="true"
            className="rail-anim pointer-events-none absolute -top-[40%] -right-[10%] bottom-auto -left-[10%] h-[420px] bg-[radial-gradient(ellipse_45%_100%_at_50%_0%,rgba(0,200,150,0.16),transparent_70%)] animate-[heroDriftB_22s_ease_infinite_alternate]"
          />

          <div className="relative flex flex-wrap items-center justify-between gap-[14px] mb-[26px]">
            <span className="font-mono text-[12px] tracking-[1px] uppercase text-white/45">
              {process.rail.from}
            </span>
            <span className="inline-flex items-center gap-[9px] font-mono text-[12px] tracking-[1px] uppercase text-[var(--accent)]">
              <span className="rail-anim w-[7px] h-[7px] rounded-full bg-[var(--accent)] animate-[dotBlink_2s_ease_infinite]" />
              {process.rail.to}
            </span>
          </div>

          <div
            aria-hidden="true"
            className="proc-rail relative h-[2px] mb-[22px] rounded-[2px] bg-white/10 overflow-hidden to-860:hidden"
          >
            <span className="rail-anim absolute top-0 bottom-0 left-0 right-auto w-0 bg-[linear-gradient(90deg,var(--mint-700),var(--accent))] animate-[railFill_8s_linear_infinite]" />
          </div>

          <div className="relative grid gap-[14px] grid-cols-4 to-860:grid-cols-2 to-520:grid-cols-1">
            {process.stages.map((stage, i) => (
              <div
                key={stage.number}
                className="proc-tile relative flex flex-col gap-[14px] px-6 py-[26px] rounded-2xl bg-white/[0.035] border-[1.5px] border-white/[0.09]"
                style={{ animationDelay: `${i * 2}s` }}
              >
                <span
                  className="proc-chip inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.06] border-[1.5px] border-white/[0.14] font-mono text-[15px] font-semibold text-white/70"
                  style={{ animationDelay: `${i * 2}s` }}
                >
                  {stage.number}
                </span>
                <p className="m-0 text-[clamp(20px,2.5vw,26px)] font-extrabold tracking-[-0.8px] leading-[1.1] text-white">
                  {stage.title}
                </p>
                <p className="m-0 font-mono text-[12px] tracking-[0.6px] uppercase text-white/45">
                  {stage.caption}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stage detail cards */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-5 mt-6 items-stretch">
          {process.details.map((detail) => (
            <div
              key={detail.number}
              className="p-card flex flex-col p-[30px] rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-faint)] shadow-[0_2px_4px_rgba(0,80,50,0.04),0_20px_44px_rgba(0,80,50,0.07)]"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] font-mono text-[13px] font-semibold text-[var(--mint-700)]">
                  {detail.number}
                </span>
                <h3 className="m-0 text-[20px] font-bold tracking-[-0.3px] text-[var(--ink-900)]">
                  {detail.title}
                </h3>
              </div>
              <p className="mt-[18px] mb-0 text-[15.5px] leading-[1.75] text-[var(--ink-500)]">
                {detail.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
