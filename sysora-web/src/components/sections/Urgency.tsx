import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { routes } from "@/config/site";
import { urgency } from "@/content/landing/closing";

export function Urgency() {
  return (
    <section className="px-6 py-[clamp(104px,13vh,152px)]">
      <div className="max-w-[880px] mx-auto text-center flex flex-col items-center gap-[22px]">
        <Eyebrow>{urgency.eyebrow}</Eyebrow>
        <h2 className="m-0 text-[clamp(34px,4.4vw,54px)] font-extrabold leading-[1.2] tracking-[-0.8px] text-[var(--ink-900)]">
          {urgency.headline}
          <span className="text-[var(--accent-strong)]">{urgency.headlineAccent}</span>
        </h2>
        <p className="m-0 max-w-[680px] text-[19px] leading-[1.75] text-[var(--ink-600)]">
          {urgency.body}
        </p>
        <p className="m-0 max-w-[680px] text-[20px] font-bold leading-[1.2] text-[var(--ink-900)]">
          {urgency.kicker}
        </p>
        <div className="mt-2">
          <Button size="lg" arrow href={routes.systemsReview}>
            {urgency.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
