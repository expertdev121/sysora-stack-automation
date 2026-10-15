import { safeguards } from "@/content/landing/sales";

// #24243A is the design's value. This was #1A1A2E — which is --ink-800,
// the heading colour, not the band colour — so the band read as
// near-black rather than the design's deep indigo.
export function Safeguards() {
  return (
    <section className="relative overflow-hidden px-6 py-[clamp(78px,10vh,120px)] bg-[#24243A] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
      />
      <div className="relative max-w-[1160px] mx-auto">
        <div className="max-w-[720px]">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--accent)]">
            {safeguards.eyebrow}
          </span>
          <h2 className="mt-[14px] text-[clamp(30px,3.6vw,44px)] font-black tracking-[-1.1px] leading-[1.1] text-white">
            {safeguards.headline}
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mt-12 items-stretch">
          {safeguards.cards.map((card) => (
            <article
              key={card.n}
              className="sx-card-d flex flex-col p-[30px] rounded-[18px] bg-white/[0.04] border-[1.5px] border-white/[0.12]"
            >
              <span className="sx-accent-bar" />
              <span className="mt-[22px] font-mono text-[12px] tracking-[1.2px] text-[var(--accent)]">
                {card.n}
              </span>
              <h3 className="mt-[10px] text-[20px] font-bold leading-[1.3] text-white">
                {card.title}
              </h3>
              <p className="mt-[14px] text-[15px] leading-[1.75] text-white/70">{card.body}</p>
            </article>
          ))}
        </div>

        <p className="mt-9 font-heading text-[19px] italic text-white/[0.82]">
          {safeguards.kicker}
        </p>
      </div>
    </section>
  );
}
