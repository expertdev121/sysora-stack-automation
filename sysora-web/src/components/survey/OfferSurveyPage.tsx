import { notFound } from "next/navigation";

import { ConfigNotice } from "@/components/ui/ConfigNotice";
import { PageShell } from "@/components/layout/PageShell";
import { SurveyForm } from "@/components/survey/SurveyForm";
import { submitIntakeSurvey, type TrackingContext } from "@/lib/sales/actions";
import type { AnswerMap } from "@/lib/sales/answers";
import { getOffer, getSurveyForOffer } from "@/lib/sales/queries";
import { formatMoney } from "@/lib/money";
import { isDatabaseConfigured } from "@/lib/supabase/admin";
import type { SurveyKind } from "@/lib/sales/types";

/**
 * The intake step for an offer: renders whatever questions the database
 * holds for it, then routes on to checkout (paid) or a thank-you page (free).
 */
export async function OfferSurveyPage({
  offerSlug,
  kind,
}: {
  offerSlug: string;
  kind: Extract<SurveyKind, "pre_checkout" | "build_request">;
}) {
  if (!isDatabaseConfigured()) {
    return (
      <PageShell eyebrow="Setup needed" title="Almost there.">
        <ConfigNotice missing="SUPABASE_SERVICE_ROLE_KEY" />
      </PageShell>
    );
  }

  const offer = await getOffer(offerSlug);
  if (!offer) notFound();

  const survey = await getSurveyForOffer(offer.id, kind);

  const priceLabel = offer.requires_payment
    ? `${formatMoney(offer.price_amount, offer.currency)}${
        offer.billing_interval === "month" ? "/month" : ""
      }`
    : "Free";

  async function action(answers: AnswerMap, context: TrackingContext) {
    "use server";
    return submitIntakeSurvey({ offerSlug, kind, answers, context });
  }

  return (
    <PageShell
      eyebrow={`${priceLabel}${offer.price_note ? ` · ${offer.price_note}` : ""}`}
      title={survey?.title ?? offer.name}
      lead={survey?.intro ?? offer.tagline ?? undefined}
    >
      {survey ? (
        <SurveyForm survey={survey} action={action} />
      ) : (
        <p className="m-0 text-[17px] leading-[1.75] text-[var(--ink-500)]">
          This form isn&apos;t set up yet. Add a{" "}
          <code className="font-mono text-[15px]">{kind}</code> survey for{" "}
          <code className="font-mono text-[15px]">{offer.slug}</code> in the dashboard.
        </p>
      )}
    </PageShell>
  );
}
