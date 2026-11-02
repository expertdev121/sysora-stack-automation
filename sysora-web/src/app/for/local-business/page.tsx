import { ContentShell, PageCta, RelatedLinks } from "@/components/content/ContentShell";
import { Inline } from "@/components/content/Inline";
import { PAGES_UPDATED, localBusinessPage as page } from "@/content/pages";
import { audiences } from "@/content/landing/sales";
import { pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const PATH = "/for/local-business";

export const metadata = pageMetadata({
  title: page.meta.title,
  description: page.meta.description,
  path: PATH,
});

const H2 =
  "mt-11 font-display text-[clamp(22px,2.6vw,28px)] font-bold tracking-[-0.6px] text-[var(--ink-900)]";

/** The homepage's local-business band, given a URL of its own. */
export default function LocalBusinessPage() {
  const local = audiences.find((audience) => audience.id === "local")!;
  const crumbs = [{ name: "For local businesses", path: PATH }];

  return (
    <ContentShell
      graph={pageGraph({
        path: PATH,
        name: `${page.meta.title} | Sysora Stack`,
        description: page.meta.description,
        crumbs,
      })}
      trail={crumbs}
      eyebrow={page.eyebrow}
      title={page.title}
      answer={page.answer}
      updated={PAGES_UPDATED}
    >
      {local.paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 32)} className="mt-5 text-[16px] leading-[1.75]">
          {paragraph}
        </p>
      ))}

      <h2 className={H2}>What do the hours go on?</h2>
      <ul className="mt-4 flex flex-col gap-[10px]">
        {local.chips.map((chip) => (
          <li key={chip} className="relative pl-5 text-[16px] leading-[1.7]">
            <span
              aria-hidden="true"
              className="absolute left-0 top-[11px] h-[6px] w-[6px] rounded-full bg-[var(--accent)]"
            />
            {chip}
          </li>
        ))}
      </ul>

      <h2 className={H2}>What will we not promise?</h2>
      <p className="mt-4 text-[16px] leading-[1.75]">{local.noteBody}</p>

      <h2 className={H2}>{page.startTitle}</h2>
      <p className="mt-4 text-[16px] leading-[1.75]">
        <Inline text={page.startBody} />
      </p>

      <RelatedLinks paths={page.related} />
      <PageCta />
    </ContentShell>
  );
}
