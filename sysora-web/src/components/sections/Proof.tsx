"use client";

import { useEffect, useState } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { StarIcon } from "@/components/ui/Icon";
import { proof } from "@/content/landing/proof";
import { reviews } from "@/content/landing/reviews";
import { cn } from "@/lib/cn";

/**
 * The review carousel. It advances itself every seven seconds, and stops
 * doing that for anyone who has asked for reduced motion. The arrows and
 * dots work either way.
 */
export function Proof() {
  const [idx, setIdx] = useState(0);
  const review = reviews[idx];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % reviews.length), 7000);
    return () => clearInterval(id);
  }, []);

  const prev = () => setIdx((i) => (i - 1 + reviews.length) % reviews.length);
  const next = () => setIdx((i) => (i + 1) % reviews.length);

  return (
    <section
      id="proof"
      className="px-6 py-[clamp(78px,10vh,126px)] bg-[var(--surface-1)] border-y-[1.5px] border-[var(--border-faint)]"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[780px]">
          <Eyebrow className="text-[var(--mint-700)]">{proof.eyebrow}</Eyebrow>
          <h2 className="text-[clamp(30px,3.6vw,46px)] font-black leading-[1.1] tracking-[-1px] text-[var(--ink-900)]">
            {proof.headline}
          </h2>
          <p className="mt-[18px] mb-0 text-[17px] leading-[1.75] text-[var(--ink-500)]">
            {proof.lead}
          </p>
        </div>

        <div className="sx-card mt-11 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_3px_8px_rgba(0,80,50,0.05),0_22px_48px_rgba(0,80,50,0.09)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-[30px] py-[15px] bg-[var(--surface-1)] border-b-[1.5px] border-[var(--border-faint)]">
            <span className="font-mono text-[10.5px] tracking-[1.2px] uppercase text-[var(--ink-300)]">
              {proof.carousel.label}
            </span>
            <span className="text-[12.5px] font-semibold text-[var(--mint-700)]">
              {proof.carousel.rating}
            </span>
          </div>

          <div className="px-[30px] py-8 min-h-[230px]">
            <p className="m-0 text-[18px] font-bold leading-[1.35] text-[var(--ink-900)]">
              {review.title}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-[11px]">
              <span className="flex gap-[2px] text-[#F97316]">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon key={i} size={14} />
                ))}
              </span>
              <span className="font-mono text-[13.5px] font-semibold text-[var(--ink-800)]">
                5.0
              </span>
              <span className="w-px h-[14px] bg-[var(--line-slate)]" />
              <span className="text-[13px] text-[var(--ink-300)]">{review.dates}</span>
            </div>

            {review.quote.map((para, i) => (
              <p
                key={i}
                className="mt-[15px] mb-0 text-[15.5px] italic leading-[1.8] text-[var(--ink-600)]"
              >
                {para}
              </p>
            ))}

            {review.note && (
              <div className="mt-4 px-5 py-[18px] rounded-[14px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
                <p className="m-0 text-[15px] leading-[1.75] text-[var(--ink-700)]">
                  {review.note}
                </p>
                <div className="flex flex-wrap gap-[7px] mt-[14px]">
                  {review.stack.map((s) => (
                    <span
                      key={s}
                      className="px-[11px] py-[5px] rounded-full bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] font-mono text-[11px] text-[var(--mint-700)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-[14px] px-[30px] py-4 border-t-[1.5px] border-[var(--border-faint)]">
            <span className="flex items-center gap-2">
              {reviews.map((r, i) => (
                <button
                  key={r.title}
                  type="button"
                  aria-label={`Show review ${i + 1}`}
                  aria-current={i === idx}
                  onClick={() => setIdx(i)}
                  className={cn(
                    "h-2 p-0 rounded-full border-none cursor-pointer transition-all duration-200",
                    i === idx
                      ? "w-[22px] bg-[var(--accent-strong)]"
                      : "w-2 bg-[var(--line-slate)]",
                  )}
                />
              ))}
            </span>

            <span className="flex items-center gap-[14px]">
              <span className="font-mono text-[12px] text-[var(--ink-300)]">
                {idx + 1} of {reviews.length}
              </span>
              <span className="flex gap-2">
                <button
                  type="button"
                  aria-label="Previous review"
                  onClick={prev}
                  className="sx-tab inline-flex items-center justify-center w-[38px] h-[38px] rounded-[10px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-700)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 12H5M11 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next review"
                  onClick={next}
                  className="sx-tab inline-flex items-center justify-center w-[38px] h-[38px] rounded-[10px] bg-[var(--accent-strong)] border-[1.5px] border-[var(--accent-strong)]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </span>
            </span>
          </div>

          <p className="m-0 px-[30px] py-[14px] bg-[var(--surface-1)] text-[12.5px] leading-[1.6] text-[var(--ink-300)]">
            {proof.carousel.footnote}
          </p>
        </div>

        <div className="grid grid-cols-[minmax(300px,1fr)_minmax(0,1.25fr)] gap-6 mt-6 items-stretch to-860:grid-cols-1">
          <div className="sx-card p-[30px] rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.07)]">
            <p className="mt-0 mb-5 font-mono text-[10.5px] tracking-[1.2px] uppercase text-[var(--ink-300)]">
              {proof.profile.label}
            </p>
            <div className="grid grid-cols-2 gap-[18px]">
              {proof.profile.figures.map((f) => (
                <span key={f.label} className="flex flex-col gap-1">
                  <span
                    className={cn(
                      "font-mono text-[24px] font-semibold tracking-[-0.8px]",
                      "accent" in f && f.accent
                        ? "text-[var(--mint-700)]"
                        : "text-[var(--ink-900)]",
                    )}
                  >
                    {f.value}
                  </span>
                  <span className="text-[12.5px] text-[var(--text-muted)]">{f.label}</span>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-[7px] mt-6 pt-[22px] border-t-[1.5px] border-[var(--border-faint)]">
              {proof.profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-[6px] rounded-full bg-[var(--surface-2)] border-[1.5px] border-[var(--line-slate)] text-[12px] font-semibold text-[var(--ink-500)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="sx-card flex flex-col justify-center p-[34px] rounded-[20px] bg-[var(--forest-hero)] border-[1.5px] border-[rgba(0,200,150,0.24)]">
            <p className="mt-0 mb-[14px] font-mono text-[10.5px] tracking-[1.3px] uppercase text-[var(--accent)]">
              {proof.pattern.label}
            </p>
            <p className="m-0 text-[19px] font-bold leading-[1.55] text-white">
              {proof.pattern.lead}
            </p>
            <p className="mt-4 mb-0 text-[15.5px] leading-[1.8] text-white/[0.68]">
              {proof.pattern.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
