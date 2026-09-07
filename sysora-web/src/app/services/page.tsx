import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ServiceCard, ServiceMedia } from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { servicesPage as copy } from "@/content/landing/services-page";
import { listPublishedServices, priceLabel } from "@/lib/sales/services";

// Services are edited in the dashboard, so this is never baked.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services and pricing",
  description:
    "Fixed scope, fixed price. Every service is a job with a defined start, a defined end, and a price you see before you commit — from $49 systems reviews to full builds.",
  alternates: { canonical: "/services" },
};

/**
 * The catalogue.
 *
 * Not PageShell: that frame centres one 820px column of prose, and this page
 * is a hero beside an image and then a three-up grid. Forcing it through the
 * shared shell would have meant fighting the max-width on every band.
 *
 * One service leads and the rest follow. The lead card is wider and carries
 * its own image because it is the thing most people arrive wanting; the grid
 * behind it is a menu, and a menu where every item shouts is a list.
 */
export default async function ServicesPage() {
  const services = await listPublishedServices();
  const featured = services.find((s) => s.is_featured) ?? null;
  const rest = services.filter((s) => s.id !== featured?.id);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Sysora services",
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `https://sysora.com/services/${s.slug}`,
    })),
  };

  return (
    <div className="font-sans overflow-x-hidden bg-[var(--surface-0)] text-[var(--text-body)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <SiteHeader />

      {/* ---- Hero ---------------------------------------------- */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,var(--surface-0)_0%,var(--mint-50)_100%)] px-6 pt-[clamp(56px,7vh,88px)] pb-[clamp(56px,8vh,96px)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[30%] -right-[10%] -left-[10%] h-[560px] bg-[radial-gradient(ellipse_50%_100%_at_50%_0%,rgba(0,200,150,0.14),transparent_68%)]"
        />
        <div className="relative mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h1 className="mt-0 mb-[22px] text-[clamp(38px,5vw,60px)] font-extrabold leading-[1.08] tracking-[-1.4px] text-[var(--ink-900)]">
              {copy.headline.lead}
              <br />
              <span className="text-[var(--accent-strong)]">{copy.headline.accent}</span>
            </h1>
            <p className="m-0 max-w-[54ch] text-[17px] leading-[1.75] text-[var(--ink-600)]">
              {copy.intro}
            </p>

            <ul className="mt-7 mb-0 flex list-none flex-wrap gap-2.5 p-0">
              {copy.priceChips.map((chip) => (
                <li
                  key={chip.label}
                  className="rounded-full border-[1.5px] border-[var(--border-default)] bg-white px-3.5 py-[7px] text-[13px] text-[var(--ink-600)]"
                >
                  {chip.label}{" "}
                  <span className="font-mono font-bold text-[var(--accent-strong)]">
                    {chip.value}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" arrow href={copy.primaryCta.href}>
                {copy.primaryCta.label}
              </Button>
              <Button size="lg" variant="ghost" href={copy.secondaryCta.href}>
                {copy.secondaryCta.label}
              </Button>
            </div>
          </div>

          {/* Dark panel with the proof line, mirroring the landing hero. */}
          <div className="relative overflow-hidden rounded-[18px] bg-[linear-gradient(160deg,#0a1f14_0%,#0d2818_60%,#10331f_100%)] p-6 shadow-[0_24px_60px_-30px_rgba(0,80,50,0.6)]">
            <ServiceMedia
              alt={copy.hero.imageAlt}
              className="aspect-[4/3] rounded-[12px] border-white/10 bg-white/[0.04] text-white/45"
            />
            <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="m-0 font-mono text-[10px] uppercase tracking-[1.8px] text-white/45">
                  {copy.hero.ratingEyebrow}
                </p>
                <p className="mt-1.5 mb-0 text-[19px] font-bold tracking-[-0.4px] text-white">
                  {copy.hero.ratingLine}
                </p>
              </div>
              <span className="rounded-full border border-[rgba(0,200,150,0.32)] bg-[rgba(0,200,150,0.14)] px-3 py-[6px] font-mono text-[10px] font-bold uppercase tracking-[1px] text-[var(--mint-500)]">
                ★ 1,220 hours
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- The lead service ----------------------------------- */}
      {featured && (
        <section className="px-6 pt-[clamp(40px,6vh,72px)]">
          <div className="mx-auto max-w-[1180px]">
            <article className="grid overflow-hidden rounded-[20px] border-[1.5px] border-[var(--border-default)] bg-white md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div className="relative bg-[var(--mint-50)] p-6">
                {featured.featured_label && (
                  <span className="absolute top-5 left-5 z-10 rounded-full bg-[var(--ink-900)] px-3 py-[5px] font-mono text-[9.5px] font-bold uppercase tracking-[1.2px] text-white">
                    {featured.featured_label}
                  </span>
                )}
                <ServiceMedia
                  alt={featured.image_alt}
                  src={featured.image_url}
                  className="h-full min-h-[220px] rounded-[12px]"
                />
              </div>

              <div className="flex flex-col p-8">
                {featured.category && (
                  <p className="m-0 mb-3 font-mono text-[9.5px] uppercase tracking-[1.6px] text-[var(--ink-300)]">
                    {featured.category}
                  </p>
                )}
                <h2 className="m-0 text-[27px] font-extrabold leading-[1.25] tracking-[-0.7px] text-[var(--ink-900)]">
                  {featured.name}
                </h2>
                {featured.tagline && (
                  <p className="mt-2.5 mb-0 text-[15.5px] font-semibold leading-[1.5] text-[var(--accent-strong)]">
                    {featured.tagline}
                  </p>
                )}
                {featured.summary && (
                  <p className="mt-4 mb-0 text-[15px] leading-[1.7] text-[var(--ink-600)]">
                    {featured.summary}
                  </p>
                )}

                {featured.highlights.length > 0 && (
                  <ul className="mt-5 mb-0 flex list-none flex-wrap gap-2 p-0">
                    {featured.highlights.map((h) => (
                      <li
                        key={h}
                        className="rounded-full border-[1.5px] border-[var(--border-default)] px-3 py-[5px] text-[12px] text-[var(--ink-600)]"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-7">
                  <div>
                    <p className="m-0 font-mono text-[9.5px] uppercase tracking-[1.4px] text-[var(--ink-300)]">
                      {featured.price_label}
                    </p>
                    <p className="mt-1 mb-0 font-mono text-[30px] font-bold tracking-[-1px] text-[var(--ink-900)]">
                      {priceLabel(featured)}
                    </p>
                  </div>
                  <Button arrow href={`/services/${featured.slug}`}>
                    Get a quote
                  </Button>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* ---- Everything else ------------------------------------ */}
      <section id="all-services" className="scroll-mt-24 px-6 pt-[clamp(48px,7vh,80px)] pb-[clamp(56px,8vh,96px)]">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-7 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="m-0 text-[26px] font-extrabold tracking-[-0.6px] text-[var(--ink-900)]">
              {copy.grid.heading}
            </h2>
            <p className="m-0 font-mono text-[10px] uppercase tracking-[1.4px] text-[var(--ink-300)]">
              {rest.length} {rest.length === 1 ? "service" : "services"} · {copy.grid.metaSuffix}
            </p>
          </div>

          {rest.length === 0 ? (
            <p className="m-0 text-[15px] text-[var(--ink-500)]">
              Nothing else is listed yet.{" "}
              <Link href={copy.secondaryCta.href} className="font-semibold text-[var(--accent-strong)]">
                Tell us what you need
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-5">
              {rest.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}

          <p className="mt-7 mb-0 max-w-[80ch] text-[12.5px] leading-[1.7] text-[var(--ink-400)]">
            {copy.priceFootnote}
          </p>
        </div>
      </section>

      {/* ---- Closing -------------------------------------------- */}
      <section className="px-6 pb-[clamp(64px,9vh,110px)]">
        <div className="mx-auto max-w-[880px] rounded-[20px] border-[1.5px] border-[var(--border-default)] bg-[var(--mint-50)] px-8 py-12 text-center">
          <h2 className="m-0 text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-0.8px] text-[var(--ink-900)]">
            {copy.closing.heading}
          </h2>
          <p className="mx-auto mt-3 mb-0 max-w-[56ch] text-[15.5px] leading-[1.75] text-[var(--ink-600)]">
            {copy.closing.body}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button size="lg" href={copy.closing.primary.href}>
              {copy.closing.primary.label}
            </Button>
            <Button size="lg" variant="ghost" href={copy.closing.secondary.href}>
              {copy.closing.secondary.label}
            </Button>
          </div>
          <p className="mt-5 mb-0 text-[12.5px] text-[var(--ink-400)]">{copy.closing.note}</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
