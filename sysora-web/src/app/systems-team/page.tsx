import type { Metadata } from "next";

import { OfferSurveyPage } from "@/components/survey/OfferSurveyPage";

// Questions are edited in the dashboard, so these pages are never baked.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "On-Demand Systems Team",
  description:
    "From $2,000/month. Monitoring, maintenance, CRM and workflow improvements, integration support, and a monthly systems review.",
};

export default function SystemsTeamPage() {
  return <OfferSurveyPage offerSlug="systems-team" kind="pre_checkout" />;
}
