import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyCtaBar } from "@/components/layout/StickyCtaBar";
import { CommandCenter } from "@/components/sections/CommandCenter";
import { Faq } from "@/components/sections/Faq";
import { FounderNote } from "@/components/sections/FounderNote";
import { Hero } from "@/components/sections/Hero";
import { LastWord } from "@/components/sections/LastWord";
import { MathSection } from "@/components/sections/Math";
import { Offers } from "@/components/sections/Offers";
import { Outcomes } from "@/components/sections/Outcomes";
import { Problem } from "@/components/sections/Problem";
import { Process } from "@/components/sections/Process";
import { Proof } from "@/components/sections/Proof";
import { Services } from "@/components/sections/Services";
import { Shift } from "@/components/sections/Shift";
import { Urgency } from "@/components/sections/Urgency";
import { WhyUs } from "@/components/sections/WhyUs";

export default function Home() {
  return (
    <div
      id="page"
      className="font-sans text-[var(--text-body)] bg-[var(--surface-0)] overflow-x-hidden"
    >
      <ScrollReveal rootId="page" />
      <SiteHeader />

      <Hero />
      <CommandCenter />
      <Problem />
      <Shift />
      <Outcomes />
      <Process />
      <Services />
      <Proof />
      <FounderNote />
      <WhyUs />
      <Offers />
      <MathSection />
      <Urgency />
      <Faq />
      <LastWord />

      <StickyCtaBar />
      <SiteFooter />
    </div>
  );
}
