"use client";

import { useEffect } from "react";

/**
 * Fades each section up as it enters the viewport — every <section> inside the
 * page wrapper except the hero, which is already in view on load.
 */
export function ScrollReveal({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const blocks = Array.from(root.querySelectorAll("section")).slice(1);
    if (!blocks.length || !("IntersectionObserver" in window)) return;

    root.classList.add("reveal-on");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    blocks.forEach((el) => {
      el.classList.add("reveal");
      io.observe(el);
    });

    return () => io.disconnect();
  }, [rootId]);

  return null;
}
