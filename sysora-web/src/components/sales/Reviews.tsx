import { StarIcon } from "@/components/ui/Icon";
import { reviews } from "@/content/landing/sales";

function Stars({ size = 13 }: { size?: number }) {
  return (
    <span className="flex gap-[2px] text-[#F97316]" aria-label="5 stars">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} size={size} />
      ))}
    </span>
  );
}

/**
 * Three reviews, named by the job they came from. The bracketed words are
 * the only edits, and the paragraph above says so.
 */
export function Reviews() {
  return (
    <section className="px-6 py-[clamp(56px,7vh,80px)] bg-[var(--surface-0)] border-t-[1.5px] border-[var(--border-faint)]">
      <div className="max-w-[1160px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--accent-strong)]">
              {reviews.eyebrow}
            </span>
            <h2 className="mt-3 text-[clamp(28px,3.2vw,38px)] font-black tracking-[-1px] leading-[1.1] text-[var(--ink-900)]">
              {reviews.headline}
            </h2>
          </div>
          <span className="flex items-center gap-[10px] text-[14px] text-[var(--ink-500)]">
            <Stars />
            <strong className="font-mono text-[var(--ink-900)]">5.0</strong> {reviews.rating}
          </span>
        </div>

        <p className="mt-[14px] max-w-[760px] text-[15.5px] leading-[1.7] text-[var(--ink-500)]">
          {reviews.intro}
        </p>

        <div className="grid grid-cols-3 gap-5 mt-8 items-stretch to-860:grid-cols-1">
          {reviews.cards.map((review) => (
            <figure
              key={review.tag + review.job}
              className="sx-card m-0 flex flex-col p-7 rounded-[18px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.08)]"
            >
              <Stars size={14} />
              <blockquote className="mt-4 mb-0 flex-1 text-[15.5px] leading-[1.75] text-[var(--ink-700)]">
                {review.quote}
              </blockquote>
              <figcaption className="flex items-center gap-[10px] mt-5 pt-[14px] border-t-[1.5px] border-[var(--border-faint)]">
                <span className="flex-none w-[34px] h-[30px] rounded-[9px] grid place-items-center bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] font-mono text-[11px] font-semibold text-[var(--accent-strong)]">
                  {review.tag}
                </span>
                <span className="text-[12.5px] leading-[1.5] text-[var(--ink-500)]">
                  {review.job}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-7 max-w-[760px] text-[16.5px] leading-[1.7] text-[var(--ink-700)]">
          {reviews.closingLead}
          <strong className="text-[var(--ink-900)]">{reviews.closingBold}</strong>
        </p>
      </div>
    </section>
  );
}
