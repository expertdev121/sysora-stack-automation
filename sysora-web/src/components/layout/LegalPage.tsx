import type { ReactNode } from "react";

import { SalesFooter } from "@/components/sales/SalesFooter";
import { SalesHeader } from "@/components/sales/SalesHeader";

/**
 * Shell for the legal pages.
 *
 * Prose styling lives here rather than in each page so the two cannot
 * drift apart, and so a third legal page is a file of content and
 * nothing else. The `note` sits above the text because a reader deserves
 * to know it is a summary before reading it, not after.
 */
export function LegalPage({
  title,
  updated,
  note,
  children,
}: {
  title: string;
  updated: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div className="font-sans min-h-screen flex flex-col bg-[linear-gradient(180deg,var(--surface-0)_0,var(--surface-1)_420px)] text-[var(--ink-600)]">
      <SalesHeader anchorBase="/" />

      <main className="flex-1 px-6 pb-[72px] pt-[clamp(28px,4vh,48px)]">
        <article className="mx-auto w-full max-w-[720px]">
          <h1 className="font-display text-[clamp(32px,4.4vw,44px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-[var(--ink-900)]">
            {title}
          </h1>

          <p className="mt-3 text-[13px] text-[var(--ink-400)]">
            Last updated {updated}
          </p>

          {note ? (
            <p className="mt-6 rounded-[14px] border border-[var(--line-200)] bg-[var(--surface-2)] px-5 py-4 text-[14px] leading-[1.6] text-[var(--ink-500)]">
              {note}
            </p>
          ) : null}

          <div
            className="
              mt-8 text-[15px] leading-[1.75]
              [&_h2]:font-display [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-[20px]
              [&_h2]:font-bold [&_h2]:tracking-[-0.01em] [&_h2]:text-[var(--ink-900)]
              [&_p]:mt-4
              [&_ul]:mt-4 [&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:list-disc
              [&_strong]:font-semibold [&_strong]:text-[var(--ink-800)]
              [&_a]:font-medium [&_a]:text-[var(--accent-600)] [&_a]:underline
              [&_a]:decoration-[var(--line-300)] [&_a]:underline-offset-[3px]
              hover:[&_a]:decoration-[var(--accent-600)]
            "
          >
            {children}
          </div>
        </article>
      </main>

      <SalesFooter anchorBase="/" />
    </div>
  );
}
