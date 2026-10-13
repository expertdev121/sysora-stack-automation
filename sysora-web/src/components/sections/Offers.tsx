import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ArrowRightIcon, CheckIcon, CrossMutedIcon } from "@/components/ui/Icon";
import { routes } from "@/config/site";
import { offers } from "@/content/landing/offers";

export function Offers() {
  const { compare, chooser } = offers;

  return (
    <section id="offers" className="px-6 py-[clamp(78px,10vh,126px)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[720px]">
          <Eyebrow className="text-[var(--mint-700)]">{offers.eyebrow}</Eyebrow>
          <h2 className="text-[clamp(30px,3.6vw,46px)] font-black leading-[1.1] tracking-[-1px] text-[var(--ink-900)]">
            {offers.headline}
          </h2>
        </div>

        {/* ---- The three offers ---- */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mt-11 items-stretch">
          {offers.cards.map((offer) => (
            <article
              key={offer.n}
              className="sx-card sx-offer flex flex-col p-8 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.07)]"
            >
              <svg className="sx-rim" aria-hidden="true">
                <rect pathLength={100} />
              </svg>

              <div className="flex items-center justify-between gap-3 min-h-[26px]">
                <span className="font-mono text-[12.5px] text-[var(--ink-300)]">{offer.n}</span>
                {offer.badge && (
                  <span className="px-[11px] py-[5px] rounded-full bg-[var(--accent-strong)] font-mono text-[9.5px] font-bold tracking-[1.3px] uppercase text-white">
                    {offer.badge}
                  </span>
                )}
              </div>

              <h3 className="mt-4 mb-[6px] text-[22px] font-bold leading-[1.25] text-[var(--ink-900)]">
                {offer.title}
              </h3>
              <p className="m-0 font-mono text-[14.5px] font-semibold text-[var(--accent-strong)]">
                {offer.price}
              </p>
              <p className="mt-4 mb-[18px] text-[15.5px] leading-[1.75] text-[var(--ink-600)]">
                {offer.forWhen}
              </p>

              <ul className="mt-0 mb-[18px] p-0 list-none flex flex-col gap-[10px] flex-1">
                {offer.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-[10px] text-[15px] leading-[1.65] text-[var(--ink-500)]"
                  >
                    <CheckIcon
                      size={15}
                      strokeWidth={2.4}
                      className="flex-none mt-1 text-[var(--accent)]"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {offer.boundary && (
                <p className="mt-0 mb-5 px-4 py-[14px] rounded-xl bg-[var(--surface-1)] border-[1.5px] border-[var(--border-faint)] text-[13.5px] leading-[1.65] text-[var(--ink-500)]">
                  {offer.boundary}
                </p>
              )}

              <Button arrow fullWidth href={offer.href}>
                {offer.cta}
              </Button>

              {offer.support && (
                <p className="mt-3 mb-0 text-[13px] leading-[1.6] text-[var(--text-muted)]">
                  {offer.support}
                </p>
              )}
            </article>
          ))}
        </div>

        {/* ---- Cheaper than the hire it replaces ---- */}
        <div className="relative overflow-hidden mt-7 p-[clamp(30px,3.4vw,44px)] rounded-[22px] bg-[var(--forest-hero)] text-white border-[1.5px] border-[rgba(0,200,150,0.22)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_70%_at_82%_10%,rgba(0,200,150,0.18),transparent_70%)]"
          />
          <div className="relative">
            <p className="mt-0 mb-3 font-mono text-[10.5px] tracking-[1.3px] uppercase text-[var(--accent)]">
              {compare.eyebrow}
            </p>
            <h3 className="max-w-[620px] text-[clamp(22px,2.4vw,30px)] font-extrabold leading-[1.2] tracking-[-0.6px] text-white">
              {compare.headline}
            </h3>

            <div className="mt-7 rounded-[18px] border-[1.5px] border-white/[0.12] bg-white/[0.03] overflow-hidden">
              <div className="grid grid-cols-[minmax(170px,0.85fr)_minmax(200px,1.1fr)_minmax(200px,1.1fr)] px-[26px] py-[18px] border-b-[1.5px] border-white/10 to-860:grid-cols-1 to-860:gap-[6px]">
                <span className="to-860:hidden" />
                <span className="font-mono text-[10.5px] tracking-[1.1px] uppercase text-white/45">
                  {compare.columnA}
                </span>
                <span className="font-mono text-[10.5px] tracking-[1.1px] uppercase text-[var(--accent)]">
                  {compare.columnB}
                </span>
              </div>

              {compare.rows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[minmax(170px,0.85fr)_minmax(200px,1.1fr)_minmax(200px,1.1fr)] gap-4 px-[26px] py-5 border-b-[1.5px] border-white/[0.07] items-start to-860:grid-cols-1 to-860:gap-[6px]"
                >
                  <span className="text-[14.5px] font-semibold text-white/[0.92]">
                    {row.label}
                  </span>
                  <span className="flex gap-[10px] text-[14.5px] leading-[1.65] text-white/55">
                    <CrossMutedIcon size={15} />
                    <span>{row.a}</span>
                  </span>
                  <span className="flex gap-[10px] text-[14.5px] leading-[1.65] text-white/90">
                    <CheckIcon
                      size={15}
                      strokeWidth={2.4}
                      className="flex-none mt-1 text-[var(--accent)]"
                    />
                    <span>{row.b}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-[26px]">
              <Button variant="white" arrow href={routes.systemsTeam}>
                {compare.cta}
              </Button>
            </div>
          </div>
        </div>

        {/* ---- Not sure which one ---- */}
        <div className="mt-7 px-[clamp(28px,3.4vw,44px)] py-[clamp(34px,4vw,52px)] rounded-[22px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
          <div className="text-center max-w-[540px] mx-auto mb-8">
            <h3 className="text-[clamp(24px,2.6vw,32px)] font-extrabold leading-[1.2] tracking-[-0.7px] text-[var(--ink-900)]">
              {chooser.headline}
            </h3>
            <p className="mt-[10px] mb-0 text-[15.5px] leading-[1.7] text-[var(--ink-500)]">
              {chooser.lead}
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 items-stretch">
            {chooser.cards.map((card) => (
              <Link
                key={card.name}
                href={card.href}
                className="sx-card flex flex-col gap-[18px] p-[26px] rounded-[18px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_14px_32px_rgba(0,80,50,0.06)] no-underline"
              >
                <p className="m-0 flex-1 text-[16.5px] italic leading-[1.65] text-[var(--ink-700)]">
                  {card.quote}
                </p>
                <div className="flex items-center gap-[10px] pt-4 border-t-[1.5px] border-[var(--border-faint)]">
                  <ArrowRightIcon size={17} strokeWidth={1.75} />
                  <span className="flex flex-col gap-[2px]">
                    <span className="text-[15px] font-bold text-[var(--accent-strong)]">
                      {card.name}
                    </span>
                    <span className="font-mono text-[12px] text-[var(--ink-300)]">
                      {card.note}
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-[30px]">
            <Button variant="ghost" arrow href={routes.contact}>
              {chooser.cta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
