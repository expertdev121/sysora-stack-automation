import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { routes } from "@/config/site";
import { urgency } from "@/content/landing/closing";

export function Urgency() {
  return (
    <section
      id="urgency"
      className="relative overflow-hidden px-6 py-[clamp(78px,10vh,126px)] text-white bg-[linear-gradient(160deg,#14503C_0%,#1A6349_100%)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_28%_0%,rgba(0,200,150,0.20),transparent_68%)]"
      />
      <div className="relative max-w-[900px] mx-auto">
        <Eyebrow className="text-[var(--accent)]">{urgency.eyebrow}</Eyebrow>
        <h2 className="text-[clamp(30px,3.8vw,48px)] font-black leading-[1.1] tracking-[-1px] text-white">
          {urgency.headline}
        </h2>
        <p className="mt-[22px] mb-0 text-[17.5px] leading-[1.8] text-white/70">{urgency.body}</p>
        <p className="mt-[18px] mb-0 text-[19px] font-bold leading-[1.6] text-white">
          {urgency.kicker}
        </p>
        <div className="mt-8">
          <Button size="lg" variant="white" arrow href={routes.systemsReview}>
            {urgency.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
