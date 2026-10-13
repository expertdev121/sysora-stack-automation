import { Eyebrow } from "@/components/ui/Eyebrow";
import { capabilities } from "@/content/landing/capabilities";

export function Capabilities() {
  return (
    <section
      id="build"
      className="px-6 py-[clamp(78px,10vh,126px)] bg-[var(--surface-1)] border-y-[1.5px] border-[var(--border-faint)]"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[720px]">
          <Eyebrow className="text-[var(--mint-700)]">{capabilities.eyebrow}</Eyebrow>
          <h2 className="text-[clamp(30px,3.6vw,46px)] font-black leading-[1.1] tracking-[-1px] text-[var(--ink-900)]">
            {capabilities.headline}
          </h2>
          <p className="mt-4 mb-0 text-[17px] leading-[1.75] text-[var(--ink-500)]">
            {capabilities.lead}
          </p>
        </div>

        <div className="grid grid-cols-4 mt-11 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.07)] overflow-hidden to-980:grid-cols-2 to-640:grid-cols-1">
          {capabilities.groups.map((group) => (
            <div
              key={group.title}
              className="sx-row px-[26px] py-8 border-r-[1.5px] border-b-[1.5px] border-[var(--border-faint)] last:border-r-0"
            >
              <span aria-hidden="true" className="sx-accent-bar" />
              <h3 className="mt-5 mb-4 text-[17.5px] font-bold leading-[1.3] text-[var(--ink-900)]">
                {group.title}
              </h3>
              <div className="flex flex-col gap-3">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="flex gap-[9px] text-[14.5px] leading-[1.6] text-[var(--ink-500)]"
                  >
                    <span
                      aria-hidden="true"
                      className="flex-none w-[5px] h-[5px] mt-2 rounded-full bg-[var(--accent)]"
                    />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
