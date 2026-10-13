import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { routes } from "@/config/site";
import { lastWord } from "@/content/landing/closing";

export function LastWord() {
  return (
    <section
      id="close"
      className="px-6 py-[clamp(78px,10vh,126px)] bg-[var(--surface-1)] border-t-[1.5px] border-[var(--border-faint)]"
    >
      <div className="max-w-[880px] mx-auto text-center">
        <Eyebrow className="text-[var(--mint-700)]">{lastWord.eyebrow}</Eyebrow>
        <h2 className="text-[clamp(30px,3.8vw,48px)] font-black leading-[1.1] tracking-[-1px] text-[var(--ink-900)]">
          {lastWord.headline}
        </h2>
        <p className="mt-[22px] mb-0 mx-auto max-w-[720px] text-[17.5px] leading-[1.8] text-[var(--ink-500)]">
          {lastWord.body}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-[34px]">
          <Button size="lg" arrow href={routes.systemsReview}>
            {lastWord.primaryCta}
          </Button>
          <Button size="lg" variant="ghost" href={routes.buildRequest}>
            {lastWord.secondaryCta}
          </Button>
        </div>
      </div>
    </section>
  );
}
