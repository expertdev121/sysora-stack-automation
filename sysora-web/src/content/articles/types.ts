/**
 * The shape of every long-form page: services, guides and case studies.
 *
 * Content is data rather than JSX so that three things can be guaranteed
 * by one layout: the direct answer comes first, the date shows, and the
 * schema is generated from what is rendered. Inline `[label](/path)` makes
 * a link and `**text**` makes bold, and nothing else is parsed.
 */

export type ArticleBlock =
  | { k: "h2"; text: string }
  | { k: "h3"; text: string }
  | { k: "p"; text: string }
  | { k: "ul"; items: readonly string[] }
  | { k: "ol"; items: readonly string[] }
  | { k: "table"; head: readonly string[]; rows: readonly (readonly string[])[] }
  | { k: "code"; label: string; text: string }
  | { k: "note"; title: string; text: string }
  | { k: "quote"; paragraphs: readonly string[]; source: string };

export type ArticleKind = "service" | "guide" | "case-study";

export type Faq = { q: string; a: string };

export type Article = {
  kind: ArticleKind;
  slug: string;
  /** Small label over the headline. */
  eyebrow: string;
  /** The H1. */
  title: string;
  /** Without the brand suffix. 45 characters at most. */
  metaTitle: string;
  /** 155 characters at most. */
  description: string;
  /** The 40 to 60 word answer the page opens on. */
  answer: string;
  /** ISO dates. Shown on the page and carried in the schema. */
  published: string;
  modified: string;
  blocks: readonly ArticleBlock[];
  faq?: readonly Faq[];
  /** Where the factual claims come from, shown at the foot of the page. */
  sources?: readonly { label: string; url: string }[];
  /** Internal paths for the related block. */
  related: readonly string[];
};

const BASE: Record<ArticleKind, string> = {
  service: "/services",
  guide: "/guides",
  "case-study": "/case-studies",
};

export function articlePath(article: Pick<Article, "kind" | "slug">): string {
  return `${BASE[article.kind]}/${article.slug}`;
}

/** Published and last-reviewed date for the pages written in this pass. */
export const CONTENT_DATE = "2026-11-01";
