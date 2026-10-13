import { Button } from "@/components/ui/Button";
import { routes } from "@/config/site";
import { hero, heroFlow, heroPanel } from "@/content/landing/hero";

/**
 * The hero: the claim on the left, an illustrative "system view" on the
 * right. The panel is a drawing, not live data — the footnote says so.
 */
export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden px-6 pt-[clamp(70px,9.5vh,116px)] pb-[clamp(70px,9.5vh,112px)] bg-[linear-gradient(180deg,var(--surface-0)_0%,var(--mint-50)_100%)] border-b-[1.5px] border-[var(--border-faint)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[25%] -right-[10%] bottom-auto -left-[10%] h-[720px] bg-[radial-gradient(ellipse_46%_100%_at_64%_0%,rgba(0,200,150,0.16),transparent_66%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,120,90,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,120,90,0.045)_1px,transparent_1px)] bg-[length:46px_46px] [mask-image:radial-gradient(ellipse_70%_60%_at_60%_20%,#000_10%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_70%_60%_at_60%_20%,#000_10%,transparent_72%)]"
      />

      <div className="relative max-w-[1200px] mx-auto grid grid-cols-[minmax(0,1.06fr)_minmax(330px,0.94fr)] gap-[clamp(36px,4.5vw,72px)] items-center to-980:grid-cols-1">
        <div className="flex flex-col gap-[22px]">
          <span className="inline-flex items-center gap-[9px] self-start px-4 py-2 rounded-full bg-[var(--mint-100)] border-[1.5px] border-[var(--border-default)] text-[11px] font-bold tracking-[2px] uppercase text-[var(--mint-700)]">
            <span className="sx-dot w-[6px] h-[6px] rounded-full bg-[var(--accent)]" />
            {hero.eyebrow}
          </span>

          <h1 className="text-[clamp(38px,5.2vw,64px)] font-black leading-[1.05] tracking-[-1.5px] text-[var(--ink-900)]">
            {hero.headline}
            <span className="inline text-[var(--accent-strong)] bg-[linear-gradient(transparent_66%,rgba(0,200,150,0.20)_66%)]">
              {hero.headlineAccent}
            </span>
          </h1>

          <p className="m-0 max-w-[610px] text-[18.5px] leading-[1.7] text-[var(--ink-600)]">
            {hero.lead}
          </p>

          <div className="flex flex-wrap gap-3 mt-1">
            <Button size="lg" arrow href={routes.systemsReview}>
              {hero.primaryCta}
            </Button>
            <Button size="lg" variant="ghost" href={routes.buildRequest}>
              {hero.secondaryCta}
            </Button>
          </div>

          <p className="m-0 text-[13.5px] text-[var(--text-muted)]">{hero.note}</p>
        </div>

        <div className="relative rounded-[22px] bg-[var(--forest-hero)] border-[1.5px] border-[rgba(0,200,150,0.22)] shadow-[0_8px_20px_rgba(0,80,50,0.12),0_36px_76px_rgba(0,80,50,0.18)] overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_10%,rgba(0,200,150,0.20),transparent_70%)]"
          />
          <div aria-hidden="true" className="sx-scanline" />

          <div className="relative flex items-center justify-between gap-3 px-[18px] py-[14px] border-b-[1.5px] border-white/10">
            <span className="font-mono text-[10px] tracking-[1.3px] uppercase text-white/55">
              {heroPanel.title}
            </span>
            <span className="inline-flex items-center gap-[7px] font-mono text-[10px] tracking-[1px] uppercase text-[var(--accent)]">
              <span className="sx-dot w-[6px] h-[6px] rounded-full bg-[var(--accent)]" />
              {heroPanel.status}
            </span>
          </div>

          <div className="relative flex flex-col gap-[9px] px-[18px] py-5">
            {heroFlow.map((step) => (
              <div
                key={step.n}
                className="relative flex items-center gap-3 px-[14px] py-3 rounded-xl bg-white/[0.045] border-[1.5px] border-white/10 overflow-hidden"
              >
                <span aria-hidden="true" className="sx-wire" />
                <span
                  aria-hidden="true"
                  className="sx-packet"
                  style={{ animationDelay: step.delay }}
                />
                <span className="font-mono text-[10.5px] text-white/40">{step.n}</span>
                <span className="flex-1 text-[14.5px] font-semibold text-white">
                  {step.label}
                </span>
                <span className="font-mono text-[10px] tracking-[0.8px] uppercase text-[var(--accent)]">
                  {step.state}
                </span>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-[10px] mt-1">
              {heroPanel.tiles.map((tile, i) => (
                <div
                  key={tile.title}
                  className={
                    i === 0
                      ? "p-[14px] rounded-xl bg-[rgba(0,200,150,0.10)] border-[1.5px] border-[rgba(0,200,150,0.28)]"
                      : "p-[14px] rounded-xl bg-white/[0.04] border-[1.5px] border-white/10"
                  }
                >
                  <p className="m-0 text-[13px] font-bold text-white">{tile.title}</p>
                  <p className="mt-[5px] mb-0 text-[11.5px] leading-[1.5] text-white/60">
                    {tile.body}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-[6px] mb-0 font-mono text-[10px] tracking-[1px] uppercase text-white/40">
              {heroPanel.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
