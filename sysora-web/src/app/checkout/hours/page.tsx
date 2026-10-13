import type { Metadata } from "next";

import { HoursCheckout } from "@/components/sales/HoursCheckout";
import { SalesFooter } from "@/components/sales/SalesFooter";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { packs, DEFAULT_PACK } from "@/content/landing/sales";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

/**
 * Entry point for a pack bought from the landing page. Takes ?hours= and
 * ?billing= from the package tiles, confirms the choice, collects the
 * account details, then hands off to /checkout/[reference] for payment.
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
    <div className="font-sans bg-[linear-gradient(180deg,var(--surface-0)_0,var(--surface-1)_420px)] text-[var(--ink-600)]">
      <SalesHeader anchorBase="/" />
      <main className="px-6 pt-[clamp(36px,6vh,64px)] pb-[88px]">
        <HoursCheckout initialHours={hours} initialBilling={billing} />
      </main>
      <SalesFooter anchorBase="/" />
    </div>
  );
}
