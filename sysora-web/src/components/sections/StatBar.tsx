"use client";

import { useEffect, useRef } from "react";

import { stats } from "@/content/landing/stats";

/**
 * The four-up bar that overlaps the bottom of the hero. Each figure counts
 * up once, the first time the bar comes into view. The final value is in
 * the markup, so it reads correctly without JavaScript and for anyone who
 * has asked for reduced motion.
 */
export function StatBar() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-count]"));
    const frames: number[] = [];

    const countUp = (node: HTMLElement) => {
      const to = Number(node.dataset.count);
      if (!to || node.dataset.done) return;
      node.dataset.done = "1";

      const prefix = node.dataset.prefix ?? "";
      const suffix = node.dataset.suffix ?? "";
      const start = performance.now();
      const duration = 1100;

      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        node.textContent =
          prefix + Math.round(to * eased).toLocaleString("en-US") + suffix;
        if (p < 1) frames.push(requestAnimationFrame(tick));
      };

      frames.push(requestAnimationFrame(tick));
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          countUp(entry.target as HTMLElement);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.4 },
    );

    nodes.forEach((n) => io.observe(n));

    return () => {
      io.disconnect();
      frames.forEach(cancelAnimationFrame);
    };
  }, []);

  return (
    <div className="relative bg-[linear-gradient(180deg,var(--mint-50)_0%,var(--surface-0)_58%)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div
          ref={ref}
          className="sx-card grid grid-cols-4 -mt-[46px] rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_4px_12px_rgba(0,80,50,0.07),0_26px_56px_rgba(0,80,50,0.12)] overflow-hidden to-860:grid-cols-2"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="sx-row relative px-7 py-[30px] border-r-[1.5px] border-[var(--border-faint)] last:border-r-0"
            >
              <span aria-hidden="true" className="sx-accent-bar" />
              <p
                data-count={stat.to}
                data-prefix={stat.prefix}
                data-suffix={stat.suffix}
                className="mt-[18px] mb-0 font-mono text-[clamp(28px,3vw,38px)] font-semibold tracking-[-1.4px] leading-none text-[var(--ink-900)]"
              >
                {stat.value}
              </p>
              <p className="mt-[10px] mb-0 text-[13.5px] leading-[1.55] text-[var(--text-muted)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
