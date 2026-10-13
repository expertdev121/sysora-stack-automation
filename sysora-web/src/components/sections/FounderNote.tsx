import { Eyebrow } from "@/components/ui/Eyebrow";
import { founderNote } from "@/content/landing/proof";

export function FounderNote() {
  return (
    <section id="founder" className="px-6 py-[clamp(78px,10vh,126px)]">
      <div className="max-w-[880px] mx-auto">
        <Eyebrow className="text-[var(--mint-700)]">{founderNote.eyebrow}</Eyebrow>
        <h2 className="text-[clamp(30px,3.6vw,46px)] font-black leading-[1.1] tracking-[-1px] text-[var(--ink-900)]">
          {founderNote.headline}
        </h2>

        <div className="flex flex-col gap-5 mt-[26px] pl-[clamp(0px,2.4vw,28px)] border-l-[3px] border-[var(--mint-300)]">
          <p className="m-0 text-[17.5px] leading-[1.8] text-[var(--ink-600)]">
            {founderNote.paragraphs[0]}
          </p>
          <p className="m-0 text-[17.5px] leading-[1.8] text-[var(--ink-600)]">
            {founderNote.paragraphs[1]}
          </p>
          <p className="m-0 text-[19.5px] font-bold leading-[1.7] text-[var(--ink-900)]">
            {founderNote.highlight}
          </p>
          <p className="m-0 text-[17.5px] leading-[1.8] text-[var(--ink-600)]">
            {founderNote.closing}
          </p>
        </div>

        <p className="mt-7 mb-0 pt-[22px] border-t-[1.5px] border-[var(--border-faint)] text-[14.5px] font-semibold text-[var(--ink-800)]">
          {founderNote.signature}
        </p>
      </div>
    </section>
  );
}
