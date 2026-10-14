import Link from "next/link";

import { CheckIcon } from "@/components/ui/Icon";
import { audiences, type StartPill } from "@/content/landing/sales";
import { cn } from "@/lib/cn";

function Pill({ pill }: { pill: StartPill }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-[6px] rounded-full font-mono text-[13px] font-semibold",
        pill.on
          ? "bg-[var(--accent)] text-white shadow-[0_6px_16px_rgba(0,200,150,0.28)]"
          : "bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] text-[var(--ink-900)]",
      )}
    >
      {pill.label}
    </span>
  );
}


export function Audiences() {
  return (
    <>
      {audiences.map((audience) => (
        <section
          key={audience.id}
          id={audience.id}
          className={cn(
            "relative overflow-hidden px-6 py-[clamp(78px,10vh,120px)]",
            audience.band,
          )}
        >
          <div
            className={cn(
              "max-w-[1160px] mx-auto grid grid-cols-2 gap-[clamp(36px,5vw,72px)] items-start",
              "to-900:grid-cols-1",
            )}
          >
            {/* ---- Picture, with two badges floating off its edges ---- */}
            <div
              className={cn(
                "relative sticky top-[110px] to-900:static",
                audience.reversed && "order-2 to-900:order-none",
              )}
            >
              <div
                aria-hidden="true"
                className="absolute -top-[18px] right-[18px] bottom-[18px] -left-[18px] rounded-[26px] bg-[linear-gradient(135deg,var(--mint-100),rgba(135,195,143,0.18))] z-0"
              />
              <div className="relative z-[1] aspect-[5/4] rounded-[22px] overflow-hidden border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] shadow-[0_4px_10px_rgba(0,80,50,0.06),0_34px_70px_rgba(0,80,50,0.16)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={audience.media.src}
                  alt={audience.media.alt}
                  width={500}
                  height={400}
                  className="block w-full h-full object-cover"
                />
              </div>

              <div className="absolute z-[2] top-[22px] -right-[14px] flex items-center gap-[10px] px-4 py-3 rounded-[14px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_16px_36px_rgba(0,80,50,0.16)]">
                <span className="grid place-items-center w-[34px] h-[34px] rounded-[10px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
                  <CheckIcon size={16} strokeWidth={2.4} className="text-[var(--accent-strong)]" />
                </span>
                <span>
                  <span className="block text-[13px] font-bold text-[var(--ink-900)]">
                    {audience.media.badges[0].title}
                  </span>
                  <span className="block text-[12px] text-[var(--ink-500)]">
                    {audience.media.badges[0].body}
                  </span>
                </span>
              </div>

              <div className="absolute z-[2] -bottom-[18px] left-6 flex items-center gap-[10px] px-4 py-3 rounded-[14px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_16px_36px_rgba(0,80,50,0.16)]">
                <span className="grid place-items-center w-[34px] h-[34px] rounded-[10px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
                  <CheckIcon size={16} strokeWidth={2.4} className="text-[var(--accent-strong)]" />
                </span>
                <span>
                  <span className="block text-[13px] font-bold text-[var(--ink-900)]">
                    {audience.media.badges[1].title}
                  </span>
                  <span className="block text-[12px] text-[var(--ink-500)]">
                    {audience.media.badges[1].body}
                  </span>
                </span>
              </div>
            </div>

            {/* ---- The pitch ---- */}
            <div className="flex flex-col">
              <span className="self-start inline-flex items-center gap-2 px-3 py-[6px] rounded-full bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] text-[11px] font-bold tracking-[1.4px] uppercase text-[var(--accent-strong)]">
                <span className="sx-dot w-[6px] h-[6px] rounded-full bg-[var(--accent)]" />
                {audience.badge}
              </span>

              <h2 className="mt-5 text-[clamp(28px,3.2vw,40px)] font-black tracking-[-1px] leading-[1.1] text-[var(--ink-900)]">
                {audience.headline}
              </h2>

              {audience.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 32)}
                  className="mt-4 text-[16px] leading-[1.75] text-[var(--ink-500)]"
                >
                  {paragraph}
                </p>
              ))}

              <p className="mt-[26px] font-mono text-[10.5px] tracking-[1.2px] uppercase text-[var(--ink-300)]">
                {audience.hoursLabel}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {audience.chips.map((chip) => (
                  <span key={chip} className="sx-chip-h">
                    <CheckIcon size={14} strokeWidth={2.4} className="text-[var(--accent)]" />
                    {chip}
                  </span>
                ))}
              </div>

              <div className="flex gap-[14px] mt-[22px] px-5 py-[18px] rounded-[14px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_14px_30px_rgba(0,80,50,0.07)]">
                <span className="flex-none grid place-items-center w-[34px] h-[34px] rounded-[10px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
                  <CheckIcon size={16} strokeWidth={2.4} className="text-[var(--accent-strong)]" />
                </span>
                <p className="text-[14px] leading-[1.7] text-[var(--ink-600)]">
                  <strong className="text-[var(--ink-900)]">{audience.noteTitle}</strong>{" "}
                  {audience.noteBody}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-[14px] mt-6 pt-[22px] border-t-[1.5px] border-[var(--border-faint)]">
                <div className="flex flex-col gap-[10px]">
                  <p className="font-mono text-[10.5px] tracking-[1.2px] uppercase text-[var(--ink-300)]">
                    {audience.startLabel}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {audience.startPills.map((pill) => (
                      <Pill key={pill.label} pill={pill} />
                    ))}
                    {audience.startMid && (
                      <span className="text-[13.5px] text-[var(--ink-500)]">
                        {audience.startMid}
                      </span>
                    )}
                    {audience.startPills2.map((pill) => (
                      <Pill key={`b-${pill.label}`} pill={pill} />
                    ))}
                    <span className="text-[13.5px] text-[var(--ink-500)]">
                      {audience.startTail}
                    </span>
                  </div>
                </div>
                <Link href={audience.href} className="text-[14px] font-semibold">
                  {audience.link}
                </Link>
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
