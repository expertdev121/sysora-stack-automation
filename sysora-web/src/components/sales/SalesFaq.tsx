import { faq } from "@/content/landing/sales";

export function SalesFaq() {
  return (
    <section
      id="faq"
      className="px-6 py-[clamp(78px,10vh,120px)] bg-[var(--surface-1)] border-t-[1.5px] border-[var(--border-faint)]"
    >
      <div className="max-w-[1160px] mx-auto grid grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] gap-[clamp(32px,5vw,72px)] items-start to-860:grid-cols-1">
        <div className="sticky top-[110px] to-860:static">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--accent-strong)]">
            {faq.eyebrow}
          </span>
          <h2 className="mt-[14px] text-[clamp(30px,3.6vw,44px)] font-black tracking-[-1.1px] leading-[1.1] text-[var(--ink-900)]">
            {faq.headline}
          </h2>
        </div>

        <div className="sx-faq rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.06)] overflow-hidden">
          {faq.items.map((item, i) => (
            <details
              key={item.q}
              className={
                i === faq.items.length - 1
                  ? ""
                  : "border-b-[1.5px] border-[var(--border-faint)]"
              }
            >
              <summary className="flex items-center justify-between gap-[18px] px-[26px] py-5">
                <span className="text-[16px] font-semibold leading-[1.45] text-[var(--ink-900)] transition-colors duration-200">
                  {item.q}
                </span>
                <svg className="sx-chev flex-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p className="px-[26px] pb-[22px] text-[15px] leading-[1.75] text-[var(--ink-500)]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
