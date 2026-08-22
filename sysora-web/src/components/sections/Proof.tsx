"use client";

import Image from "next/image";
import { useState } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { CrownIcon, StarIcon, StarSoftIcon } from "@/components/ui/Icon";
import { proof } from "@/content/landing/proof";
import { VISIBLE_REVIEWS, reviews, type Review } from "@/content/landing/reviews";
import { cn } from "@/lib/cn";

const { founder } = proof;

function Stars({ className }: { className?: string }) {
  return (
    <span className={cn("flex gap-[2px]", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} />
      ))}
    </span>
  );
}

function Tag({ variant, children }: { variant: "mint" | "slate"; children: string }) {
  return (
    <span
      className={cn(
        "px-3 py-[6px] rounded-full border-[1.5px] text-[12px] font-semibold text-[var(--ink-500)]",
        variant === "mint"
          ? "bg-[var(--mint-50)] border-[var(--border-default)]"
          : "bg-[var(--surface-2)] border-[var(--line-slate)]",
      )}
    >
      {children}
    </span>
  );
}

function ReviewCard({ review, last }: { review: Review; last: boolean }) {
  return (
    <div
      className={cn(
        "px-8 py-[30px]",
        !last && "border-b-[1.5px] border-[var(--border-faint)]",
      )}
    >
      <p className="m-0 text-[18px] font-bold leading-[1.2] tracking-[-0.3px] text-[var(--ink-900)]">
        {review.title}
      </p>
      <div className="flex flex-wrap items-center gap-3 mt-[11px]">
        <Stars className="text-[#F97316]" />
        <span className="font-mono text-[13.5px] font-semibold text-[var(--ink-800)]">
          {review.rating}
        </span>
        <span className="w-px h-[14px] bg-[var(--line-slate)]" />
        <span className="text-[13px] text-[var(--ink-300)]">{review.date}</span>
      </div>

      {review.quotes.map((quote, i) => (
        <p
          key={i}
          className={cn(
            "mb-0 text-[15.5px] italic leading-[1.65] text-[var(--ink-600)]",
            i === 0 ? "mt-4" : "mt-[13px]",
          )}
        >
          {quote}
        </p>
      ))}

      {review.endorsements.length > 0 && (
        <>
          <p className="mt-5 mb-[9px] text-[13.5px] font-semibold text-[var(--ink-500)]">
            Endorsed by client
          </p>
          <div className="flex flex-wrap gap-2">
            {review.endorsements.map((tag) => (
              <Tag key={tag} variant="mint">
                {tag}
              </Tag>
            ))}
          </div>
        </>
      )}

      {review.contractTags.length > 0 && (
        <>
          <p className="mt-[18px] mb-[9px] text-[13.5px] font-semibold text-[var(--ink-500)]">
            Identified from contract
          </p>
          <div className="flex flex-wrap gap-2">
            {review.contractTags.map((tag) => (
              <Tag key={tag} variant="slate">
                {tag}
              </Tag>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Proof() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? reviews : reviews.slice(0, VISIBLE_REVIEWS);

  return (
    <section
      id="proof"
      className="px-6 py-[clamp(104px,13vh,152px)] bg-[var(--surface-tint)] border-t-[1.5px] border-b-[1.5px] border-[var(--border-default)]"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[780px]">
          <Eyebrow>{proof.eyebrow}</Eyebrow>
          <h2 className="mt-0 mb-[22px] text-[clamp(34px,4.4vw,54px)] font-extrabold leading-[1.2] tracking-[-0.8px] text-[var(--ink-900)]">
            {proof.headline}
            <span className="text-[var(--accent-strong)]">{proof.headlineAccent}</span>
          </h2>
          {proof.showDisclaimer && (
            <p className="m-0 text-[15px] leading-[1.75] text-[var(--ink-300)]">
              {proof.disclaimer}
            </p>
          )}
        </div>

        {/* Reviews */}
        <div className="p-card mt-12 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_4px_rgba(0,80,50,0.04),0_20px_44px_rgba(0,80,50,0.07)] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-8 py-[14px] bg-[var(--surface-1)] border-b-[1.5px] border-[var(--border-faint)]">
            <span className="font-mono text-[10.5px] tracking-[1.2px] uppercase text-[var(--ink-200)]">
              {proof.reviewsHeader.left}
            </span>
            <span className="text-[12.5px] font-semibold text-[var(--mint-700)]">
              {proof.reviewsHeader.right}
            </span>
          </div>

          {visible.map((review, i) => (
            <ReviewCard key={review.title} review={review} last={i === visible.length - 1} />
          ))}

          <div className="flex justify-center px-8 py-5 border-t-[1.5px] border-[var(--border-faint)] bg-[var(--surface-1)]">
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="px-[22px] py-[11px] rounded-[10px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] font-[inherit] text-[14px] font-semibold leading-[normal] text-[var(--mint-700)] cursor-pointer transition-colors duration-150 hover:bg-[var(--mint-50)]"
            >
              {showAll ? proof.showLess : proof.showMore}
            </button>
          </div>
        </div>

        {/* Founder profile + pull quote */}
        <div className="grid grid-cols-[minmax(300px,1.15fr)_minmax(280px,0.85fr)] gap-5 mt-8 items-stretch to-860:grid-cols-1 to-860:gap-8">
          <div className="p-card flex flex-col rounded-[20px] border-[1.5px] border-[var(--border-neutral)] bg-[var(--surface-0)] shadow-[0_2px_4px_rgba(0,80,50,0.04),0_20px_44px_rgba(0,80,50,0.07)] overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b-[1.5px] border-[var(--line-slate-2)] bg-[var(--surface-1)]">
              <span className="font-mono text-[10.5px] tracking-[1.2px] uppercase text-[var(--ink-200)]">
                {founder.cardLabel}
              </span>
              <span className="inline-flex items-center gap-[7px] text-[12.5px] font-semibold text-[#14A800]">
                <span className="w-[7px] h-[7px] rounded-full bg-[#14A800]" />
                {founder.availability}
              </span>
            </div>

            <div className="flex items-start gap-[18px] px-7 pt-[26px] pb-[22px]">
              <span className="relative flex-none w-[76px] h-[76px] rounded-full overflow-hidden border-[1.5px] border-[var(--line-slate)]">
                {founder.avatar ? (
                  <Image
                    src={founder.avatar}
                    alt={founder.name}
                    fill
                    sizes="76px"
                    // Portrait source: anchoring the crop to the top keeps the
                    // face centred in the circle instead of high in the frame.
                    className="object-cover object-top"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center bg-[#f2f1ef] text-[#6e6c66] text-[11px] select-none">
                    {founder.avatarPlaceholder}
                  </span>
                )}
              </span>

              <div className="flex-1 min-w-0">
                <p className="m-0 flex items-center gap-2 text-[22px] font-extrabold tracking-[-0.3px] text-[var(--ink-900)]">
                  {founder.name}
                  <span className="inline-flex items-center justify-center w-[19px] h-[19px] rounded-full bg-[#1D4ED8] text-white">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-[18px] mt-[14px]">
                  {founder.badges.map((badge) => (
                    <span
                      key={badge.label}
                      className="inline-flex items-center gap-[9px] text-[13.5px] font-bold text-[var(--ink-800)]"
                    >
                      {badge.kind === "jss" ? (
                        <span className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-full border-2 border-[#1D4ED8] text-[#1D4ED8]">
                          <CrownIcon />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-[7px] bg-[#1D4ED8] text-white">
                          <StarSoftIcon />
                        </span>
                      )}
                      {badge.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border-t-[1.5px] border-b-[1.5px] border-[var(--line-slate-2)]">
              {founder.stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={cn(
                    "px-6 py-5",
                    i < founder.stats.length - 1 &&
                      "border-r-[1.5px] border-[var(--line-slate-2)]",
                  )}
                >
                  <p className="m-0 font-mono text-[21px] font-semibold tracking-[-0.6px] text-[var(--ink-900)]">
                    {stat.value}
                  </p>
                  <p className="mt-[5px] mb-0 text-[12.5px] text-[var(--text-muted)]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="px-7 pt-6 pb-[26px]">
              <p className="m-0 text-[17px] font-bold leading-[1.2] tracking-[-0.3px] text-[var(--ink-900)]">
                {founder.headline}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {founder.skills.map((skill) => (
                  <Tag key={skill} variant="slate">
                    {skill}
                  </Tag>
                ))}
              </div>
              <div className="flex items-center gap-[10px] mt-5 pt-[18px] border-t-[1.5px] border-[var(--line-slate-2)]">
                <Stars className="text-[#14A800]" />
                <span className="text-[13px] text-[var(--ink-500)]">{founder.ratingLine}</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[20px] bg-[linear-gradient(150deg,#153826,#194430)] flex flex-col justify-center gap-4">
            <p className="m-0 text-[20px] font-bold leading-[1.2] text-white">
              {proof.pullQuote.title}
            </p>
            <p className="m-0 text-[15px] leading-[1.75] text-[var(--text-on-dark-muted)]">
              {proof.pullQuote.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
