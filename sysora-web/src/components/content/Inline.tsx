import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The two inline marks article copy may use: `[label](/path)` and
 * `**bold**`. A regex rather than a markdown parser, so that copy cannot
 * decide how the page is built. The internal-link test reads the same
 * `[label](/path)` shape, which is why a bad link fails the build.
 */
const TOKEN = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;

const linkClass =
  "font-medium text-[var(--accent-strong)] underline decoration-[var(--line-mint)] underline-offset-[3px] hover:decoration-[var(--accent-strong)]";

export function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;

  for (const m of text.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) parts.push(text.slice(last, i));

    if (m[1] && m[2]) {
      parts.push(
        <Link key={i} href={m[2]} className={linkClass}>
          {m[1]}
        </Link>,
      );
    } else {
      parts.push(
        <strong key={i} className="font-semibold text-[var(--ink-900)]">
          {m[3]}
        </strong>,
      );
    }
    last = i + m[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
