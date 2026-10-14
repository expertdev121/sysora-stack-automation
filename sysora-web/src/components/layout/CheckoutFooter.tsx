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
  );
}
