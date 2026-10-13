import { work } from "@/content/landing/sales";

const icons = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  nodes: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <path d="M8.5 6h7M18 8.5v7M7.8 7.8l8.4 8.4" />
    </>
  ),
  code: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" />,
} as const;

export function Work() {
  return (
    <section
      id="work"
      className="px-6 py-[clamp(78px,10vh,120px)] bg-[var(--surface-1)] border-y-[1.5px] border-[var(--border-faint)]"
    >
      <div className="max-w-[1160px] mx-auto">
        <div className="max-w-[720px]">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--accent-strong)]">
            {work.eyebrow}
          </span>
          <h2 className="mt-[14px] text-[clamp(30px,3.6vw,44px)] font-black tracking-[-1.1px] leading-[1.1] text-[var(--ink-900)]">
            {work.headline}
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mt-11 items-stretch">
          {work.cards.map((card) => (
            <article
              key={card.title}
              className="sx-card flex flex-col p-[30px] rounded-[18px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.07)]"
            >
              <span className="sx-accent-bar" />
              <span className="flex items-center justify-center w-[46px] h-[46px] mt-[22px] rounded-xl bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {icons[card.icon]}
                </svg>
              </span>
              <h3 className="mt-[18px] text-[21px] font-bold text-[var(--ink-900)]">
                {card.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.75] text-[var(--ink-500)]">{card.body}</p>
            </article>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-8 px-[26px] py-[22px] rounded-[16px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="flex-none" aria-hidden="true">
            <path d="M12 3l8 4v5c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V7z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <p className="text-[15.5px] leading-[1.65] text-[var(--ink-700)]">{work.callout}</p>
        </div>
      </div>
    </section>
  );
}
