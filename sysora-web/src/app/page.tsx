import type { Metadata } from "next";

import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { HomeStructuredData } from "@/components/seo/StructuredData";
import { AgencyBanner } from "@/components/sales/AgencyBanner";
import { Audiences } from "@/components/sales/Audiences";
import { BookCall } from "@/components/sales/BookCall";
import { Calculator } from "@/components/sales/Calculator";
import { Costs } from "@/components/sales/Costs";
import { FinalCta } from "@/components/sales/FinalCta";
import { HowItRuns } from "@/components/sales/HowItRuns";
import { MoreReviews } from "@/components/sales/MoreReviews";
import { Packages } from "@/components/sales/Packages";
import { PortalPromise } from "@/components/sales/PortalPromise";
import { RefundGuarantee } from "@/components/sales/RefundGuarantee";
import { Reviews } from "@/components/sales/Reviews";
import { Safeguards } from "@/components/sales/Safeguards";
import { SalesFaq } from "@/components/sales/SalesFaq";
import { SalesFooter } from "@/components/sales/SalesFooter";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { SalesHero } from "@/components/sales/SalesHero";
import { SalesProvider } from "@/components/sales/SalesProvider";
import { Support } from "@/components/sales/Support";
import { TrackRecord } from "@/components/sales/TrackRecord";
import { WhoBuilt } from "@/components/sales/WhoBuilt";
import { Work } from "@/components/sales/Work";
import { meta } from "@/content/landing/sales";

export const metadata: Metadata = {
  // `absolute` because the root layout's "%s — Sysora Stack" template was
  // not being applied to this segment, so the brand was missing from the
  // one title that matters most. Stating it outright is deterministic.
  title: { absolute: `${meta.title} | Sysora Stack` },
  description: meta.description,
  alternates: { canonical: "/" },
  // Was inherited from the root layout, which still sold the retired $49
  // review — so every share, Slack unfurl and LinkedIn preview advertised
  // an offer that no longer exists.
  openGraph: {
    title: `${meta.title} | Sysora Stack`,
    description: meta.description,
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${meta.title} | Sysora Stack`,
    description: meta.description,
  },
};

export default function Home() {
  return (
    <SalesProvider>
      <div
        id="page"
        className="font-sans text-[var(--ink-600)] bg-[var(--surface-0)] overflow-x-clip"
      >
        <ScrollReveal rootId="page" />
        <HomeStructuredData />
        <AgencyBanner />
        <SalesHeader />

        <SalesHero />
        <Reviews />
        <Packages />
        <Safeguards />
        <TrackRecord />
        <Work />
        <Audiences />
        <Support />
        <HowItRuns />
        <PortalPromise />
        <MoreReviews />
        <WhoBuilt />
        <RefundGuarantee />
        <Costs />
        <Calculator />
        <SalesFaq />
        <FinalCta />
        <BookCall />

        <SalesFooter />
      </div>
    </SalesProvider>
  );
}
