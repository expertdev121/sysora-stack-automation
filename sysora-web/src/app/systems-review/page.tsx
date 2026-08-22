import type { Metadata } from "next";

import { OfferSurveyPage } from "@/components/survey/OfferSurveyPage";

// Questions are edited in the dashboard, so these pages are never baked.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Business Systems Review",
  description:
    "A $49 one-time diagnostic: the single area where automation, AI, or better design pays off most in your business.",
};

export default function SystemsReviewPage() {
  return <OfferSurveyPage offerSlug="systems-review" kind="pre_checkout" />;
}
