import Link from "next/link";

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
          {/* The worked-example table that used to sit on the right is
              gone from the design: the lead paragraph already works the
              same sum, and the card now reads as one column capped at
              760px so the line length stays readable at full width. */}
          <div className="relative max-w-[760px]">
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
        </div>

        <div className="mt-7">
          <h3 className="text-[20px] font-bold text-[var(--ink-900)]">{refund.rulesTitle}</h3>
          {/* Eight <details>, two across, as the design has them: the
              rules are citable by number but should not out-shout the
              promise above, so each body stays folded until asked for. */}
          <div className="mt-4 grid grid-cols-2 items-start gap-3 to-860:grid-cols-1">
            {refund.rules.map((rule) => (
              <details
                key={rule.label}
                className="group rounded-[14px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)]"
              >
                <summary className="flex cursor-pointer list-none items-center gap-[14px] px-5 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-[8px] bg-[#F0FAF6] text-[11px] font-semibold text-[var(--accent-strong)]">
                    {rule.n}
                  </span>
                  <span className="flex-1 text-[15.5px] font-semibold text-[var(--ink-900)]">
                    {rule.label}
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent-strong)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="flex-none transition-transform duration-200 group-open:-rotate-180"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <p className="pb-[18px] pl-[62px] pr-5 text-[15px] leading-[1.7] text-[var(--ink-600)]">
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
                </p>
              </details>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-[14px] mt-[18px]">
            <p className="max-w-[760px] text-[14px] leading-[1.7] text-[var(--ink-500)]">
              <strong className="text-[var(--ink-800)]">{refund.caveatTitle}</strong>
              {refund.caveatBody}
            </p>
            {/* Was href="#refund", i.e. a link from this section to itself.
                The full policy is section 7 of the terms. */}
            <Link
              href="/terms#s-7"
              className="text-[14px] font-semibold text-[var(--accent-strong)] hover:underline"
            >
              {refund.policyLink}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
