import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { routes } from "@/config/site";
import { services } from "@/content/landing/services";

export function Services() {
  return (
    <section id="services" className="px-6 py-[clamp(78px,10vh,126px)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[760px]">
          <Eyebrow className="text-[var(--mint-700)]">{services.eyebrow}</Eyebrow>
          <h2 className="text-[clamp(30px,3.6vw,46px)] font-black leading-[1.1] tracking-[-1px] text-[var(--ink-900)]">
            {services.headline}
          </h2>
          <p className="mt-[18px] mb-0 text-[17px] leading-[1.75] text-[var(--ink-500)]">
            {services.lead}
          </p>
        </div>

        <div className="mt-11 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_3px_8px_rgba(0,80,50,0.05),0_22px_48px_rgba(0,80,50,0.09)] overflow-hidden">
          {services.rows.map((row) => (
            <div
              key={row.title}
              className="sx-row grid grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] gap-[clamp(16px,3vw,40px)] px-[clamp(24px,3vw,34px)] py-[26px] border-b-[1.5px] border-[var(--border-faint)] items-baseline to-860:grid-cols-1 to-860:gap-3"
            >
              <div className="flex items-baseline justify-between gap-[18px]">
                <h3 className="text-[19px] font-bold leading-[1.3] text-[var(--ink-900)]">
                  {row.title}
                </h3>
                <span className="font-mono text-[20px] font-semibold tracking-[-0.6px] whitespace-nowrap text-[var(--accent-strong)]">
                  {row.price}
                </span>
              </div>
              <p className="m-0 text-[15.5px] leading-[1.75] text-[var(--ink-500)]">{row.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-5 mt-[22px] px-[30px] py-[26px] rounded-[18px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
          <p className="m-0 flex-1 min-w-[280px] text-[15.5px] leading-[1.75] text-[var(--ink-700)]">
            {services.note}
          </p>
          <Button arrow href={routes.services}>
            {services.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
