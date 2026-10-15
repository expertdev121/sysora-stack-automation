"use client";

import { useEffect, useState } from "react";

/**
 * The two scroll affordances on a legal page: a progress bar, and a
 * table of contents that marks the section being read.
 *
 * This is the only client component on those pages. The documents
 * themselves are server-rendered, because handing 20KB of legal text to
 * a client component would serialize all of it into the RSC payload as
 * well as the HTML — the same text shipped twice, for the sake of a
 * scroll listener.
 *
 * It finds its targets in the DOM: `[data-sec]` for the sections and
 * `[data-toc]` for the matching links.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLElement>("[data-toc]"));
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-sec]"));

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);

      // The last section whose top has passed under the sticky header.
      let seen: string | null = null;
      for (const el of sections) {
        if (el.getBoundingClientRect().top < 140) seen = el.dataset.sec ?? null;
      }

      for (const link of links) {
        const on = Boolean(seen) && link.dataset.toc === seen;
        link.classList.toggle("bg-[var(--mint-50)]", on);
        link.classList.toggle("font-semibold", on);
        link.classList.toggle("text-[var(--accent-strong)]", on);
        link.classList.toggle("text-[var(--ink-500)]", !on);
        if (on) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 top-0 z-40 h-[3px] bg-[var(--accent)] transition-[width] duration-150"
      style={{ width: `${progress}%` }}
    />
  );
}
