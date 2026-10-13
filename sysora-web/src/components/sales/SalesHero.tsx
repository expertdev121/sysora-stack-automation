import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icon";
import { routes } from "@/config/site";
import { hero, packs } from "@/content/landing/sales";

/** Column heights for the rate chart, tallest at $19 down to $13. */
const COL_HEIGHT: Record<number, number> = {
  19: 130,
  18: 114,
  17: 98,
  15: 72,
  14: 58,
  13: 44,
};

export function SalesHero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden px-6 pt-[clamp(64px,9vh,104px)] pb-[clamp(48px,6vh,72px)] bg-[linear-gradient(180deg,var(--surface-0)_0%,var(--mint-50)_100%)]"
    >
      <div
        aria-hidden="true"
        className="sx-glow pointer-events-none absolute -top-[180px] -right-[120px] w-[640px] h-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(0,200,150,0.16),rgba(0,200,150,0))]"
      />
      <div
        aria-hidden="true"
        className="sx-glow pointer-events-none absolute -bottom-[260px] -left-[200px] w-[620px] h-[620px] rounded-full bg-[radial-gradient(closest-side,rgba(135,195,143,0.16),rgba(135,195,143,0))]"
        style={{ animationDelay: "-7s" }}
      />

      <div className="relative max-w-[1160px] mx-auto grid grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] gap-[clamp(36px,4.5vw,72px)] items-center to-980:grid-cols-1">
        <div>
          <span className="inline-flex items-center gap-[9px] px-[14px] py-[7px] rounded-full bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] text-[11px] font-bold tracking-[1.6px] uppercase text-[var(--accent-strong)]">
            <span className="sx-dot w-[7px] h-[7px] rounded-full bg-[var(--accent)]" />
            {hero.eyebrow}
          </span>

          <h1 className="mt-6 text-[clamp(40px,5.4vw,66px)] font-black leading-[1.04] tracking-[-1.8px] text-[var(--ink-900)]">
            {hero.headline}
            <span className="text-[var(--accent-strong)]">{hero.headlineAccent}</span>
          </h1>

          <p className="mt-6 max-w-[580px] text-[18px] leading-[1.72] text-[var(--ink-500)]">
            {hero.lead}
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <Button size="lg" arrow href="#packages">
              {hero.primaryCta}
            </Button>
            <Button size="lg" variant="ghost" href={routes.requestEstimate}>
              {hero.secondaryCta}
            </Button>
          </div>

          <ul className="list-none mt-7 p-0 flex flex-wrap gap-x-[22px] gap-y-[10px]">
            {hero.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-center gap-2 text-[14px] text-[var(--ink-600)]"
              >
                <CheckIcon size={16} strokeWidth={2.4} className="text-[var(--accent)]" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative p-7 rounded-[22px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_4px_10px_rgba(0,80,50,0.06),0_34px_70px_rgba(0,80,50,0.14)]">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10.5px] tracking-[1.3px] uppercase text-[var(--ink-300)]">
              {hero.chart.label}
            </span>
            <span className="inline-flex items-center gap-[7px] text-[12px] font-semibold text-[var(--accent-strong)]">
              <span className="sx-dot w-[6px] h-[6px] rounded-full bg-[var(--accent)]" />
              {hero.chart.unit}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-[18px]">
            <span className="font-mono text-[54px] font-semibold tracking-[-2px] leading-none text-[var(--ink-900)]">
              $19
            </span>
            <svg width="26" height="16" viewBox="0 0 26 16" fill="none" stroke="var(--ink-300)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 8h20M16 2l6 6-6 6" />
            </svg>
            <span className="font-mono text-[54px] font-semibold tracking-[-2px] leading-none text-[var(--accent)]">
              $13
            </span>
          </div>

          <div className="grid grid-cols-7 gap-[10px] items-end h-[170px] mt-7 pb-[10px] border-b-[1.5px] border-[var(--border-faint)]">
            {packs.map((pack, i) => {
              const last = i === packs.length - 1;
              return (
                <div
                  key={pack.hours}
                  className="flex flex-col items-center justify-end gap-[6px] h-full"
                >
                  <span
                    className={
                      last
                        ? "font-mono text-[11px] font-bold text-[var(--accent-strong)]"
                        : "font-mono text-[11px] text-[var(--ink-500)]"
                    }
                  >
                    ${pack.rate}
                  </span>
                  <div
                    className={
                      last
                        ? "sx-rate-col w-full rounded-t-[7px] rounded-b-[3px] bg-[linear-gradient(180deg,var(--accent),var(--mint-300))] shadow-[0_6px_16px_rgba(0,200,150,0.3)]"
                        : "sx-rate-col w-full rounded-t-[7px] rounded-b-[3px] bg-[linear-gradient(180deg,var(--mint-300),var(--mint-100))]"
                    }
                    style={{
                      height: COL_HEIGHT[pack.rate],
                      animationDelay: `${i * 0.06}s`,
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 gap-[10px] mt-[9px]">
            {packs.map((pack) => (
              <span
                key={pack.hours}
                className="text-center font-mono text-[11px] text-[var(--ink-300)]"
              >
                {pack.hours}h
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-[10px] mt-[22px]">
            {hero.chart.tiles.map((tile) => (
              <div
                key={tile.label}
                className="px-[14px] py-3 rounded-xl bg-[var(--mint-50)] border-[1.5px] border-[var(--border-faint)]"
              >
                <p className="font-mono text-[15px] font-semibold text-[var(--ink-900)]">
                  {tile.value}
                </p>
                <p className="mt-[3px] text-[12px] text-[var(--ink-500)]">{tile.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
