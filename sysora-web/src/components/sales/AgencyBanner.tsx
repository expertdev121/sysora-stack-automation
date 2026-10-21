import Link from "next/link";

import { agencyBanner } from "@/content/landing/sales";

/**
 * The announcement bar, above the header.
 *
 * One line, 40px, light. It sits above a sticky header, so it scrolls
 * away and gives the page back its full height once the reader is
 * past it.
 *
 * The long sentence is hidden under 860px rather than allowed to wrap,
 * because a three-line announcement bar is not a bar. The short
 * question and the link carry it on a phone.
 *
 * The whole strip is the link, so the target is the bar rather than
 * two words of it. The call to action is a span: a link inside a link
 * is not valid markup.
 */
export function AgencyBanner() {
  return (
    <div className="border-b-[1.5px] border-[var(--border-faint)] bg-[#F0FAF6]">
      <Link
        href={agencyBanner.href}
        className="group mx-auto flex h-10 max-w-[1160px] items-center justify-center gap-[10px] px-6 text-[13px] leading-none"
      >
        <span className="flex-none rounded-full bg-white px-[9px] py-[3px] text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-strong)] ring-[1.5px] ring-[var(--border-default)]">
          {agencyBanner.badge}
        </span>

        <span className="font-semibold text-[var(--ink-900)]">{agencyBanner.short}</span>

        <span className="truncate text-[var(--ink-500)] to-860:hidden">{agencyBanner.body}</span>

        <span className="flex-none items-center gap-1 font-semibold text-[var(--accent-strong)] group-hover:underline underline-offset-[3px] inline-flex">
          {agencyBanner.cta}
          <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-[2px]">
            →
          </span>
        </span>
      </Link>
    </div>
  );
}
