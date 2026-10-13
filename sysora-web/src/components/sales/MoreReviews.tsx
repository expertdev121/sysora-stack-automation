import { moreReviews } from "@/content/landing/sales";

function QuoteMark() {
  return (
    <svg width="30" height="24" viewBox="0 0 30 24" fill="var(--mint-200)" aria-hidden="true">
      <path d="M0 24V14C0 6 4 1.5 12 0l1.5 3C9 4.5 7 7.5 7 11h5v13zm17 0V14c0-8 4-12.5 12-14l1 3c-4.5 1.5-6.5 4.5-6.5 8H29v13z" />
    </svg>
  );
}

export function MoreReviews() {
  const { closing } = moreReviews;

  return (
    <section className="px-6 py-[clamp(78px,10vh,120px)] bg-[var(--surface-1)] border-y-[1.5px] border-[var(--border-faint)]">
      <div className="max-w-[1160px] mx-auto">
        <div className="max-w-[720px]">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--accent-strong)]">
            {moreReviews.eyebrow}
          </span>
          <h2 className="mt-[14px] text-[clamp(30px,3.6vw,44px)] font-black tracking-[-1.1px] leading-[1.1] text-[var(--ink-900)]">
            {moreReviews.headline}
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mt-11 items-stretch">
          {moreReviews.cards.map((card) => (
            <figure
              key={card.source}
              className="sx-card m-0 flex flex-col p-7 rounded-[18px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.07)]"
            >
              <QuoteMark />
              <blockquote className="mt-4 mb-0 flex-1 text-[15.5px] leading-[1.75] text-[var(--ink-700)]">
                {card.quote}
              </blockquote>
              <figcaption className="mt-5 pt-[14px] border-t-[1.5px] border-[var(--border-faint)] text-[12.5px] italic leading-[1.6] text-[var(--ink-500)]">
                {card.source}
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-8 max-w-[760px] text-[16.5px] leading-[1.7] text-[var(--ink-700)]">
          {closing.lead}
          <strong className="font-mono text-[var(--ink-900)]">{closing.first}</strong>
          {closing.middle}
          <strong className="font-mono text-[var(--ink-900)]">{closing.second}</strong>
          {closing.tail}
        </p>
      </div>
    </section>
  );
}
