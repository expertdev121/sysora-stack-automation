import type { Metadata } from "next";
import Link from "next/link";

import { HoursCheckout } from "@/components/sales/HoursCheckout";
import { packs, DEFAULT_PACK, footer } from "@/content/landing/sales";

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

      <footer className="border-t-[1.5px] border-[var(--border-faint)] bg-[var(--surface-0)]">
        <div className="max-w-[1160px] mx-auto px-6 py-[22px] flex flex-wrap justify-between gap-3 text-[13px] text-[var(--ink-500)]">
          <span>{footer.copyright}</span>
          <span className="flex gap-5">
            <Link href="/#refund" className="text-[var(--ink-500)]">
              Refund policy
            </Link>
            <Link href="/contact" className="text-[var(--ink-500)]">
              Contact
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
