import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PageShell } from "@/components/layout/PageShell";
import { SurveyForm } from "@/components/survey/SurveyForm";
import { Button } from "@/components/ui/Button";
import { ConfigNotice } from "@/components/ui/ConfigNotice";
import { submitPostPaymentSurvey, type TrackingContext } from "@/lib/sales/actions";
import type { AnswerMap } from "@/lib/sales/answers";
import { formatMoney } from "@/lib/money";
import { reconcilePayment } from "@/lib/sales/payments";
import { getPublicSettings, getRequestByReference, getSurveyForOffer } from "@/lib/sales/queries";
import { isDatabaseConfigured } from "@/lib/supabase/admin";
import { routes } from "@/config/site";

export const metadata: Metadata = {
  title: "Payment received",
  robots: { index: false, follow: false },
};

/**
 * Straight after payment: the longer intake survey. This is the stage the
 * answers actually matter for, and the reader is already committed.
 */
export default async function CheckoutCompletePage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ payment_intent?: string }>;
}) {
  const { reference } = await params;
  const { payment_intent: intentId } = await searchParams;

  if (!isDatabaseConfigured()) {
    return (
      <PageShell eyebrow="Setup needed" title="Almost there.">
        <ConfigNotice missing="SUPABASE_SERVICE_ROLE_KEY" />
      </PageShell>
    );
  }

  // Stripe redirects (3DS, wallets) come back with the intent id in the URL.
  // Either way, check with Stripe before deciding this isn't paid — the
  // webhook may not have landed yet, and locally it may never land at all.
  await reconcilePayment(reference, intentId);

  const request = await getRequestByReference(reference);
  if (!request) notFound();

  // Not paid yet — send them back to finish.
  const paid = Boolean(request.paid_at) || request.status === "paid" || request.status === "in_review";
  if (!paid && request.offer.requires_payment) {
    redirect(`/checkout/${reference}`);
  }

  // Already filled in the intake — show the status page instead.
  if (request.post_response_id) {
    redirect(`/request/${reference}`);
  }

  const [survey, settings] = await Promise.all([
    getSurveyForOffer(request.offer_id, "post_payment"),
    getPublicSettings(),
  ]);

  const calendarUrl = typeof settings.calendar_url === "string" ? settings.calendar_url : "";

  async function action(answers: AnswerMap, context: TrackingContext) {
    "use server";
    return submitPostPaymentSurvey({ reference, answers, context });
  }

  return (
    <PageShell
      eyebrow={`Payment received · ${request.reference}`}
      title={survey?.title ?? "Thanks, you're in."}
      lead={
        survey?.intro ??
        `We've received ${formatMoney(request.amount, request.currency)} for ${request.offer.name}.`
      }
    >
      <div className="mb-8 px-6 py-5 rounded-[14px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
        <p className="m-0 text-[15px] leading-[1.75] text-[var(--ink-600)]">
          A receipt is on its way to{" "}
          <span className="font-semibold text-[var(--ink-800)]">{request.customer.email}</span>.
          Keep your reference{" "}
          <span className="font-mono font-semibold text-[var(--ink-800)]">{request.reference}</span>{" "}
          for any follow-up.
        </p>
      </div>

      {survey ? (
        <SurveyForm survey={survey} action={action} />
      ) : (
        <div className="flex flex-col gap-6">
          <p className="m-0 text-[17px] leading-[1.75] text-[var(--ink-500)]">
            That&apos;s everything we need for now. We&apos;ll be in touch shortly.
          </p>
          <div className="flex flex-wrap gap-3">
            {calendarUrl && (
              <Button size="lg" arrow href={calendarUrl}>
                Book your walkthrough
              </Button>
            )}
            <Button size="lg" variant="ghost" href={routes.home}>
              Back to home
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
