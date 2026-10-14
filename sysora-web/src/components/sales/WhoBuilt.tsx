
import { whoBuilt } from "@/content/landing/sales";

export function WhoBuilt() {
  return (
    <section className="px-6 py-[clamp(78px,10vh,120px)]">
      <div className="max-w-[1160px] mx-auto">
        <div className="relative overflow-hidden p-[clamp(32px,5vw,60px)] rounded-[24px] bg-[linear-gradient(135deg,var(--forest-hero),#1A6349)] text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-[160px] -right-[120px] w-[460px] h-[460px] rounded-full bg-[radial-gradient(closest-side,rgba(0,200,150,0.22),rgba(0,200,150,0))]"
          />
          <div className="relative grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-[clamp(28px,4vw,56px)] to-860:grid-cols-1">
            <div>
              <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--accent)]">
                {whoBuilt.eyebrow}
              </span>
              <h2 className="mt-[14px] text-[clamp(28px,3.2vw,40px)] font-black tracking-[-1px] leading-[1.12] text-white">
                {whoBuilt.headline}
              </h2>
              <div className="flex flex-wrap gap-2 mt-[26px]">
                {whoBuilt.stack.map((item) => (
                  <span
                    key={item}
                    className="px-[11px] py-[5px] rounded-full bg-white/[0.08] border-[1.5px] border-white/[0.16] font-mono text-[11.5px] text-white/[0.86]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              {whoBuilt.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="text-[16px] leading-[1.8] text-white/[0.84]">
                  {paragraph}
                </p>
              ))}
              <p className="mt-4 text-[16px] leading-[1.8] text-white/[0.84]">
                {whoBuilt.patternLead}
                <strong className="text-white">{whoBuilt.patternBold}</strong>
              </p>
              <div className="mt-[26px] pt-5 border-t-[1.5px] border-white/[0.14]">
                <p className="text-[12.5px] leading-[1.6] text-white/60">{whoBuilt.disclaimer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
