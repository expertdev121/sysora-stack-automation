import { Button } from "@/components/ui/Button";
import { StarIcon } from "@/components/ui/Icon";
import { trackRecord } from "@/content/landing/sales";

export function TrackRecord() {
  return (
    <section id="proof" className="px-6 py-[clamp(78px,10vh,120px)]">
      <div className="max-w-[1160px] mx-auto">
        <div className="max-w-[760px]">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--accent-strong)]">
            {trackRecord.eyebrow}
          </span>
          <h2 className="mt-[14px] text-[clamp(30px,3.6vw,44px)] font-black tracking-[-1.1px] leading-[1.1] text-[var(--ink-900)]">
            {trackRecord.headline}
          </h2>
          <p className="mt-[18px] text-[17px] leading-[1.75] text-[var(--ink-500)]">
            {trackRecord.lead}
          </p>
        </div>

        <div className="mt-10 rounded-[20px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_20px_44px_rgba(0,80,50,0.08)] overflow-hidden">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
            {trackRecord.figures.map((figure) => (
              <div
                key={figure.label}
                className="px-[26px] py-6 border-r-[1.5px] border-[var(--border-faint)] last:border-r-0"
              >
                <p
                  className={
                    "font-mono text-[30px] font-semibold tracking-[-1px] " +
                    ("accent" in figure && figure.accent
                      ? "text-[var(--accent-strong)]"
                      : "text-[var(--ink-900)]")
                  }
                >
                  {figure.value}
                </p>
                <p className="mt-[6px] text-[13px] text-[var(--ink-500)]">{figure.label}</p>
              </div>
            ))}
          </div>
          <p className="px-[26px] py-3 bg-[var(--surface-1)] border-t-[1.5px] border-[var(--border-faint)] font-mono text-[11px] tracking-[0.6px] text-[var(--ink-300)]">
            {trackRecord.disclaimer}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6 items-stretch to-860:grid-cols-1">
          {trackRecord.featured.map((item) => (
            <figure
              key={item.source}
              className="sx-card m-0 flex flex-col p-8 rounded-[18px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.07)]"
            >
              <span className="flex gap-[2px] text-[#F97316]" aria-label="5 stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon key={i} size={15} />
                ))}
              </span>
              <blockquote
                className={
                  item.large
                    ? "mt-[18px] mb-0 flex-1 font-heading text-[22px] font-bold leading-[1.4] tracking-[-0.3px] text-[var(--ink-900)]"
                    : "mt-[18px] mb-0 flex-1 text-[16.5px] leading-[1.75] text-[var(--ink-700)]"
                }
              >
                {item.quote}
              </blockquote>
              <figcaption className="mt-[22px] pt-4 border-t-[1.5px] border-[var(--border-faint)] text-[13px] italic leading-[1.6] text-[var(--ink-500)]">
                {item.source}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-5 mt-8">
          <p className="max-w-[640px] text-[17px] leading-[1.7] text-[var(--ink-700)]">
            {trackRecord.closingLead}
            <strong className="text-[var(--ink-900)]">{trackRecord.closingBold}</strong>
          </p>
          <Button arrow href="#packages">
            {trackRecord.closingCta}
          </Button>
        </div>
      </div>
    </section>
  );
}
