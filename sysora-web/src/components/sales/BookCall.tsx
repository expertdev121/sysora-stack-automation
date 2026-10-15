import Link from "next/link";

import { bookCall } from "@/content/landing/sales";

/**
 * The "book a call" band, between the final CTA and the footer.
 *
 * The page closes by asking the reader to pick a pack size. This is for
 * the reader who has got that far and still cannot — one card, one way
 * out, and no second pitch.
 */
export function BookCall() {
  return (
    <section className="px-6 py-[88px] to-860:py-[64px]">
      <div className="mx-auto max-w-[1160px]">
        <div className="flex items-center justify-between gap-6 rounded-[22px] border-[1.5px] border-[var(--border-default)] bg-[linear-gradient(135deg,#F0FAF6,#FFFFFF)] p-11 to-860:flex-col to-860:items-start to-860:p-7">
          <div className="max-w-[620px]">
            <p className="mb-[10px] text-[11px] font-bold uppercase tracking-[2px] text-[var(--accent-strong)]">
              {bookCall.eyebrow}
            </p>
            <h2 className="font-display text-[clamp(26px,3.2vw,36px)] font-black leading-[1.15] tracking-[-1px] text-[var(--ink-900)]">
              {bookCall.title}
            </h2>
            <p className="mt-3 text-[16px] leading-[1.7] text-[var(--ink-500)]">
              {bookCall.body}
            </p>
          </div>

          <Link
            href={bookCall.href}
            className="inline-flex flex-none items-center gap-2 rounded-[12px] bg-[var(--accent)] px-6 py-3 text-[15px] font-bold text-white transition-colors duration-150 hover:bg-[var(--accent-hover)]"
          >
            {bookCall.cta}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
