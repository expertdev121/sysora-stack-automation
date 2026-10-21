import type { Metadata } from "next";
import Link from "next/link";

import { SalesFooter } from "@/components/sales/SalesFooter";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { Button } from "@/components/ui/Button";
import { ghlTeam, GHL_CHECKOUT_HREF } from "@/content/landing/ghl-team";

export const metadata: Metadata = {
  title: ghlTeam.meta.title,
  description: ghlTeam.meta.description,
  alternates: { canonical: "/on-demand-ghl-team" },
  openGraph: {
    title: `${ghlTeam.meta.title} | Sysora Stack`,
    description: ghlTeam.meta.description,
    url: "/on-demand-ghl-team",
  },
  twitter: {
    card: "summary_large_image",
    title: `${ghlTeam.meta.title} | Sysora Stack`,
    description: ghlTeam.meta.description,
  },
};

/**
 * The GoHighLevel agency landing page.
 *
 * Same hours, same prices, same terms as the homepage, aimed at one
 * audience. Every buying CTA goes to the published checkout shape with
 * the five-hour pack preselected, so this page cannot drift into its
 * own pricing.
 *
 * The anchors are in-page, so the header takes an empty anchorBase and
 * its own nav. Its CTA is pointed at checkout rather than the
 * homepage's packages section, which does not exist here.
 */

const SECTION = "px-6 py-[clamp(72px,10vh,128px)]";
const WRAP = "mx-auto max-w-[1160px]";
const EYEBROW = "m-0 text-[11px] font-bold uppercase tracking-[2px] text-[var(--accent-strong)]";
const H2 = "mt-3 font-display text-[clamp(28px,3.6vw,42px)] font-black leading-[1.12] tracking-[-1.1px] text-[var(--ink-900)]";

const ICONS: Record<string, React.ReactNode> = {
  build: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 14h8" />
    </>
  ),
  flow: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.5 6H15a3 3 0 0 1 3 3v6" />
    </>
  ),
  page: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h4" />
    </>
  ),
  wrench: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" />,
  shield: (
    <>
      <path d="M12 3l8 4v5c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V7z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
};

function Icon({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="grid h-11 w-11 flex-none place-items-center rounded-[12px] border-[1.5px] border-[var(--border-default)] bg-[#F0FAF6]"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--accent-strong)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ICONS[name]}
      </svg>
    </span>
  );
}

const STATUS_TONE = {
  done: { bg: "#F0FAF6", fg: "#00A87E" },
  active: { bg: "#FFF4E5", fg: "#C2410C" },
  queued: { bg: "#F7F9F7", fg: "#475569" },
} as const;

export default function OnDemandGhlTeamPage() {
  const { hero, problem, services, howItWorks, starter, why, demo, faq, finalCta } = ghlTeam;

  return (
    <div className="font-sans text-[var(--ink-600)] bg-[var(--surface-0)] overflow-x-clip">
      <SalesHeader
        items={ghlTeam.nav}
        ctaLabel="Start with 5 hours"
        ctaHref={GHL_CHECKOUT_HREF}
      />

      {/* ---- Hero ---- */}
      <section className="bg-[linear-gradient(180deg,#F0FAF6,var(--surface-0))] px-6 pb-[clamp(72px,9vh,120px)] pt-[clamp(56px,8vh,112px)]">
        <div className={`${WRAP} grid grid-cols-[minmax(0,550px)_minmax(0,498px)] items-center gap-16 to-980:grid-cols-1 to-980:gap-10`}>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[var(--border-default)] bg-white px-[14px] py-[7px] text-[11px] font-bold uppercase tracking-[1.6px] text-[var(--accent-strong)]">
              <span className="h-[6px] w-[6px] rounded-full bg-[var(--accent)]" aria-hidden="true" />
              {hero.eyebrow}
            </span>

            <h1 className="mt-5 font-display text-[clamp(34px,4.6vw,56px)] font-black leading-[1.05] tracking-[-1.6px] text-[var(--ink-900)]">
              {hero.titleLead}{" "}
              <span className="text-[var(--accent-strong)]">{hero.titleAccent}</span>
            </h1>

            <p className="mt-5 text-[17px] font-semibold text-[var(--ink-900)]">{hero.subhead}</p>
            <p className="mt-3 max-w-[540px] text-[16px] leading-[1.75] text-[var(--ink-500)]">
              {hero.body}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/book-a-call" arrow>
                {hero.primary}
              </Button>
              <Button href={GHL_CHECKOUT_HREF} variant="ghost">
                {hero.secondary}
              </Button>
            </div>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {hero.chips.map((chip) => (
                <li key={chip} className="flex items-center gap-2 text-[13.5px] text-[var(--ink-500)]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          {/* The delivery-queue panel. Illustrative, so it is hidden from
              assistive tech rather than read out as if it were data. */}
          <div className="relative" aria-hidden="true">
            <div className="overflow-hidden rounded-[22px] border-[1.5px] border-[var(--border-default)] bg-white shadow-[0_30px_70px_rgba(0,80,50,0.12)]">
              <header className="flex items-center justify-between gap-3 border-b-[1.5px] border-[var(--border-faint)] bg-[#FAFCFB] px-5 py-4">
                <span className="text-[14px] font-bold text-[var(--ink-900)]">
                  {hero.panel.title}
                </span>
                <span className="flex items-center gap-[6px] text-[12px] text-[var(--accent-strong)]">
                  <span className="h-[6px] w-[6px] rounded-full bg-[var(--accent)]" />
                  {hero.panel.note}
                </span>
              </header>

              <ul className="flex flex-col">
                {hero.panel.rows.map((row) => {
                  const tone = STATUS_TONE[row.tone];
                  return (
                    <li
                      key={row.initials}
                      className="flex items-center gap-3 border-b-[1.5px] border-[var(--border-faint)] px-5 py-[14px]"
                    >
                      <span className="grid h-8 w-8 flex-none place-items-center rounded-[9px] bg-[#F0FAF6] text-[11px] font-bold text-[var(--accent-strong)]">
                        {row.initials}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-semibold text-[var(--ink-900)]">
                          {row.task}
                        </span>
                        {"progress" in row && row.progress ? (
                          <span className="mt-[6px] block h-[5px] w-full overflow-hidden rounded-full bg-[var(--line-mint-2)]">
                            <span
                              className="block h-full rounded-full bg-[linear-gradient(90deg,#00C896,#00A87E)]"
                              style={{ width: `${row.progress}%` }}
                            />
                          </span>
                        ) : (
                          <span className="block truncate text-[12px] text-[var(--text-muted)]">
                            {row.meta}
                          </span>
                        )}
                      </span>
                      <span
                        className="flex-none rounded-full px-[10px] py-[4px] text-[11.5px] font-semibold"
                        style={{ background: tone.bg, color: tone.fg }}
                      >
                        {row.status}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <span className="text-[13px] text-[var(--text-muted)]">
                  {hero.panel.footerLabel}
                </span>
                <span className="rounded-[9px] bg-[var(--accent)] px-3 py-[6px] text-[12.5px] font-semibold text-white">
                  {hero.panel.footerAction}
                </span>
              </div>
            </div>

            <div className="absolute -bottom-5 left-6 flex items-center gap-[10px] rounded-[14px] border-[1.5px] border-[var(--border-default)] bg-white px-4 py-3 shadow-[0_16px_36px_rgba(0,80,50,0.16)] to-980:static to-980:mt-4">
              <span className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-[#F0FAF6]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </span>
              <span>
                <span className="block text-[13px] font-bold text-[var(--ink-900)]">
                  {hero.panel.badgeTitle}
                </span>
                <span className="block text-[12px] text-[var(--ink-500)]">
                  {hero.panel.badgeNote}
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- The growth problem ---- */}
      <section className={SECTION}>
        <div className={`${WRAP} grid grid-cols-[minmax(0,472px)_minmax(0,576px)] items-start gap-16 to-980:grid-cols-1 to-980:gap-10`}>
          <div>
            <p className={EYEBROW}>{problem.eyebrow}</p>
            <h2 className={H2}>{problem.title}</h2>
            <p className="mt-[18px] text-[16px] leading-[1.75] text-[var(--ink-500)]">
              {problem.lead}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {problem.pains.map((pain) => (
              <p
                key={pain}
                className="m-0 flex gap-3 rounded-[14px] border-[1.5px] border-[var(--border-faint)] bg-white px-5 py-4 text-[15px] leading-[1.6] text-[var(--ink-600)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="1.9" strokeLinecap="round" className="mt-[2px] flex-none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16h.01" />
                </svg>
                {pain}
              </p>
            ))}

            <div className="mt-2 rounded-[16px] bg-[linear-gradient(135deg,#14503C,#0B3A2B)] px-6 py-5 text-white">
              <p className="m-0 text-[16px] font-bold leading-[1.45]">{problem.calloutTitle}</p>
              <p className="m-0 mt-2 text-[14px] text-[#A7F3D0]">{problem.calloutBody}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- What we do ---- */}
      <section id="services" className={`${SECTION} scroll-mt-[92px] border-y-[1.5px] border-[var(--border-faint)] bg-[#FAFCFB]`}>
        <div className={WRAP}>
          <p className={EYEBROW}>{services.eyebrow}</p>
          <h2 className={`${H2} max-w-[760px]`}>{services.title}</h2>
          <p className="mt-[18px] max-w-[680px] text-[17px] leading-[1.75] text-[var(--ink-500)]">
            {services.lead}
          </p>

          <div className="mt-11 grid grid-cols-3 gap-5 to-980:grid-cols-2 to-700:grid-cols-1">
            {services.cards.map((card) => (
              <article
                key={card.title}
                className="rounded-[18px] border-[1.5px] border-[var(--border-default)] bg-white p-[26px]"
              >
                <Icon name={card.icon} />
                <h3 className="mt-5 text-[18px] font-bold text-[var(--ink-900)]">{card.title}</h3>
                <p className="mt-[10px] text-[15px] leading-[1.7] text-[var(--ink-600)]">
                  {card.body}
                </p>

                {"tags" in card && card.tags ? (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border-[1.5px] border-[var(--border-faint)] px-[11px] py-[5px] text-[12px] text-[var(--ink-600)]"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {"whiteLabel" in card && card.whiteLabel ? (
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t-[1.5px] border-[var(--border-faint)] pt-4 text-[12.5px]">
                    <div>
                      <dt className="text-[var(--text-muted)]">Your client sees</dt>
                      <dd className="mt-[2px] font-semibold text-[var(--ink-900)]">
                        {card.whiteLabel.clientSees}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--text-muted)]">Behind the scenes</dt>
                      <dd className="mt-[2px] font-semibold text-[var(--accent-strong)]">
                        {card.whiteLabel.behindScenes}
                      </dd>
                    </div>
                  </dl>
                ) : null}
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-[18px] border-[1.5px] border-[var(--border-default)] bg-white px-7 py-6">
            <p className="m-0 text-[16px] font-bold text-[var(--ink-900)]">
              {services.closingLine}
            </p>
            <Button href="/contact" arrow size="sm">
              {services.closingCta}
            </Button>
          </div>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section id="how-it-works" className={`${SECTION} scroll-mt-[92px]`}>
        <div className={WRAP}>
          <div className="text-center">
            <p className={EYEBROW}>{howItWorks.eyebrow}</p>
            <h2 className={`${H2} mx-auto max-w-[680px]`}>{howItWorks.title}</h2>
          </div>

          <ol className="mt-11 grid grid-cols-4 gap-5 to-980:grid-cols-2 to-520:grid-cols-1">
            {howItWorks.steps.map((step) => (
              <li
                key={step.n}
                className="rounded-[18px] border-[1.5px] border-[var(--border-default)] bg-white p-[26px]"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--accent)] text-[14px] font-bold text-white">
                  {step.n}
                </span>
                <h3 className="mt-5 text-[17px] font-bold text-[var(--ink-900)]">{step.title}</h3>
                <p className="mt-[10px] text-[14.5px] leading-[1.7] text-[var(--ink-600)]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Starter package ---- */}
      <section id="starter" className="scroll-mt-[92px] px-6 py-[clamp(72px,10vh,128px)]">
        <div className={WRAP}>
          <div className="grid grid-cols-[minmax(0,498px)_minmax(0,550px)] items-center gap-16 rounded-[24px] bg-[linear-gradient(135deg,#14503C,#0B3A2B)] p-[clamp(32px,5vw,56px)] text-white to-980:grid-cols-1 to-980:gap-10">
            <div>
              <p className="m-0 text-[11px] font-bold uppercase tracking-[2px] text-[#A7F3D0]">
                {starter.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-[clamp(28px,3.6vw,42px)] font-black leading-[1.12] tracking-[-1.1px] text-white">
                {starter.title}
              </h2>
              <p className="mt-[18px] text-[16px] leading-[1.75] text-white/[0.88]">
                {starter.lead}
              </p>
              <p className="mt-6 text-[15px] text-white/[0.88]">
                {starter.biggerPrompt}{" "}
                <Link href="/book-a-call" className="font-semibold text-[#A7F3D0] underline underline-offset-[3px]">
                  {starter.biggerCta}
                </Link>
              </p>
            </div>

            <div className="rounded-[20px] bg-white p-[clamp(26px,3vw,36px)] text-[var(--ink-600)]">
              <p className="m-0 flex items-baseline gap-2">
                <span className="font-display text-[48px] font-black leading-none tracking-[-1.6px] text-[var(--ink-900)]">
                  {starter.price}
                </span>
                <span className="text-[16px] text-[var(--text-muted)]">{starter.priceUnit}</span>
              </p>
              <p className="m-0 mt-2 text-[14px] text-[var(--ink-500)]">{starter.priceRate}</p>

              <p className="mt-6 text-[11px] font-bold uppercase tracking-[2px] text-[var(--accent-strong)]">
                {starter.includedTitle}
              </p>
              <ul className="mt-3 flex flex-col gap-[10px]">
                {starter.included.map((item) => (
                  <li key={item} className="flex gap-3 text-[14.5px] leading-[1.6] text-[var(--ink-600)]">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-[3px] flex-none" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <Button href={GHL_CHECKOUT_HREF} arrow fullWidth className="mt-7">
                {starter.cta}
              </Button>

              <p className="m-0 mt-4 text-[12.5px] leading-[1.6] text-[var(--text-muted)]">
                {starter.note}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Why partner ---- */}
      <section className={SECTION}>
        <div className={WRAP}>
          <div className="text-center">
            <p className={EYEBROW}>{why.eyebrow}</p>
            <h2 className={`${H2} mx-auto max-w-[620px]`}>{why.title}</h2>
          </div>

          <div className="mt-11 grid grid-cols-5 gap-[18px] to-980:grid-cols-3 to-700:grid-cols-2 to-520:grid-cols-1">
            {why.cards.map((card) => (
              <article
                key={card.title}
                className="rounded-[16px] border-[1.5px] border-[var(--border-default)] bg-white p-5"
              >
                <h3 className="text-[15.5px] font-bold leading-[1.35] text-[var(--ink-900)]">
                  {card.title}
                </h3>
                <p className="mt-[10px] text-[14px] leading-[1.65] text-[var(--ink-600)]">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Demo ---- */}
      <section id="demo" className={`${SECTION} scroll-mt-[92px] border-y-[1.5px] border-[var(--border-faint)] bg-[#FAFCFB]`}>
        <div className={`${WRAP} grid grid-cols-[minmax(0,419px)_minmax(0,629px)] items-center gap-16 to-980:grid-cols-1 to-980:gap-10`}>
          <div>
            <p className={EYEBROW}>{demo.eyebrow}</p>
            <h2 className={H2}>{demo.title}</h2>
            <p className="mt-[18px] text-[16px] leading-[1.75] text-[var(--ink-500)]">
              {demo.lead}
            </p>
          </div>

          <ol className="grid grid-cols-2 gap-[18px] to-520:grid-cols-1">
            {demo.steps.map((step, i) => (
              <li
                key={step}
                className="flex items-center gap-3 rounded-[16px] border-[1.5px] border-[var(--border-default)] bg-white px-5 py-[18px]"
              >
                <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-[#F0FAF6] text-[13px] font-bold text-[var(--accent-strong)]">
                  {i + 1}
                </span>
                <span className="text-[15px] font-semibold text-[var(--ink-900)]">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section id="faq" className={`${SECTION} scroll-mt-[92px]`}>
        <div className={`${WRAP} grid grid-cols-[minmax(0,393px)_minmax(0,655px)] items-start gap-16 to-980:grid-cols-1 to-980:gap-8`}>
          <div>
            <p className={EYEBROW}>{faq.eyebrow}</p>
            <h2 className={H2}>{faq.title}</h2>
            <p className="mt-[18px] text-[15.5px] leading-[1.7] text-[var(--ink-500)]">
              {faq.lead}{" "}
              <Link href="/book-a-call" className="font-semibold text-[var(--accent-strong)] underline underline-offset-[3px]">
                {faq.leadCta}
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {faq.items.map((item) => (
              <details
                key={item.q}
                className="group rounded-[14px] border-[1.5px] border-[var(--border-default)] bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="flex-1 text-[15.5px] font-semibold text-[var(--ink-900)]">
                    {item.q}
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent-strong)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="flex-none transition-transform duration-200 group-open:-rotate-180"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <p className="px-5 pb-[18px] text-[15px] leading-[1.7] text-[var(--ink-600)]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Final CTA ---- */}
      <section className="px-6 pb-[clamp(72px,10vh,128px)]">
        <div className={`${WRAP} rounded-[24px] border-[1.5px] border-[var(--border-default)] bg-[linear-gradient(135deg,#F0FAF6,#FFFFFF)] p-[clamp(32px,5vw,56px)] text-center`}>
          <h2 className={`${H2} mx-auto max-w-[680px]`}>{finalCta.title}</h2>
          <p className="mx-auto mt-[18px] max-w-[640px] text-[16px] leading-[1.75] text-[var(--ink-500)]">
            {finalCta.body}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button href="/book-a-call" arrow>
              {finalCta.primary}
            </Button>
            <Button href={GHL_CHECKOUT_HREF} variant="ghost">
              {finalCta.secondary}
            </Button>
          </div>
          <p className="m-0 mt-6 text-[13.5px] text-[var(--text-muted)]">{finalCta.tagline}</p>
        </div>
      </section>

      <SalesFooter anchorBase="/" />
    </div>
  );
}
