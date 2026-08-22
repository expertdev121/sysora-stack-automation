"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Appearance, type Stripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import type { PaymentSession } from "@/lib/sales/payments";

/**
 * The payment step, embedded in our own page. Stripe's Payment Element
 * renders inside an iframe it controls, so card details go straight to
 * Stripe — they never reach our JavaScript, our server, or our database.
 */

const appearance: Appearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#00C896",
    colorBackground: "#ffffff",
    colorText: "#1A1A2E",
    colorDanger: "#DC2626",
    fontFamily: "Geist, system-ui, sans-serif",
    borderRadius: "10px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1.5px solid #D4EDD9", boxShadow: "none", padding: "11px 14px" },
    ".Input:focus": { border: "1.5px solid #00C896", boxShadow: "0 0 0 3px rgba(0,200,150,0.25)" },
    ".Label": { fontSize: "13px", fontWeight: "600", color: "#1A1A2E" },
  },
};

let stripePromise: Promise<Stripe | null> | null = null;
function getStripe(publishableKey: string) {
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
}

export function PaymentPanel({
  session,
  reference,
  completeSimulated,
}: {
  session: PaymentSession;
  reference: string;
  completeSimulated: () => Promise<{ ok: boolean; error?: string }>;
}) {
  if (session.mode === "unavailable") {
    return (
      <div className="px-5 py-4 rounded-[12px] bg-[var(--warning-bg)] border-[1.5px] border-[var(--warning-border)]">
        <p className="m-0 text-[15px] leading-[1.65] text-[var(--warning)]">{session.reason}</p>
      </div>
    );
  }

  if (session.mode === "simulated") {
    return <SimulatedPayment reference={reference} completeSimulated={completeSimulated} />;
  }

  return <StripePayment session={session} reference={reference} />;
}

function StripePayment({
  session,
  reference,
}: {
  session: Extract<PaymentSession, { mode: "stripe" }>;
  reference: string;
}) {
  const stripe = useMemo(() => getStripe(session.publishableKey), [session.publishableKey]);

  return (
    <Elements stripe={stripe} options={{ clientSecret: session.clientSecret, appearance }}>
      <StripeForm reference={reference} />
    </Elements>
  );
}

function StripeForm({ reference }: { reference: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setBusy(true);
    setError(null);

    const returnUrl = `${window.location.origin}/checkout/${reference}/complete`;

    // redirect: "if_required" keeps the customer on this page for cards;
    // methods that genuinely need a redirect (3DS, wallets) still work.
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "That payment didn't go through.");
      setBusy(false);
      return;
    }

    if (paymentIntent?.status === "succeeded" || paymentIntent?.status === "processing") {
      router.push(`/checkout/${reference}/complete`);
      return;
    }

    setError("That payment didn't complete. Please try again.");
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <PaymentElement options={{ layout: "tabs" }} />

      {error && (
        <p
          role="alert"
          className="m-0 px-4 py-3 rounded-[10px] bg-[var(--danger-bg)] border-[1.5px] border-[var(--danger-border)] text-[14px] text-[var(--danger-600)]"
        >
          {error}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth arrow disabled={!stripe || busy}>
        {busy ? "Processing…" : "Pay and continue"}
      </Button>
    </form>
  );
}

function SimulatedPayment({
  reference,
  completeSimulated,
}: {
  reference: string;
  completeSimulated: () => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="px-5 py-4 rounded-[12px] bg-[var(--info-bg)] border-[1.5px] border-[var(--info-border)]">
        <p className="m-0 text-[14px] font-semibold text-[var(--info)]">Simulation mode</p>
        <p className="mt-1 mb-0 text-[14px] leading-[1.65] text-[var(--ink-600)]">
          Stripe keys aren&apos;t configured, so no card form is shown and nothing is charged.
          Continue to walk through the rest of the flow. Add{" "}
          <code className="font-mono text-[13px]">STRIPE_SECRET_KEY</code> and{" "}
          <code className="font-mono text-[13px]">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to
          <code className="font-mono text-[13px]"> .env.local</code> for the real thing.
        </p>
      </div>

      {error && (
        <p role="alert" className="m-0 text-[14px] text-[var(--danger-600)]">
          {error}
        </p>
      )}

      <Button
        size="lg"
        fullWidth
        arrow
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await completeSimulated();
            if (result.ok) router.push(`/checkout/${reference}/complete`);
            else setError(result.error ?? "Could not complete the simulated payment.");
          })
        }
      >
        {pending ? "Processing…" : "Simulate a successful payment"}
      </Button>
    </div>
  );
}
