import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { routes } from "@/config/site";
import { finalCta } from "@/content/landing/sales";

export function FinalCta() {
  return (
    <section
      id="final"
      className="relative overflow-hidden px-6 py-[clamp(88px,12vh,140px)] text-center text-white bg-[linear-gradient(160deg,#14503C,#1A6349)]"
    >
      <div
        aria-hidden="true"
        className="sx-glow pointer-events-none absolute -top-[220px] left-1/2 -ml-[380px] w-[760px] h-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(0,200,150,0.26),rgba(0,200,150,0))]"
      />
      <div className="relative max-w-[820px] mx-auto">
        <h2 className="text-[clamp(34px,4.6vw,58px)] font-black tracking-[-1.5px] leading-[1.06] text-white">
          {finalCta.headline}
        </h2>
        <p className="mt-[22px] mx-auto max-w-[620px] text-[18px] leading-[1.7] text-white/[0.84]">
          {finalCta.lead}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-[34px]">
          <Button size="lg" arrow href="#packages">
            {finalCta.primaryCta}
          </Button>
          <Button size="lg" variant="outlineWhite" href={routes.requestEstimate}>
            {finalCta.secondaryCta}
          </Button>
        </div>
        <p className="mt-6 text-[14px] text-white/[0.72]">{finalCta.note}</p>
        <p className="mt-[14px] text-[14px] text-white/[0.72]">
          More on what we build at{" "}
          <Link href={routes.services} className="font-semibold text-[var(--accent)]">
            Services
          </Link>
          , and more on the team at{" "}
          <Link href={routes.about} className="font-semibold text-[var(--accent)]">
            About Sysora
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
