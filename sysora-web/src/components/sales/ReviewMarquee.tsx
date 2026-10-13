import { StarIcon } from "@/components/ui/Icon";
import { marquee, marqueeReviews } from "@/content/landing/sales";

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
 * A continuous strip of reviews. The list is rendered twice so the
 * translate loop has something to scroll into; the duplicate is hidden
 * from assistive tech.
 */
export function ReviewMarquee() {
  return (
    <section className="py-[clamp(56px,7vh,80px)] bg-[var(--surface-0)] border-t-[1.5px] border-[var(--border-faint)]">
      <div className="max-w-[1160px] mx-auto px-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--accent-strong)]">
            {marquee.eyebrow}
          </span>
          <h2 className="mt-3 text-[clamp(28px,3.2vw,38px)] font-black tracking-[-1px] leading-[1.1] text-[var(--ink-900)]">
            {marquee.headline}
          </h2>
        </div>
        <span className="flex items-center gap-[10px] text-[14px] text-[var(--ink-500)]">
          <Stars />
          <strong className="font-mono text-[var(--ink-900)]">5.0</strong> {marquee.rating}
        </span>
      </div>

      <div className="sx-marq-mask mt-8 pt-[6px] pb-[14px]">
        <div className="sx-marq">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex gap-5" aria-hidden={copy === 1}>
              {marqueeReviews.map((review) => (
                <figure
                  key={review.quote}
                  className="m-0 flex-none w-[360px] flex flex-col px-[26px] py-6 rounded-[18px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_14px_30px_rgba(0,80,50,0.07)]"
                >
                  <Stars />
                  <blockquote className="mt-[14px] mb-0 flex-1 text-[15px] leading-[1.7] text-[var(--ink-700)]">
                    {review.quote}
                  </blockquote>
                  <figcaption className="flex items-center gap-[10px] mt-[18px] pt-[14px] border-t-[1.5px] border-[var(--border-faint)]">
                    <span className="flex-none w-[30px] h-[30px] rounded-[9px] grid place-items-center bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] font-mono text-[11px] font-semibold text-[var(--accent-strong)]">
                      {review.tag}
                    </span>
                    <span className="text-[12.5px] leading-[1.5] text-[var(--ink-500)]">
                      {review.job}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
