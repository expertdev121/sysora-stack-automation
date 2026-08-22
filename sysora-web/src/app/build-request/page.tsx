import type { Metadata } from "next";

import { OfferSurveyPage } from "@/components/survey/OfferSurveyPage";

// Questions are edited in the dashboard, so these pages are never baked.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Submit a Build Request",
  description:
    "Free to submit, scoped per project. Tell us the project and the problem behind it, and we'll come back with scope, timeline, and investment.",
};

export default function BuildRequestPage() {
  return <OfferSurveyPage offerSlug="build-request" kind="build_request" />;
}
