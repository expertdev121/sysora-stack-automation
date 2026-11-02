import Link from "next/link";

import { articlePath, type Article } from "@/content/articles";

/** The card grid on the three hubs. */
export function ArticleGrid({ items }: { items: readonly Article[] }) {
  return (
    <ul className="mt-9 grid grid-cols-2 gap-5 to-700:grid-cols-1">
      {items.map((item) => (
        <li key={item.slug}>
          <Link
            href={articlePath(item)}
            className="flex h-full flex-col rounded-[18px] border-[1.5px] border-[var(--border-default)] bg-white p-6 transition-colors hover:border-[var(--accent)] hover:bg-[var(--mint-50)]"
          >
            <span className="text-[11px] font-bold uppercase tracking-[1.4px] text-[var(--accent-strong)]">
              {item.eyebrow}
            </span>
            <span className="mt-3 text-[18px] font-bold leading-[1.3] text-[var(--ink-900)]">
              {item.title}
            </span>
            <span className="mt-2 text-[14.5px] leading-[1.65] text-[var(--ink-600)]">
              {item.description}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
