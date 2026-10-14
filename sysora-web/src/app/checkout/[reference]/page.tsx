import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PaymentPanel } from "@/components/checkout/PaymentPanel";
import { CheckoutFooter } from "@/components/layout/CheckoutFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ConfigNotice } from "@/components/ui/ConfigNotice";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { formatMoney } from "@/lib/money";
import { completeSimulatedPayment, startPayment } from "@/lib/sales/payments";
import { getPublicSettings, getRequestByReference } from "@/lib/sales/queries";
import { isDatabaseConfigured } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;

  if (!isDatabaseConfigured()) {
    return (
      <CheckoutShell>
        <ConfigNotice missing="SUPABASE_SERVICE_ROLE_KEY" />
      </CheckoutShell>
    );
  }

  const request = await getRequestByReference(reference);
  if (!request) notFound();

  // Already paid — nothing to do here.
  if (request.status === "paid" || request.status === "in_review" || request.paid_at) {
    redirect(`/checkout/${reference}/complete`);
  }

  const [session, settings] = await Promise.all([startPayment(reference), getPublicSettings()]);

  const checkoutNote = typeof settings.checkout_note === "string" ? settings.checkout_note : null;
  const termsUrl = typeof settings.terms_url === "string" ? settings.terms_url : "";
  const privacyUrl = typeof settings.privacy_url === "string" ? settings.privacy_url : "";

  async function simulate() {
    "use server";
    return completeSimulatedPayment(reference);
  }

  const recurring = request.offer.billing_interval === "month";

  return (
    <CheckoutShell>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] gap-8 items-start to-860:grid-cols-1">
        {/* Payment */}
        <div className="order-1 to-860:order-2 p-8 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_4px_rgba(0,80,50,0.04),0_20px_44px_rgba(0,80,50,0.07)]">
          <h2 className="mt-0 mb-1 text-[22px] font-extrabold tracking-[-0.3px] text-[var(--ink-900)]">
            Payment
          </h2>
          <p className="mt-0 mb-6 text-[14px] text-[var(--ink-300)]">
            {checkoutNote ??
              "Payments are processed securely. We never see or store your card details."}
          </p>

          <PaymentPanel session={session} reference={reference} completeSimulated={simulate} />

          {(termsUrl || privacyUrl) && (
            <p className="mt-5 mb-0 text-[12.5px] leading-[1.65] text-[var(--ink-300)]">
              By paying you agree to our{" "}
              {termsUrl && (
                <a href={termsUrl} className="font-semibold">
                  terms
                </a>
              )}
              {termsUrl && privacyUrl && " and "}
              {privacyUrl && (
                <a href={privacyUrl} className="font-semibold">
                  privacy policy
                </a>
              )}
              .
            </p>
          )}
        </div>

        {/* Summary */}
        <aside className="order-2 to-860:order-1 p-8 rounded-[20px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
          <Eyebrow>Order summary</Eyebrow>

          <p className="mt-0 mb-1 text-[20px] font-extrabold tracking-[-0.3px] text-[var(--ink-900)]">
            {request.offer.name}
          </p>
          {request.offer.tagline && (
            <p className="mt-0 mb-5 text-[14px] leading-[1.65] text-[var(--ink-500)]">
              {request.offer.tagline}
            </p>
          )}

          <div className="flex items-baseline gap-2 pb-5 mb-5 border-b-[1.5px] border-[var(--border-default)]">
            <span className="font-mono text-[34px] font-semibold tracking-[-1px] leading-none text-[var(--accent-strong)]">
              {formatMoney(request.amount, request.currency)}
            </span>
            <span className="text-[13px] text-[var(--ink-300)]">
              {recurring ? "per month" : request.offer.price_note ?? "one time"}
            </span>
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 m-0 text-[13px]">
            <dt className="text-[var(--ink-300)]">Reference</dt>
            <dd className="m-0 font-mono text-[var(--ink-800)]">{request.reference}</dd>
            <dt className="text-[var(--ink-300)]">Email</dt>
            <dd className="m-0 text-[var(--ink-800)] break-all">{request.customer.email}</dd>
          </dl>

          {request.offer.features.length > 0 && (
            <ul className="mt-6 mb-0 p-0 list-none flex flex-col gap-[10px]">
              {request.offer.features.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-[10px] text-[14px] leading-[1.6] text-[var(--ink-600)]"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-none mt-[3px]"
                    aria-hidden="true"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </CheckoutShell>
  );
}

function CheckoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans text-[var(--text-body)] bg-[var(--surface-1)] min-h-screen flex flex-col overflow-x-hidden">
      <SiteHeader />
      <main className="flex-1 px-6 py-[clamp(48px,7vh,88px)]">
        <div className="max-w-[1060px] mx-auto">{children}</div>
      </main>
      <CheckoutFooter />
    </div>
  );
}
