import { Button } from "@/components/ui/Button";
import { routes } from "@/config/site";
import { hero } from "@/content/landing/hero";

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden px-6 pt-[clamp(84px,12vh,148px)] pb-[clamp(140px,17vh,200px)] bg-[linear-gradient(180deg,var(--surface-0)_0%,var(--mint-50)_58%,var(--surface-1)_100%)]"
    >
      {/* Drifting glows */}
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute -top-[30%] -right-[10%] bottom-auto -left-[10%] h-[780px] bg-[radial-gradient(ellipse_50%_100%_at_50%_0%,rgba(0,200,150,0.16),transparent_68%)] animate-[heroDriftA_18s_ease_infinite_alternate]"
      />
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute top-auto -right-[20%] -bottom-[30%] -left-[20%] h-[560px] bg-[radial-gradient(ellipse_45%_100%_at_25%_100%,rgba(135,195,143,0.24),transparent_66%)] animate-[heroDriftB_24s_ease_infinite_alternate]"
      />

      {/* Breathing rings */}
      <div
        aria-hidden="true"
        className="hero-ring pointer-events-none absolute left-1/2 top-[-320px] w-[940px] h-[940px] rounded-full border-[1.5px] border-[rgba(0,200,150,0.20)] animate-[ringBreathe_14s_ease_infinite_alternate]"
      />
      <div
        aria-hidden="true"
        className="hero-ring pointer-events-none absolute left-1/2 top-[-540px] w-[1380px] h-[1380px] rounded-full border-[1.5px] border-[rgba(0,200,150,0.13)] animate-[ringBreathe_18s_ease_1.5s_infinite_alternate]"
      />
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute left-1/2 top-[6%] w-[min(1100px,120%)] h-[520px] rounded-full blur-[10px] bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(0,200,150,0.14),transparent_70%)] animate-[auraFloat_20s_ease_infinite_alternate]"
      />

      <div className="relative max-w-[940px] mx-auto text-center flex flex-col items-center gap-[26px]">
        <span className="inline-flex items-center gap-[9px] px-4 py-2 rounded-full bg-[var(--mint-100)] border-[1.5px] border-[var(--border-default)] text-[11px] font-bold tracking-[2px] uppercase text-[var(--mint-700)]">
          <span className="w-[6px] h-[6px] rounded-full bg-[var(--accent)] shadow-[var(--glow-ring)]" />
          {hero.badge}
        </span>

        <h1 className="m-0 text-[clamp(42px,7vw,82px)] font-extrabold leading-[1.05] tracking-[-1.5px] text-[var(--ink-900)]">
          {hero.headline.line1}
          <br />
          <span className="text-[var(--accent-strong)]">{hero.headline.line2}</span>
        </h1>

        <p className="m-0 max-w-[700px] text-[19px] leading-[1.75] text-[var(--ink-600)]">
          {hero.lead}
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-1">
          <Button size="lg" arrow href={routes.waysToStart}>
            {hero.primaryCta}
          </Button>
          <Button size="lg" variant="ghost" href={routes.waysToStart}>
            {hero.secondaryCta}
          </Button>
        </div>

        <p className="m-0 text-[13px] text-[var(--text-muted)]">{hero.note}</p>
      </div>
    </section>
  );
}
