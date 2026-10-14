import type { Metadata } from "next";
import Link from "next/link";

import { SalesFooter } from "@/components/sales/SalesFooter";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { Button } from "@/components/ui/Button";
import { servicesPage as copy } from "@/content/landing/services-page";

export const metadata: Metadata = {
  title: copy.meta.title,
  description: copy.meta.description,
  alternates: { canonical: "/services" },
};

/** Stands in for a screenshot until there is one to show. */
function Shot({ label }: { label: string }) {
  return (
    <span className="absolute inset-0 flex items-center justify-center bg-[var(--mint-50)] px-5 text-center">
      <span className="font-mono text-[11px] leading-[1.6] tracking-[0.6px] text-[var(--mint-700)]/70">
        {label}
      </span>
    </span>
  );
}

export default function ServicesPage() {
  const { featured } = copy;

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Sysora services",
    itemListElement: [featured.title, ...copy.services.map((s) => s.title)].map(
      (name, i) => ({ "@type": "ListItem", position: i + 1, name }),
    ),
  };

  return (
    <div className="font-sans overflow-x-hidden bg-[var(--surface-0)] text-[var(--ink-600)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <SalesHeader anchorBase="/" />

      {/* ---- Hero ---------------------------------------------- */}
      <section
        id="top"
        className="relative overflow-hidden px-6 pt-[clamp(72px,10vh,116px)] pb-[clamp(72px,10vh,112px)] bg-[linear-gradient(180deg,var(--surface-0)_0%,var(--mint-50)_100%)] border-b-[1.5px] border-[var(--border-faint)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[20%] -right-[10%] bottom-auto -left-[10%] h-[640px] bg-[radial-gradient(ellipse_45%_100%_at_70%_0%,rgba(0,200,150,0.14),transparent_66%)]"
        />
        <div className="relative max-w-[1200px] mx-auto flex flex-col gap-5">
          <span className="inline-flex items-center gap-[9px] self-start px-4 py-2 rounded-full bg-[var(--mint-100)] border-[1.5px] border-[var(--border-default)] font-mono text-[11px] font-bold tracking-[2px] uppercase text-[var(--mint-700)]">
            <span className="sx-dot w-[6px] h-[6px] rounded-full bg-[var(--accent)]" />
            {copy.eyebrow}
          </span>

          <h1 className="m-0 text-[clamp(38px,5.4vw,64px)] font-extrabold leading-[1.05] tracking-[-1.5px] text-[var(--ink-900)]">
            {copy.headline.lead}
            <br />
            <span className="text-[var(--accent-strong)]">{copy.headline.accent}</span>
          </h1>

          <p className="m-0 max-w-[660px] text-[18.5px] leading-[1.75] text-[var(--ink-600)]">
            {copy.intro}
          </p>

          <div className="flex flex-wrap gap-[10px] mt-1">
            {copy.priceChips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-baseline gap-[7px] px-[15px] py-[9px] rounded-full bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05)]"
              >
                <span className="text-[13px] font-semibold text-[var(--ink-600)]">
                  {chip.label}
                </span>
                <span className="font-mono text-[13.5px] font-bold text-[var(--accent-strong)]">
                  {chip.value}
                </span>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-[10px]">
            <Button size="lg" arrow href={copy.primaryCta.href}>
              {copy.primaryCta.label}
            </Button>
            <Button size="lg" variant="ghost" href={copy.secondaryCta.href}>
              {copy.secondaryCta.label}
            </Button>
          </div>
        </div>
      </section>

      {/* ---- Catalogue ------------------------------------------ */}
      <section
        id="catalog"
        className="px-6 py-[clamp(80px,10vh,124px)] bg-[var(--surface-1)] border-b-[1.5px] border-[var(--border-faint)]"
      >
        <div className="max-w-[1200px] mx-auto">
          {/* The lead service */}
          <div className="sx-card grid grid-cols-[minmax(280px,0.9fr)_minmax(0,1.3fr)] rounded-[22px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_3px_8px_rgba(0,80,50,0.05),0_24px_50px_rgba(0,80,50,0.09)] overflow-hidden to-860:grid-cols-1">
            <div className="relative min-h-[360px] overflow-hidden flex flex-col items-center justify-center gap-[26px] p-[clamp(30px,3.4vw,44px)] bg-[linear-gradient(165deg,#0A1F14_0%,#0D2818_100%)] border-r-[1.5px] border-[var(--border-faint)] to-860:border-r-0 to-860:border-b-[1.5px]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_42%,rgba(0,200,150,0.22),transparent_70%)]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[length:38px_38px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_45%,#000_30%,transparent_78%)] [-webkit-mask-image:radial-gradient(ellipse_70%_70%_at_50%_45%,#000_30%,transparent_78%)]"
              />
              <span className="absolute top-[18px] left-[18px] z-[2] px-[13px] py-[6px] rounded-full bg-[var(--accent-strong)] font-mono text-[10.5px] font-bold tracking-[1.4px] uppercase text-white">
                {featured.badge}
              </span>

              <div className="relative z-[2] flex flex-col items-center gap-5 text-center">
                <div className="relative w-[132px] h-[132px] rounded-[30px] overflow-hidden border-[1.5px] border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.35),0_0_0_10px_rgba(0,200,150,0.10),0_0_46px_rgba(0,200,150,0.30)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featured.panel.image}
                    alt={featured.panel.imageAlt}
                    className="w-full h-full object-cover block"
                  />
                </div>

                <span className="inline-flex items-center gap-2 px-[15px] py-[7px] rounded-full bg-[rgba(0,200,150,0.14)] border-[1.5px] border-[rgba(0,200,150,0.42)] font-mono text-[10.5px] font-bold tracking-[1.3px] uppercase text-[var(--accent)]">
                  <span className="sx-dot w-[6px] h-[6px] rounded-full bg-[var(--accent)]" />
                  {featured.panel.status}
                </span>
                <p className="m-0 text-[20px] font-extrabold tracking-[-0.4px] text-white">
                  {featured.panel.title}
                </p>
                <p className="m-0 max-w-[260px] text-[13px] leading-[1.65] text-white/[0.58]">
                  {featured.panel.body}
                </p>
              </div>
            </div>

            <div className="flex flex-col p-[clamp(28px,3.2vw,42px)]">
              <p className="m-0 font-mono text-[10.5px] tracking-[1.4px] uppercase text-[var(--ink-300)]">
                {featured.category}
              </p>
              <h2 className="mt-3 mb-[10px] text-[clamp(24px,2.6vw,32px)] font-extrabold leading-[1.2] tracking-[-0.8px] text-[var(--ink-900)]">
                {featured.title}
              </h2>
              <p className="m-0 text-[16.5px] font-bold leading-[1.65] text-[var(--accent-strong)]">
                {featured.promise}
              </p>
              <p className="mt-4 mb-0 text-[15.5px] leading-[1.75] text-[var(--ink-600)]">
                {featured.body}
              </p>
              <div className="flex flex-wrap gap-2 mt-[22px]">
                {featured.chips.map((chip) => (
                  <span
                    key={chip}
                    className="px-[13px] py-[6px] rounded-full bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] text-[12.5px] font-semibold text-[var(--ink-500)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-[26px] border-t-[1.5px] border-[var(--border-faint)]">
                <span className="flex flex-col gap-[3px]">
                  <span className="font-mono text-[10.5px] tracking-[1.2px] uppercase text-[var(--ink-300)]">
                    {featured.priceLabel}
                  </span>
                  <span className="font-mono text-[30px] font-semibold tracking-[-1px] leading-none text-[var(--ink-900)]">
                    {featured.price}
                  </span>
                </span>
                <Button arrow href={copy.secondaryCta.href}>
                  {featured.cta}
                </Button>
              </div>
            </div>
          </div>

          {/* Everything else */}
          <div className="flex flex-wrap items-baseline justify-between gap-5 mt-[clamp(52px,6.5vh,80px)] mb-[26px]">
            <h2 className="m-0 text-[clamp(24px,2.6vw,32px)] font-extrabold tracking-[-0.8px] text-[var(--ink-900)]">
              {copy.grid.heading}
            </h2>
            <span className="font-mono text-[11px] tracking-[1.2px] uppercase text-[var(--ink-300)]">
              {copy.services.length} services · {copy.grid.metaSuffix}
            </span>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[26px] items-stretch">
            {copy.services.map((service) => (
              <article
                key={service.title}
                className="sx-card flex flex-col rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_16px_34px_rgba(0,80,50,0.07)] overflow-hidden"
              >
                <div className="relative aspect-[16/10] bg-[var(--mint-50)] border-b-[1.5px] border-[var(--border-faint)]">
                  <Shot label={service.shot} />
                  <span className="absolute top-[14px] left-[14px] px-[11px] py-[5px] rounded-full bg-white/95 border-[1.5px] border-[var(--border-default)] font-mono text-[9.5px] font-bold tracking-[1.2px] uppercase text-[var(--mint-700)]">
                    {service.kind}
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-[26px]">
                  <h3 className="mt-0 mb-2 text-[19px] font-bold leading-[1.2] text-[var(--ink-900)]">
                    {service.title}
                  </h3>
                  <p className="m-0 text-[14.5px] font-semibold leading-[1.65] text-[var(--accent-strong)]">
                    {service.promise}
                  </p>
                  <p className="mt-3 mb-0 flex-1 text-[15px] leading-[1.75] text-[var(--ink-500)]">
                    {service.body}
                  </p>
                  <div className="flex flex-wrap gap-[7px] mt-[18px]">
                    {service.chips.map((chip) => (
                      <span
                        key={chip}
                        className="px-[11px] py-[5px] rounded-full bg-[var(--surface-2)] border-[1.5px] border-[var(--line-slate)] text-[11.5px] font-semibold text-[var(--ink-500)]"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-end justify-between gap-[14px] mt-[22px] pt-[18px] border-t-[1.5px] border-[var(--border-faint)]">
                    <span className="flex flex-col gap-[3px]">
                      <span className="font-mono text-[9.5px] tracking-[1.2px] uppercase text-[var(--ink-300)]">
                        {service.priceLabel}
                      </span>
                      <span className="font-mono text-[23px] font-semibold tracking-[-0.6px] leading-none text-[var(--ink-900)]">
                        {service.price}
                      </span>
                    </span>
                    <Link
                      href={copy.secondaryCta.href}
                      className="text-[14px] font-semibold whitespace-nowrap"
                    >
                      Get a quote →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-[26px] mb-0 text-[14px] text-[var(--text-muted)]">
            {copy.priceFootnote}
          </p>
        </div>
      </section>

      {/* ---- Closing -------------------------------------------- */}
      <section id="start" className="px-6 py-[clamp(80px,10vh,124px)] bg-[var(--surface-0)]">
        <div className="max-w-[1000px] mx-auto p-[clamp(38px,5vw,60px)] rounded-[22px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] text-center">
          <h2 className="mt-0 mb-3 text-[clamp(26px,3vw,38px)] font-extrabold leading-[1.2] tracking-[-0.8px] text-[var(--ink-900)]">
            {copy.closing.heading}
          </h2>
          <p className="mt-0 mb-[30px] mx-auto max-w-[560px] text-[16.5px] leading-[1.75] text-[var(--ink-500)]">
            {copy.closing.body}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" arrow href={copy.closing.primary.href}>
              {copy.closing.primary.label}
            </Button>
            <Button size="lg" variant="ghost" href={copy.closing.secondary.href}>
              {copy.closing.secondary.label}
            </Button>
          </div>
          <p className="mt-[22px] mb-0 text-[13px] text-[var(--text-muted)]">
            {copy.closing.note}
          </p>
        </div>
      </section>

      <SalesFooter anchorBase="/" />
    </div>
  );
}
