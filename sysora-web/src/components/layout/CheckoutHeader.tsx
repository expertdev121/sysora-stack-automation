import Link from "next/link";

import { SysoraLogo } from "@/components/ui/Logo";

/**
 * Brand bar for the payment pages: the logo, and nothing else.
 *
 * This page used to carry the full site nav, which gave someone holding a
 * card six links away from the one thing they came to do. The logo stays
 * because an unbranded page asking for card details is its own kind of
 * alarming, and it is the same reasoning behind CheckoutFooter.
 */
export function CheckoutHeader() {
  return (
    <header className="border-b-[1.5px] border-[var(--border-faint)] bg-white/90 backdrop-blur-[20px]">
      <div className="mx-auto flex max-w-[1060px] items-center px-6 py-[15px]">
        <Link href="/" className="flex items-center" aria-label="Sysora Stack home">
          <SysoraLogo className="block h-[30px] w-auto" />
        </Link>
      </div>
    </header>
  );
}
