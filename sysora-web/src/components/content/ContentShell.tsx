import Link from "next/link";
import type { ReactNode } from "react";

import { SalesFooter } from "@/components/sales/SalesFooter";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { Button } from "@/components/ui/Button";
import { allArticles, articlePath, type Faq } from "@/content/articles";
import { findStaticLabel } from "@/content/related";
import { JsonLd } from "@/components/seo/StructuredData";

import { Inline } from "./Inline";

/**
 * The frame every long-form page shares. It enforces the order the audit
 * asked for: breadcrumb, headline, a direct answer, the visible date,
 * then the body, so a page cannot skip the part machines extract.
 */

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function Breadcrumbs({ trail }: { trail: readonly { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[var(--ink-400)]">
        <li>
          <Link href="/" className="hover:text-[var(--accent-strong)]">
            Home
          </Link>
        </li>
        {trail.map((crumb, i) => (
          <li key={crumb.path} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {i === trail.length - 1 ? (
              <span aria-current="page" className="text-[var(--ink-600)]">
                {crumb.name}
              </span>
            ) : (
              <Link href={crumb.path} className="hover:text-[var(--accent-strong)]">
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function FaqList({ items }: { items: readonly Faq[] }) {
  return (
    <section className="mt-12 border-t-[1.5px] border-[var(--border-faint)] pt-8">
      <h2 className="font-display text-[clamp(22px,2.6vw,28px)] font-bold tracking-[-0.6px] text-[var(--ink-900)]">
        Frequently asked questions
      </h2>
      <dl className="mt-5 flex flex-col gap-5">
        {items.map((item) => (
          <div key={item.q}>
            <dt className="text-[16px] font-bold text-[var(--ink-900)]">{item.q}</dt>
            <dd className="mt-1 text-[15.5px] leading-[1.7] text-[var(--ink-600)]">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Label and destination for any internal path an article points at. */
function relatedLabel(path: string): string {
  const article = allArticles.find((a) => articlePath(a) === path);
  return article?.title ?? findStaticLabel(path);
}

export function RelatedLinks({ paths }: { paths: readonly string[] }) {
  return (
    <section className="mt-12 border-t-[1.5px] border-[var(--border-faint)] pt-8">
      <h2 className="font-display text-[clamp(20px,2.4vw,24px)] font-bold tracking-[-0.5px] text-[var(--ink-900)]">
        Related reading
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-1">
        {paths.map((path) => (
          <li key={path}>
            <Link
              href={path}
              className="flex items-center justify-between gap-4 rounded-[14px] border-[1.5px] border-[var(--border-default)] bg-white px-5 py-4 text-[15px] font-semibold text-[var(--ink-900)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--mint-50)]"
            >
              {relatedLabel(path)}
              <span aria-hidden="true" className="text-[var(--accent-strong)]">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PageCta() {
  return (
    <section className="mt-12 rounded-[20px] bg-[linear-gradient(135deg,#14503C,#0B3A2B)] p-[clamp(26px,4vw,40px)] text-white">
      <h2 className="font-display text-[clamp(22px,2.8vw,30px)] font-black tracking-[-0.7px] text-white">
        Send us the list
      </h2>
      <p className="mt-3 max-w-[560px] text-[15.5px] leading-[1.7] text-white/[0.88]">
        The smallest pack is $95 for 5 hours. Unused hours are refundable, and nothing starts until
        you approve the scope.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/pricing" variant="white" arrow>
          See the pricing
        </Button>
        <Button href="/book-a-call" variant="outlineWhite">
          Book a free call
        </Button>
      </div>
    </section>
  );
}

export function ContentShell({
  graph,
  trail,
  eyebrow,
  title,
  answer,
  updated,
  children,
  wide = false,
}: {
  graph: unknown;
  trail: readonly { name: string; path: string }[];
  eyebrow: string;
  title: string;
  answer: string;
  /** ISO date, shown on the page. */
  updated: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="font-sans bg-[linear-gradient(180deg,#F0FAF6_0,var(--surface-0)_420px)] text-[var(--ink-600)] overflow-x-clip">
      <JsonLd graph={graph} />
      <SalesHeader anchorBase="/" />

      <main className="mx-auto max-w-[1160px] px-6 pb-[clamp(56px,8vh,96px)] pt-[clamp(24px,4vh,40px)]">
        <div className={wide ? "" : "max-w-[780px]"}>
          <Breadcrumbs trail={trail} />
          <p className="mt-7 text-[11px] font-bold uppercase tracking-[2px] text-[var(--accent-strong)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-[clamp(32px,4.4vw,50px)] font-black leading-[1.08] tracking-[-1.2px] text-[var(--ink-900)]">
            {title}
          </h1>
          <p className="mt-5 max-w-[780px] rounded-[16px] border-[1.5px] border-[var(--border-default)] bg-white px-6 py-5 text-[17px] leading-[1.7] text-[var(--ink-700)]">
            {answer}
          </p>
          <p className="mt-3 text-[13px] text-[var(--ink-400)]">
            Last updated <time dateTime={updated}>{formatDate(updated)}</time>
          </p>
          {children}
        </div>
      </main>

      <SalesFooter anchorBase="/" />
    </div>
  );
}

export { Inline };
