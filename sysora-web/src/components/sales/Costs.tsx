import { costs } from "@/content/landing/sales";

export function Costs() {
  return (
    <section className="px-6 py-[clamp(64px,8vh,96px)] bg-[var(--surface-1)] border-y-[1.5px] border-[var(--border-faint)]">
      <div className="max-w-[1160px] mx-auto grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-[clamp(32px,5vw,72px)] items-start to-860:grid-cols-1">
        <div>
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--accent-strong)]">
            {costs.eyebrow}
          </span>
          <h2 className="mt-[14px] text-[clamp(30px,3.6vw,44px)] font-black tracking-[-1.1px] leading-[1.1] text-[var(--ink-900)]">
            {costs.headline}
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          {costs.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="text-[16px] leading-[1.75] text-[var(--ink-600)]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
