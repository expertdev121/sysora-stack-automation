import { refund } from "@/content/landing/sales";

export function RefundGuarantee() {
  return (
    <section id="refund" className="px-6 pb-[clamp(78px,10vh,120px)]">
      <div className="max-w-[1160px] mx-auto">
        <div className="relative overflow-hidden p-[clamp(32px,5vw,56px)] rounded-[24px] bg-[linear-gradient(135deg,#047857,#065F46)] text-white shadow-[0_30px_70px_rgba(5,150,105,0.22)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[200px] -left-[120px] w-[520px] h-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(0,200,150,0.30),rgba(0,200,150,0))]"
          />
          <div className="relative grid grid-cols-2 gap-[clamp(28px,4vw,56px)] items-center to-860:grid-cols-1">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[2px] uppercase text-[#A7F3D0]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3l8 4v5c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V7z" />
                </svg>
                {refund.eyebrow}
              </span>
              <h2 className="mt-[14px] text-[clamp(28px,3.4vw,42px)] font-black tracking-[-1px] leading-[1.1] text-white">
                {refund.headline}
              </h2>
              <p className="mt-[18px] text-[16px] leading-[1.75] text-white/[0.88]">
                {refund.lead}
              </p>
            </div>

            <div className="rounded-[18px] bg-white/[0.08] border-[1.5px] border-white/[0.18] overflow-hidden">
              <div className="grid grid-cols-[1.2fr_0.8fr_1.3fr] gap-3 px-[22px] py-[14px] border-b-[1.5px] border-white/[0.14] font-mono text-[10.5px] tracking-[1.1px] uppercase text-white/70">
                {refund.tableHead.map((head) => (
                  <span key={head}>{head}</span>
                ))}
              </div>
              {refund.examples.map((row, i) => (
                <div
                  key={row.bought}
                  className={
                    "grid grid-cols-[1.2fr_0.8fr_1.3fr] gap-3 px-[22px] py-4 text-[14.5px] text-white/90 " +
                    (i === refund.examples.length - 1
                      ? ""
                      : "border-b-[1.5px] border-white/10 ") +
                    (i === 1 ? "bg-white/[0.06]" : "")
                  }
                >
                  <span>{row.bought}</span>
                  <span>{row.used}</span>
                  <span className="font-mono">
                    {row.maths}
                    <strong className="text-white">{row.total}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-7">
          <h3 className="text-[20px] font-bold text-[var(--ink-900)]">{refund.rulesTitle}</h3>
          <div className="mt-4 rounded-[18px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.06)] overflow-hidden">
            {refund.rules.map((rule, i) => (
              <div
                key={rule.label}
                className={
                  "grid grid-cols-[minmax(200px,0.4fr)_minmax(0,1fr)] gap-6 px-[26px] py-[18px] to-860:grid-cols-1 to-860:gap-[6px] " +
                  (i === refund.rules.length - 1
                    ? ""
                    : "border-b-[1.5px] border-[var(--border-faint)]")
                }
              >
                <span className="flex items-baseline gap-[10px] text-[15px] font-semibold text-[var(--ink-900)]">
                  <span className="font-mono text-[12.5px] font-semibold text-[var(--accent-strong)]">
                    {rule.n}
                  </span>
                  {rule.label}
                </span>
                <span className="text-[15px] leading-[1.7] text-[var(--ink-600)]">
                  {rule.body}
                  {/* "How to ask" carries the support address as a mailto. */}
                  {"email" in rule && rule.email ? (
                    <>
                      <a
                        href={`mailto:${rule.email}`}
                        className="font-medium text-[var(--accent-strong)] underline decoration-[var(--line-300)] underline-offset-[3px] hover:decoration-[var(--accent-strong)]"
                      >
                        {rule.email}
                      </a>
                      {"bodyTail" in rule ? rule.bodyTail : null}
                    </>
                  ) : null}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-[14px] mt-[18px]">
            <p className="max-w-[760px] text-[14px] leading-[1.7] text-[var(--ink-500)]">
              <strong className="text-[var(--ink-800)]">{refund.caveatTitle}</strong>
              {refund.caveatBody}
            </p>
            <a href="#refund" className="text-[14px] font-semibold">
              {refund.policyLink}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
