import Link from "next/link";

import { agencyBanner } from "@/content/landing/sales";

/**
 * The strip under the hero, pointing agencies at their own page.
 *
 * Deliberately one row and not a section: it sits between the hero and
 * the reviews, and anything taller would push the first proof point
 * below the fold on a laptop. The whole strip is the link, so the
 * target is the full card rather than four words of it, and the button
 * is a span because a link inside a link is not valid markup.
 */
export function AgencyBanner() {
  return (
    <div className="px-6 pt-2 pb-[clamp(16px,3vh,28px)]">
      <Link
        href={agencyBanner.href}
        className="group mx-auto flex max-w-[1160px] items-center gap-5 rounded-[16px] border-[1.5px] border-[var(--border-default)] bg-[linear-gradient(135deg,#F0FAF6,#FFFFFF)] px-6 py-[18px] transition-colors duration-150 hover:border-[var(--accent)] to-860:flex-col to-860:items-start to-860:gap-4 to-860:px-5"
      >
        <span className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-[7px] rounded-full bg-white px-[10px] py-[4px] text-[10.5px] font-bold uppercase tracking-[1.4px] text-[var(--accent-strong)] ring-[1.5px] ring-[var(--border-default)]">
            <span className="h-[5px] w-[5px] rounded-full bg-[var(--accent)]" aria-hidden="true" />
            {agencyBanner.badge}
          </span>

          <span className="mt-[10px] block text-[17px] font-bold leading-[1.3] tracking-[-0.3px] text-[var(--ink-900)]">
            {agencyBanner.title}
          </span>

          <span className="mt-[5px] block text-[14px] leading-[1.6] text-[var(--ink-500)]">
            {agencyBanner.body}
          </span>
        </span>

        <span className="inline-flex flex-none items-center gap-2 rounded-[11px] bg-[var(--accent)] px-5 py-[11px] text-[14px] font-semibold text-white transition-colors duration-150 group-hover:bg-[var(--accent-hover)]">
          {agencyBanner.cta}
          <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-[2px]">
            →
          </span>
        </span>
      </Link>
    </div>
  );
}
