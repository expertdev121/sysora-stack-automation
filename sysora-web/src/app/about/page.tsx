import { ContentShell, PageCta, RelatedLinks } from "@/components/content/ContentShell";
import { Inline } from "@/components/content/Inline";
import { entity, printedAddress, siteConfig } from "@/config/site";
import { PAGES_UPDATED, aboutPage as page } from "@/content/pages";
import { whoBuilt } from "@/content/landing/sales";
import { aboutGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const PATH = "/about";

export const metadata = pageMetadata({
  title: page.meta.title,
  description: page.meta.description,
  path: PATH,
  og: "about",
});

const H2 =
  "mt-11 font-display text-[clamp(22px,2.6vw,28px)] font-bold tracking-[-0.6px] text-[var(--ink-900)]";

/**
 * The page the founder and company entities hang from.
 *
 * It says "Nikhil" because that is the name the business has published so
 * far. Set `founderName` and `founderLinkedIn` in config/site.ts and this
 * page and the schema pick them up with no other change.
 */
export default function AboutPage() {
  return (
    <ContentShell
      graph={aboutGraph(`${page.meta.title} | Sysora Stack`, page.meta.description)}
      trail={[{ name: "About", path: PATH }]}
      eyebrow={page.eyebrow}
      title={page.title}
      answer={page.answer}
      updated={PAGES_UPDATED}
    >
      <div className="mt-9 grid grid-cols-[180px_minmax(0,1fr)] items-start gap-7 to-640:grid-cols-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entity.founderPhoto}
          alt={page.photoAlt}
          width={180}
          height={180}
          loading="lazy"
          className="block h-[180px] w-[180px] rounded-[18px] border-[1.5px] border-[var(--border-default)] object-cover"
        />
        <div>
          <p className="text-[19px] font-bold text-[var(--ink-900)]">{entity.founderName}</p>
          <p className="mt-1 text-[15px] text-[var(--ink-500)]">{entity.founderTitle}</p>
          <ul className="mt-3 flex flex-wrap gap-4 text-[14.5px]">
            <li>
              <a
                href={siteConfig.upwork}
                rel="noopener"
                className="font-semibold text-[var(--accent-strong)] underline underline-offset-[3px]"
              >
                {page.upworkLabel}
              </a>
            </li>
            {entity.founderLinkedIn ? (
              <li>
                <a
                  href={entity.founderLinkedIn}
                  rel="noopener"
                  className="font-semibold text-[var(--accent-strong)] underline underline-offset-[3px]"
                >
                  {page.linkedInLabel}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <h2 className={H2}>{page.bioTitle}</h2>
      {page.bio.map((paragraph) => (
        <p key={paragraph.slice(0, 32)} className="mt-4 text-[16px] leading-[1.75]">
          {paragraph}
        </p>
      ))}

      <h2 className={H2}>{page.recordTitle}</h2>
      <dl className="mt-5 grid grid-cols-4 gap-3 to-640:grid-cols-2">
        {page.record.map((figure) => (
          <div
            key={figure.label}
            className="rounded-[14px] border-[1.5px] border-[var(--border-faint)] bg-[var(--mint-50)] px-4 py-3"
          >
            <dd className="font-mono text-[20px] font-semibold text-[var(--ink-900)]">
              {figure.value}
            </dd>
            <dt className="mt-1 text-[12.5px] text-[var(--ink-500)]">{figure.label}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[15px] leading-[1.7]">
        <Inline text={page.recordNote} />
      </p>

      <h2 className={H2}>{page.stackTitle}</h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {whoBuilt.stack.map((item) => (
          <li
            key={item}
            className="rounded-full border-[1.5px] border-[var(--border-default)] px-3 py-[5px] font-mono text-[12.5px] text-[var(--ink-700)]"
          >
            {item}
          </li>
        ))}
      </ul>

      <h2 className={H2}>{page.notTitle}</h2>
      <ul className="mt-4 flex flex-col gap-[10px]">
        {page.not.map((line) => (
          <li key={line} className="relative pl-5 text-[16px] leading-[1.7]">
            <span
              aria-hidden="true"
              className="absolute left-0 top-[11px] h-[6px] w-[6px] rounded-full bg-[var(--accent)]"
            />
            {line}
          </li>
        ))}
      </ul>

      <h2 className={H2}>{page.contactTitle}</h2>
      <address className="mt-4 text-[16px] not-italic leading-[1.75]">
        {siteConfig.name}, {printedAddress()}
        <br />
        <a
          href={`mailto:${siteConfig.email}`}
          className="font-medium text-[var(--accent-strong)] underline underline-offset-[3px]"
        >
          {siteConfig.email}
        </a>
        {entity.telephone ? (
          <>
            <br />
            <a href={`tel:${entity.telephone}`}>{entity.telephone}</a>
          </>
        ) : null}
      </address>

      <RelatedLinks paths={["/case-studies", "/services", "/pricing"]} />
      <PageCta />
    </ContentShell>
  );
}
