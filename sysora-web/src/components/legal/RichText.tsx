import Link from "next/link";
import type { ReactNode } from "react";

import { LEGAL_EMAIL } from "@/content/legal/contact";

/**
 * Renders the inline link tokens described in content/legal/types.ts.
 *
 * A regex split rather than a markdown parser: there are five token
 * shapes and no other formatting, and anything that accepted arbitrary
 * markup would let copy decide how the page is built.
 */

const TOKEN = /\{\{(mail|s:\d+\||privacy\||terms\||contact\|)[^}]*\}\}|\{\{mail\}\}/g;

const linkClass =
  "font-medium text-[var(--accent-strong)] underline decoration-[var(--line-300)] underline-offset-[3px] hover:decoration-[var(--accent-strong)]";

function render(token: string): ReactNode {
  const body = token.slice(2, -2);

  if (body === "mail") {
    return (
      <a href={`mailto:${LEGAL_EMAIL}`} className={linkClass}>
        {LEGAL_EMAIL}
      </a>
    );
  }

  const [kind, label] = body.split("|");

  if (kind.startsWith("s:")) {
    const id = `s-${kind.slice(2)}`;
    return (
      <a href={`#${id}`} className={linkClass}>
        {label}
      </a>
    );
  }

  const href =
    kind === "privacy" ? "/privacy-policy" : kind === "terms" ? "/terms" : "/contact";

  return (
    <Link href={href} className={linkClass}>
      {label}
    </Link>
  );
}

export function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;

  for (const m of text.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) parts.push(text.slice(last, i));
    parts.push(<span key={i}>{render(m[0])}</span>);
    last = i + m[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));

  return <>{parts}</>;
}
