import type { Metadata } from "next";

import { CheckoutFooter } from "@/components/layout/CheckoutFooter";
import { HoursCheckout } from "@/components/sales/HoursCheckout";
import { packs, DEFAULT_PACK } from "@/content/landing/sales";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

/**
 * Entry point for a pack bought from the landing page. Takes ?hours= and
 * ?billing= from the package tiles, confirms the choice, collects the
 * account details, then hands off to /checkout/[reference] for payment.
 *
 * No site nav: a checkout that offers six ways to leave is a worse
 * checkout, and the design drops it for the same reason.
 */
export default async function HoursCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ hours?: string; billing?: string }>;
}) {
  const params = await searchParams;

  const requested = Number.parseInt(params.hours ?? "", 10);
  const hours = packs.some((p) => p.hours === requested)
    ? requested
    : packs[DEFAULT_PACK].hours;

  const billing = params.billing === "monthly" ? "monthly" : "once";

  return (
    <div className="font-sans min-h-screen flex flex-col bg-[linear-gradient(180deg,var(--surface-0)_0,var(--surface-1)_420px)] text-[var(--ink-600)]">
      <main className="flex-1 px-6 pt-[clamp(28px,4vh,48px)] pb-[72px]">
        <HoursCheckout initialHours={hours} initialBilling={billing} />
      </main>

      <CheckoutFooter />
    </div>
  );
}
