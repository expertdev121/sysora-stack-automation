import { ReadingProgress } from "@/components/legal/ReadingProgress";
import { RichText } from "@/components/legal/RichText";
import { SalesFooter } from "@/components/sales/SalesFooter";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { legalNav } from "@/content/landing/sales";
import type { Block, LegalDoc } from "@/content/legal/types";

/**
 * Shell for both legal documents: reading-progress bar, a table of
 * contents that tracks the section you are in, and the numbered body.
 *
 * A server component, so the text ships once, in the HTML. Only the
 * scroll affordances are client-side, in ReadingProgress.
 */

function BlockView({ block }: { block: Block }) {
  switch (block.k) {
    case "h3":
      return (
        <h3 className="mt-8 mb-3 flex items-baseline gap-[10px] text-[17px] font-bold text-[var(--ink-900)]">
          {block.n ? (
            <span className="font-mono text-[13px] font-semibold text-[var(--accent-strong)]">
              {block.n}
            </span>
          ) : null}
          {block.title}
        </h3>
      );

    case "ul":
      return (
        <ul className="mt-4 flex flex-col gap-[10px]">
          {block.items.map((item) => (
            <li key={item} className="relative pl-[20px] text-[15.5px] leading-[1.7]">
              <span
                aria-hidden="true"
                className="absolute left-0 top-[10px] h-[5px] w-[5px] rounded-full bg-[var(--accent)]"
              />
              <RichText text={item} />
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div className="mt-5 overflow-hidden rounded-[14px] border-[1.5px] border-[var(--border-default)]">
          <table className="w-full border-collapse text-left text-[14.5px]">
            <thead>
              <tr className="bg-[var(--mint-50)]">
                {block.head.map((h) => (
                  <th
                    key={h}
                    className="border-b-[1.5px] border-[var(--border-default)] px-[18px] py-[12px] font-semibold text-[var(--ink-900)]"
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
                      className="border-t-[1.5px] border-[var(--border-faint)] px-[18px] py-[12px] leading-[1.6] text-[var(--ink-600)]"
                    >
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "formula":
      return (
        <p className="mt-5 rounded-[14px] border-[1.5px] border-[var(--border-default)] bg-[var(--mint-50)] px-[22px] py-[18px] text-center font-mono text-[15px] leading-[1.6] text-[var(--ink-800)]">
          {block.text}
        </p>
      );

    case "note":
      return (
        <div className="mt-5 rounded-[14px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-1)] px-[22px] py-[18px]">
          <p className="text-[15.5px] font-bold text-[var(--ink-900)]">{block.title}</p>
          <p className="mt-2 text-[15.5px] leading-[1.7] text-[var(--ink-600)]">
            <RichText text={block.text} />
          </p>
        </div>
      );

    default:
      return (
        <p className="mt-4 text-[15.5px] leading-[1.75] text-[var(--ink-600)]">
          {block.lead ? (
            <strong className="font-semibold text-[var(--ink-900)]">{block.lead}</strong>
          ) : null}
          <RichText text={block.text} />
        </p>
      );
  }
}

export function LegalDocPage({ doc }: { doc: LegalDoc }) {
  return (
    <div
      id="top"
      className="font-sans bg-[linear-gradient(180deg,var(--surface-0)_0,var(--surface-1)_420px)] text-[var(--ink-600)]"
    >
      <ReadingProgress />

      <SalesHeader anchorBase="/" items={legalNav} />

      <main className="mx-auto max-w-[1160px] px-6 pb-[96px] pt-[clamp(32px,5vh,56px)]">
        <header className="max-w-[760px]">
          <span className="text-[11px] font-bold uppercase tracking-[2px] text-[var(--accent-strong)]">
            {doc.eyebrow}
          </span>
          <h1 className="mt-[14px] font-display text-[clamp(34px,4.6vw,52px)] font-black leading-[1.08] tracking-[-1.2px] text-[var(--ink-900)]">
            {doc.title}
          </h1>
          <p className="mt-4 text-[17.5px] leading-[1.7] text-[var(--ink-600)]">{doc.lead}</p>
          <p className="mt-3 text-[13px] text-[var(--ink-400)]">Last updated {doc.updated}</p>
        </header>

        <div className="mt-10 grid grid-cols-[minmax(0,260px)_minmax(0,1fr)] items-start gap-[clamp(28px,4vw,56px)] to-980:grid-cols-1">
          <nav
            aria-label={doc.tocTitle}
            className="sticky top-[104px] rounded-[16px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] p-5 to-980:static"
          >
            <p className="text-[11px] font-bold uppercase tracking-[1.6px] text-[var(--ink-400)]">
              {doc.tocTitle}
            </p>
            <ol className="mt-3 flex flex-col gap-[2px]">
              {doc.sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    data-toc={s.id}
                    className="flex gap-[10px] rounded-[8px] px-2 py-[7px] text-[13.5px] leading-[1.45] text-[var(--ink-500)] transition-colors hover:bg-[var(--surface-1)] hover:text-[var(--ink-900)]"
                  >
                    <span className="font-mono text-[12px] text-[var(--ink-400)]">{s.n}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
            <a
              href="#top"
              className="mt-4 inline-block text-[13px] font-semibold text-[var(--accent-strong)] hover:underline"
            >
              {doc.backToTop}
            </a>
          </nav>

          <div className="min-w-0">
            <div className="max-w-[760px]">
              {doc.intro.map((b, i) => (
                <BlockView key={i} block={b} />
              ))}
            </div>

            {doc.sections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                data-sec={s.id}
                className="mt-12 max-w-[760px] border-t-[1.5px] border-[var(--border-faint)] pt-8 first:border-t-0"
              >
                <span className="font-mono text-[13px] font-semibold text-[var(--accent-strong)]">
                  {s.n}
                </span>
                <h2 className="mt-2 font-display text-[clamp(22px,2.6vw,28px)] font-bold leading-[1.2] tracking-[-0.6px] text-[var(--ink-900)]">
                  {s.title}
                </h2>
                {s.blocks.map((b, i) => (
                  <BlockView key={i} block={b} />
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>

      <SalesFooter anchorBase="/" />
    </div>
  );
}
