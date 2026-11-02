import type { Article, ArticleBlock } from "@/content/articles";

import { FaqList, PageCta, RelatedLinks } from "./ContentShell";
import { Inline } from "./Inline";

const H2 =
  "mt-11 font-display text-[clamp(22px,2.6vw,28px)] font-bold leading-[1.2] tracking-[-0.6px] text-[var(--ink-900)]";

function Block({ block }: { block: ArticleBlock }) {
  switch (block.k) {
    case "h2":
      return <h2 className={H2}>{block.text}</h2>;

    case "h3":
      return <h3 className="mt-7 text-[18px] font-bold text-[var(--ink-900)]">{block.text}</h3>;

    case "p":
      return (
        <p className="mt-4 text-[16px] leading-[1.75] text-[var(--ink-600)]">
          <Inline text={block.text} />
        </p>
      );

    case "ul":
      return (
        <ul className="mt-4 flex flex-col gap-[10px]">
          {block.items.map((item) => (
            <li key={item} className="relative pl-5 text-[16px] leading-[1.7] text-[var(--ink-600)]">
              <span
                aria-hidden="true"
                className="absolute left-0 top-[11px] h-[6px] w-[6px] rounded-full bg-[var(--accent)]"
              />
              <Inline text={item} />
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol className="mt-4 flex flex-col gap-3">
          {block.items.map((item, i) => (
            <li key={item} className="flex gap-3 text-[16px] leading-[1.7] text-[var(--ink-600)]">
              <span className="mt-[2px] grid h-[26px] w-[26px] flex-none place-items-center rounded-full bg-[var(--mint-50)] text-[12.5px] font-bold text-[var(--accent-strong)]">
                {i + 1}
              </span>
              <span className="min-w-0">
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ol>
      );

    case "table":
      return (
        <div className="mt-5 overflow-x-auto rounded-[14px] border-[1.5px] border-[var(--border-default)]">
          <table className="w-full min-w-[480px] border-collapse text-left text-[14.5px]">
            <thead>
              <tr className="bg-[var(--mint-50)]">
                {block.head.map((h, i) => (
                  <th
                    key={`${h}-${i}`}
                    scope="col"
                    className="border-b-[1.5px] border-[var(--border-default)] px-[16px] py-[12px] font-semibold text-[var(--ink-900)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className={i % 2 ? "bg-[var(--surface-1)]" : ""}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="border-t-[1.5px] border-[var(--border-faint)] px-[16px] py-[12px] leading-[1.6] text-[var(--ink-600)]"
                    >
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "code":
      return (
        <figure className="mt-5">
          <figcaption className="mb-2 text-[13px] font-semibold text-[var(--ink-500)]">
            {block.label}
          </figcaption>
          <pre className="overflow-x-auto rounded-[14px] bg-[#0F3A2C] p-5 font-mono text-[13px] leading-[1.7] text-white/90">
            <code>{block.text}</code>
          </pre>
        </figure>
      );

    case "note":
      return (
        <aside className="mt-6 rounded-[14px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-1)] px-[22px] py-[18px]">
          <p className="text-[15px] font-bold text-[var(--ink-900)]">{block.title}</p>
          <p className="mt-2 text-[15px] leading-[1.7] text-[var(--ink-600)]">
            <Inline text={block.text} />
          </p>
        </aside>
      );

    case "quote":
      return (
        <figure className="mt-5 border-l-[3px] border-[var(--accent)] pl-5">
          <blockquote className="flex flex-col gap-3 text-[16.5px] leading-[1.7] text-[var(--ink-800)]">
            {block.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </blockquote>
          <figcaption className="mt-3 text-[13px] text-[var(--ink-400)]">{block.source}</figcaption>
        </figure>
      );
  }
}

export function ArticleBody({ article }: { article: Article }) {
  return (
    <>
      {article.blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}

      {article.faq && article.faq.length > 0 ? <FaqList items={article.faq} /> : null}

      {article.sources && article.sources.length > 0 ? (
        <section className="mt-12 border-t-[1.5px] border-[var(--border-faint)] pt-8">
          <h2 className="font-display text-[clamp(20px,2.4vw,24px)] font-bold tracking-[-0.5px] text-[var(--ink-900)]">
            Sources
          </h2>
          <ul className="mt-4 flex flex-col gap-2 text-[14.5px]">
            {article.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  rel="noopener nofollow"
                  className="text-[var(--accent-strong)] underline underline-offset-[3px]"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <RelatedLinks paths={article.related} />
      <PageCta />
    </>
  );
}
