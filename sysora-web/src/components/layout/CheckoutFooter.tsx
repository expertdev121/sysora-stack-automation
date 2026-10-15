import Link from "next/link";

import { footer } from "@/content/landing/sales";

/**
 * The payment pages get this instead of the full site footer. A checkout
 * offering a dozen ways to wander off is a worse checkout, so these keep
 * only what someone mid-payment might actually need.
 */
export function CheckoutFooter() {
  return (
    <footer className="border-t-[1.5px] border-[var(--border-faint)] bg-[var(--surface-0)]">
      <div className="max-w-[1160px] mx-auto px-6 py-[22px] flex flex-wrap justify-between gap-3 text-[13px] text-[var(--ink-500)]">
        <span>{footer.copyright}</span>
        {/* Terms and privacy belong on a page asking for card details,
            even though everything else is stripped out. */}
        <span className="flex flex-wrap gap-5">
          <Link href="/terms" className="text-[var(--ink-500)]">
            Terms and conditions
          </Link>
          <Link href="/privacy-policy" className="text-[var(--ink-500)]">
            Privacy policy
          </Link>
          <Link href="/terms#s-7" className="text-[var(--ink-500)]">
            Refund policy
          </Link>
          <Link href="/contact" className="text-[var(--ink-500)]">
            Contact
          </Link>
        </span>
      </div>
    </footer>
  );
}
