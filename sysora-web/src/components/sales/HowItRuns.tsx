import { howItRuns } from "@/content/landing/sales";

export function HowItRuns() {
  return (
    <section id="how" className="px-6 py-[clamp(78px,10vh,120px)]">
      <div className="max-w-[1160px] mx-auto grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-[clamp(36px,5vw,80px)] items-start to-860:grid-cols-1">
        <div className="sticky top-[110px] to-860:static">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--accent-strong)]">
            {howItRuns.eyebrow}
          </span>
          <h2 className="mt-[14px] text-[clamp(30px,3.6vw,44px)] font-black tracking-[-1.1px] leading-[1.1] text-[var(--ink-900)]">
            {howItRuns.headline}
          </h2>
          <p className="mt-5 font-heading text-[19px] italic leading-[1.55] text-[var(--ink-600)]">
            {howItRuns.kicker}
          </p>
        </div>

        <ol className="list-none m-0 p-0">
          {howItRuns.steps.map((step) => (
            <li key={step.n} className="sx-rail-step">
              <span
                className={
                  "flex items-center justify-center w-[52px] h-[52px] rounded-[14px] font-mono text-[15px] font-semibold " +
                  ("highlight" in step && step.highlight
                    ? "bg-[var(--accent)] border-[1.5px] border-[var(--accent)] text-white shadow-[0_6px_16px_rgba(0,200,150,0.3)]"
                    : "bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] text-[var(--accent-strong)]")
                }
              >
                {step.n}
              </span>
              <div className="pt-1">
                <h3 className="text-[18px] font-bold text-[var(--ink-900)]">{step.title}</h3>
                <p className="mt-[6px] text-[15px] leading-[1.7] text-[var(--ink-500)]">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
