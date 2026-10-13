import Link from "next/link";

import { audiences } from "@/content/landing/sales";

export function Audiences() {
  return (
    <section className="px-6 py-[clamp(78px,10vh,120px)]">
      <div className="max-w-[1160px] mx-auto grid grid-cols-2 gap-6 items-stretch to-860:grid-cols-1">
        {audiences.map((audience) => (
          <article
            key={audience.id}
            id={audience.id}
            className="sx-card flex flex-col p-9 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.07)]"
          >
            <span className="self-start px-3 py-[6px] rounded-full bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] text-[11px] font-bold tracking-[1.4px] uppercase text-[var(--accent-strong)]">
              {audience.badge}
            </span>

            <h2 className="mt-5 text-[clamp(26px,2.8vw,34px)] font-black tracking-[-0.8px] leading-[1.12] text-[var(--ink-900)]">
              {audience.headline}
            </h2>

            {audience.paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={
                  (i === 0 ? "mt-4" : "mt-3") +
                  " text-[15.5px] leading-[1.75] text-[var(--ink-500)]"
                }
              >
                {paragraph}
              </p>
            ))}

            <p className="mt-[22px] font-mono text-[10.5px] tracking-[1.2px] uppercase text-[var(--ink-300)]">
              {audience.hoursLabel}
            </p>
            <p className="mt-2 text-[14.5px] leading-[1.75] text-[var(--ink-600)]">
              {audience.hoursBody}
            </p>

            <p className="mt-[18px] px-[18px] py-4 rounded-xl bg-[var(--surface-1)] border-[1.5px] border-[var(--border-faint)] text-[14px] leading-[1.7] text-[var(--ink-600)]">
              <strong className="text-[var(--ink-900)]">{audience.noteTitle}</strong>{" "}
              {audience.noteBody}
            </p>

            <div className="flex-1" />

            <div className="flex flex-wrap items-center justify-between gap-[14px] mt-6 pt-5 border-t-[1.5px] border-[var(--border-faint)]">
              <p className="text-[14px] leading-[1.6] text-[var(--ink-700)]">
                <strong>{audience.startTitle}</strong> {audience.startBody}
              </p>
              <Link href={audience.href} className="text-[14px] font-semibold">
                {audience.link}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
