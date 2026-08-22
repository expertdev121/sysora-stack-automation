import { PlusIcon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { faq } from "@/content/landing/closing";
import { cn } from "@/lib/cn";

export function Faq() {
  return (
    <section className="px-6 py-[clamp(104px,13vh,152px)] bg-[var(--surface-2)] border-t-[1.5px] border-b-[1.5px] border-[var(--border-faint)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[740px]">
          <Eyebrow>{faq.eyebrow}</Eyebrow>
          <h2 className="mt-0 mb-[22px] text-[clamp(34px,4.4vw,54px)] font-extrabold leading-[1.2] tracking-[-0.8px] text-[var(--ink-900)]">
            {faq.headline}
          </h2>
        </div>

        <div className="p-card mt-12 rounded-[22px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_4px_rgba(0,80,50,0.04),0_20px_44px_rgba(0,80,50,0.07)] overflow-hidden">
          {faq.items.map((item, i) => (
            <details
              key={item.question}
              className={cn(
                "faq-row",
                i < faq.items.length - 1 && "border-b-[1.5px] border-[var(--border-faint)]",
              )}
            >
              <summary className="flex items-center gap-5 px-[30px] py-[26px]">
                <span className="flex-none font-mono text-[13px] text-[var(--ink-100)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[19px] font-bold tracking-[-0.3px] leading-[1.2] text-[var(--ink-900)]">
                  {item.question}
                </span>
                <span className="faq-plus flex-none inline-flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] text-[var(--accent-strong)] transition-[transform,background-color,border-color,color] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
                  <PlusIcon />
                </span>
              </summary>
              <p className="m-0 pl-[74px] pr-[30px] pb-7 max-w-[78ch] text-[16px] leading-[1.75] text-[var(--ink-500)]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
