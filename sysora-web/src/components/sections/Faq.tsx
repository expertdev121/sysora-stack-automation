import { Eyebrow } from "@/components/ui/Eyebrow";
import { PlusIcon } from "@/components/ui/Icon";
import { faq } from "@/content/landing/closing";

export function Faq() {
  return (
    <section id="faq" className="px-6 py-[clamp(78px,10vh,126px)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[640px]">
          <Eyebrow className="text-[var(--mint-700)]">{faq.eyebrow}</Eyebrow>
          <h2 className="text-[clamp(30px,3.6vw,46px)] font-black leading-[1.1] tracking-[-1px] text-[var(--ink-900)]">
            {faq.headline}
          </h2>
        </div>

        <div className="sx-faq mt-10 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_3px_8px_rgba(0,80,50,0.05),0_22px_48px_rgba(0,80,50,0.09)] overflow-hidden">
          {faq.items.map((item) => (
            <details key={item.n} className="border-b-[1.5px] border-[var(--border-faint)]">
              <summary className="flex items-center gap-4 px-[30px] py-[22px]">
                <span className="font-mono text-[12.5px] text-[var(--ink-300)]">{item.n}</span>
                <span className="flex-1 font-heading text-[17.5px] font-bold leading-[1.4] text-[var(--ink-900)]">
                  {item.q}
                </span>
                <span className="sx-chev flex-none inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] text-[var(--mint-700)]">
                  <PlusIcon size={14} />
                </span>
              </summary>
              <p className="m-0 pl-[74px] pr-[30px] pb-6 text-[16px] leading-[1.8] text-[var(--ink-500)]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
