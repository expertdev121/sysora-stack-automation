import type { Metadata } from "next";

import { EstimateForm } from "@/components/sales/EstimateForm";
import { SalesFooter } from "@/components/sales/SalesFooter";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { estimate } from "@/content/landing/estimate";

export const metadata: Metadata = {
  title: estimate.meta.title,
  description: estimate.meta.description,
  alternates: { canonical: "/request-estimate" },
  openGraph: {
    title: estimate.meta.title,
    description: estimate.meta.description,
    url: "/request-estimate",
  },
};

export default function RequestEstimatePage() {
  return (
    <div className="font-sans bg-[linear-gradient(180deg,var(--surface-0)_0,var(--surface-1)_420px)] text-[var(--ink-600)]">
      <SalesHeader anchorBase="/" />

      <main className="max-w-[1160px] mx-auto px-6 pt-[clamp(36px,6vh,64px)] pb-[88px]">
        <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-[clamp(28px,4vw,56px)] items-start to-860:grid-cols-1">
          <aside className="sticky top-[104px] to-860:static">
            <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--accent-strong)]">
              {estimate.eyebrow}
            </span>
            <h1 className="mt-[14px] text-[clamp(32px,4vw,48px)] font-black tracking-[-1.3px] leading-[1.06] text-[var(--ink-900)]">
              {estimate.headline}
            </h1>
            <p className="mt-[18px] text-[16.5px] leading-[1.72] text-[var(--ink-500)]">
              {estimate.lead}
            </p>

            <div className="relative overflow-hidden mt-8 p-[26px] rounded-[20px] bg-[linear-gradient(150deg,#14503C,#1A6349)] text-white">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-[110px] -right-[90px] w-[260px] h-[260px] rounded-full bg-[radial-gradient(closest-side,rgba(0,200,150,0.28),rgba(0,200,150,0))]"
              />
              <p className="relative font-mono text-[10.5px] tracking-[1.4px] uppercase text-white/60">
                {estimate.flowLabel}
              </p>
              <ol className="relative list-none mt-[18px] mb-0 p-0 flex flex-col gap-[18px]">
                {estimate.flow.map(([title, body], i) => (
                  <li key={title} className="grid grid-cols-[32px_minmax(0,1fr)] gap-[14px]">
                    <span className="w-8 h-8 rounded-full grid place-items-center font-mono text-[12px] font-semibold bg-[rgba(0,200,150,0.18)] border-[1.5px] border-[rgba(0,200,150,0.5)] text-[var(--accent)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block text-[15px] font-bold">{title}</span>
                      <span className="block mt-[3px] text-[13.5px] leading-[1.6] text-white/[0.72]">
                        {body}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-wrap gap-2 mt-[18px]">
              {estimate.badges.map((badge, i) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-[7px] px-[13px] py-[7px] rounded-full bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] text-[12.5px] font-semibold text-[var(--ink-700)]"
                >
                  {i === 0 && (
                    <span className="w-[7px] h-[7px] rounded-full bg-[var(--accent)]" />
                  )}
                  {badge}
                </span>
              ))}
            </div>
          </aside>

          <EstimateForm />
        </div>
      </main>

      <SalesFooter anchorBase="/" />
    </div>
  );
}
