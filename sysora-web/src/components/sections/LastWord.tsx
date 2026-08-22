import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { routes } from "@/config/site";
import { lastWord } from "@/content/landing/closing";

const hrefs = [routes.systemsReview, routes.buildRequest, routes.systemsTeam];

export function LastWord() {
  return (
    <section className="relative overflow-hidden px-6 py-[clamp(104px,13vh,152px)] bg-[linear-gradient(165deg,#153826,#194430)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-auto -right-[10%] -bottom-[60%] -left-[10%] h-[600px] bg-[radial-gradient(ellipse_50%_100%_at_50%_100%,rgba(0,200,150,0.22),transparent_68%)]"
      />
      <div className="relative max-w-[860px] mx-auto text-center flex flex-col items-center gap-[22px]">
        <Eyebrow>{lastWord.eyebrow}</Eyebrow>
        <h2 className="m-0 text-[clamp(34px,4.4vw,54px)] font-extrabold leading-[1.2] tracking-[-0.8px] text-white">
          {lastWord.headline}
        </h2>
        <p className="m-0 max-w-[680px] text-[17px] leading-[1.75] text-[var(--text-on-dark-muted)]">
          {lastWord.body}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {lastWord.ctas.map((cta, i) => (
            <Button key={cta.label} size="lg" variant={cta.variant} arrow={cta.arrow} href={hrefs[i]}>
              {cta.label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
