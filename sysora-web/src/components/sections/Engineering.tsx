import { Eyebrow } from "@/components/ui/Eyebrow";
import { engineering } from "@/content/landing/engineering";

/** Tile colours for the deploy pipeline — neutral until staging lights up. */
const tile = {
  none: "bg-white/5 border-white/15 text-white/70",
  soft: "bg-[rgba(0,200,150,0.10)] border-[rgba(0,200,150,0.30)] text-[var(--accent)]",
  strong: "bg-[rgba(0,200,150,0.16)] border-[rgba(0,200,150,0.44)] text-white",
} as const;

export function Engineering() {
  const { pipeline } = engineering;

  return (
    <section
      id="engineering"
      className="relative overflow-hidden px-6 py-[clamp(78px,10vh,126px)] text-white bg-[linear-gradient(160deg,#14503C_0%,#1A6349_100%)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_72%_8%,rgba(0,200,150,0.22),transparent_68%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:44px_44px] [mask-image:radial-gradient(ellipse_65%_70%_at_60%_30%,#000_10%,transparent_76%)] [-webkit-mask-image:radial-gradient(ellipse_65%_70%_at_60%_30%,#000_10%,transparent_76%)]"
      />

      <div className="relative max-w-[1200px] mx-auto">
        <div className="max-w-[820px]">
          <Eyebrow className="text-[var(--accent)]">{engineering.eyebrow}</Eyebrow>
          <h2 className="text-[clamp(30px,3.8vw,48px)] font-black leading-[1.1] tracking-[-1px] text-white">
            {engineering.headline}
          </h2>
          <p className="mt-[22px] mb-0 text-[17.5px] leading-[1.8] text-white/70">
            {engineering.lead}
          </p>
          <p className="mt-4 mb-0 text-[19px] font-bold leading-[1.6] text-white">
            {engineering.claim}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-[18px] mt-11 to-980:grid-cols-2 to-640:grid-cols-1">
          {engineering.cards.map((card) => (
            <article
              key={card.n}
              className="sx-card-d flex flex-col px-6 py-[26px] rounded-[18px] bg-white/[0.035] border-[1.5px] border-white/[0.12]"
            >
              <span className="font-mono text-[11px] tracking-[1.2px] text-[var(--accent)]">
                {card.n}
              </span>
              <h3 className="mt-3 mb-0 text-[18px] font-bold leading-[1.25] text-white">
                {card.title}
              </h3>
              <p className="mt-3 mb-[18px] flex-1 text-[14.5px] leading-[1.7] text-white/[0.66]">
                {card.body}
              </p>
              <div className="flex flex-wrap gap-[6px]">
                {card.stack.map((s) => (
                  <span
                    key={s}
                    className="px-[10px] py-1 rounded-full bg-[rgba(0,200,150,0.10)] border-[1.5px] border-[rgba(0,200,150,0.26)] font-mono text-[10.5px] text-[var(--accent)]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="relative overflow-hidden mt-6 rounded-[18px] bg-white/[0.03] border-[1.5px] border-white/[0.12]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-[26px] py-4 border-b-[1.5px] border-white/10">
            <span className="font-mono text-[10.5px] tracking-[1.3px] uppercase text-white/45">
              {pipeline.label}
            </span>
            <span className="inline-flex items-center gap-[7px] font-mono text-[10px] tracking-[1px] uppercase text-[var(--accent)]">
              <span className="sx-dot w-[6px] h-[6px] rounded-full bg-[var(--accent)]" />
              {pipeline.status}
            </span>
          </div>

          <div className="sx-pipe relative grid grid-cols-4 px-[26px] pt-[34px] pb-[30px]">
            <span aria-hidden="true" className="sx-pipe-track" />
            <span aria-hidden="true" className="sx-pipe-packet" />
            {pipeline.steps.map((step) => (
              <div key={step.n} className="relative flex flex-col gap-[14px] pr-[18px]">
                <span
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border-[1.5px] font-mono text-[12px] font-semibold ${tile[step.lit]}`}
                >
                  {step.n}
                </span>
                <span className="flex flex-col gap-[5px]">
                  <span className="text-[16px] font-bold tracking-[-0.2px] text-white">
                    {step.title}
                  </span>
                  <span className="text-[13px] leading-[1.6] text-white/[0.58]">{step.body}</span>
                </span>
                <span className="inline-flex self-start items-center gap-[6px] px-[10px] py-[5px] rounded-full bg-white/5 border-[1.5px] border-white/[0.12] font-mono text-[10px] tracking-[0.8px] uppercase text-white/[0.68]">
                  {step.tool}
                </span>
              </div>
            ))}
          </div>

          <p className="m-0 px-[26px] py-4 border-t-[1.5px] border-white/10 bg-[rgba(0,200,150,0.06)] text-[14.5px] leading-[1.7] text-white/[0.74]">
            {pipeline.footnote}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-[18px] mt-6 to-860:grid-cols-1">
          <div className="sx-card-d p-8 rounded-[18px] bg-[rgba(0,200,150,0.10)] border-[1.5px] border-[rgba(0,200,150,0.32)]">
            <h3 className="text-[21px] font-extrabold leading-[1.25] text-white">
              {engineering.run.title}
            </h3>
            <p className="mt-[14px] mb-0 text-[16px] leading-[1.8] text-white/[0.76]">
              {engineering.run.body}
            </p>
          </div>
          <div className="sx-card-d p-8 rounded-[18px] bg-white/[0.035] border-[1.5px] border-white/[0.12]">
            <p className="mt-0 mb-3 font-mono text-[10.5px] tracking-[1.3px] uppercase text-white/45">
              {engineering.boundary.label}
            </p>
            <p className="m-0 text-[15.5px] leading-[1.8] text-white/70">
              {engineering.boundary.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
