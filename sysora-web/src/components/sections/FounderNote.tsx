import { Eyebrow } from "@/components/ui/Eyebrow";
import { founderNote } from "@/content/landing/proof";

export function FounderNote() {
  if (!founderNote.show) return null;

  return (
    <section className="px-6 py-[clamp(104px,13vh,152px)]">
      <div className="max-w-[820px] mx-auto">
        <Eyebrow>{founderNote.eyebrow}</Eyebrow>
        <h2 className="mt-0 mb-8 text-[clamp(34px,4.4vw,54px)] font-extrabold leading-[1.2] tracking-[-0.8px] text-[var(--ink-900)]">
          {founderNote.headline}
        </h2>

        <div className="flex flex-col gap-5 text-[19px] leading-[1.75] text-[var(--ink-600)]">
          {founderNote.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="m-0">
              {paragraph}
            </p>
          ))}

          <p className="m-0 px-[30px] py-[26px] rounded-[18px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] text-[20px] font-semibold leading-[1.5] text-[var(--ink-900)]">
            {founderNote.highlight}
          </p>

          <p className="m-0">{founderNote.closing}</p>

          <div className="flex items-center gap-[14px] mt-3 pt-[26px] border-t-[1.5px] border-[var(--border-faint)]">
            <span className="w-10 h-10 rounded-full bg-[var(--mint-100)] border-[1.5px] border-[var(--border-default)] inline-flex items-center justify-center font-mono text-[15px] font-semibold text-[var(--mint-700)]">
              {founderNote.signature.initial}
            </span>
            <span className="flex flex-col">
              <span className="text-[15px] font-bold text-[var(--ink-900)]">
                {founderNote.signature.name}
              </span>
              <span className="text-[13px] text-[var(--text-muted)]">
                {founderNote.signature.role}
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
