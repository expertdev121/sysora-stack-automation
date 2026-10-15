/**
 * Block model for the legal pages.
 *
 * Both documents are long, numbered, cross-referenced prose with a few
 * tables. Keeping them as data rather than JSX means the copy can be
 * re-pulled from the design and diffed as text, which is how every other
 * content file in here works.
 *
 * Inline links live in the text as tokens, so a content file never
 * contains markup:
 *
 *   {{mail}}            the contact address, as a mailto
 *   {{s:7|Section 7}}   a cross-reference to section 7 of this document
 *   {{privacy|label}}   a link to /privacy-policy
 *   {{terms|label}}     a link to /terms
 *   {{contact|label}}   a link to /contact
 *
 * RichText is the only thing that knows how to render them.
 */

export type Block =
  /** A paragraph. `lead` is the bold run-in label the design puts first. */
  | { k: "p"; lead?: string; text: string }
  /** A numbered or unnumbered sub-heading, e.g. "3.1 Approved packages". */
  | { k: "h3"; n?: string; title: string }
  | { k: "ul"; items: readonly string[] }
  | { k: "table"; head: readonly string[]; rows: readonly (readonly string[])[] }
  /** The boxed refund formula. */
  | { k: "formula"; text: string }
  /** A tinted aside — the "two roles we play" pair, and similar. */
  | { k: "note"; title: string; text: string };

export type Section = {
  /** Anchor id, matching the design's s-1 … s-18. */
  id: string;
  /** Zero-padded display number. */
  n: string;
  title: string;
  blocks: readonly Block[];
};

export type LegalDoc = {
  eyebrow: string;
  title: string;
  lead: string;
  updated: string;
  tocTitle: string;
  /** Paragraphs above the first numbered section. */
  intro: readonly Block[];
  sections: readonly Section[];
  backToTop: string;
};
