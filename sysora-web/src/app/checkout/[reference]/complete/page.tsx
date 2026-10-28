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
import { paid as paidCopy } from "@/content/landing/sales";
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
          {paidCopy.noticeLead}{" "}
          <span className="font-semibold text-[var(--ink-800)]">{request.customer.email}</span>.{" "}
          {paidCopy.noticePassword} {paidCopy.noticeReference}{" "}
          <span className="font-mono font-semibold text-[var(--ink-800)]">{request.reference}</span>{" "}
          {paidCopy.noticeReferenceTail}
        </p>
      </div>

      {survey ? (
        <SurveyForm survey={survey} action={action} />
      ) : (
        <div className="flex flex-col gap-7">
          <h2 className="m-0 text-[20px] font-bold text-[var(--ink-900)]">
            {paidCopy.stepsTitle}
          </h2>

          <ol className="m-0 flex list-none flex-col gap-4 p-0">
            {paidCopy.steps.map((step) => (
              <li
                key={step.n}
                className="flex gap-4 rounded-[14px] border-[1.5px] border-[var(--border-faint)] bg-[var(--surface-0)] px-5 py-[18px]"
              >
                <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-[var(--mint-50)] text-[14px] font-bold text-[var(--accent-strong)]">
                  {step.n}
                </span>
                <span>
                  <span className="block text-[16px] font-bold text-[var(--ink-900)]">
                    {step.title}
                  </span>
                  <span className="mt-[6px] block text-[15px] leading-[1.7] text-[var(--ink-600)]">
                    {step.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" arrow href="/portal/login">
              {paidCopy.loginCta}
            </Button>
            {/* The booking page carries the real calendar. calendarUrl is
                kept as an override for when a setting points elsewhere. */}
            <Button size="lg" variant="ghost" href={calendarUrl || "/book-a-call"}>
              {paidCopy.callCta}
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
