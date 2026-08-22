import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Shared frame for every page other than the landing page: same header,
 * same footer, same hero band. New pages only supply their own body.
 */
export function PageShell({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <div className="font-sans text-[var(--text-body)] bg-[var(--surface-0)] overflow-x-hidden">
      <SiteHeader />

      <section className="relative overflow-hidden px-6 pt-[clamp(72px,10vh,120px)] pb-[clamp(56px,8vh,88px)] bg-[linear-gradient(180deg,var(--surface-0)_0%,var(--mint-50)_100%)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[30%] -right-[10%] bottom-auto -left-[10%] h-[560px] bg-[radial-gradient(ellipse_50%_100%_at_50%_0%,rgba(0,200,150,0.14),transparent_68%)]"
        />
        <div className="relative max-w-[820px] mx-auto">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-0 mb-[22px] text-[clamp(34px,4.4vw,54px)] font-extrabold leading-[1.2] tracking-[-0.8px] text-[var(--ink-900)]">
            {title}
          </h1>
          {lead && (
            <p className="m-0 text-[19px] leading-[1.75] text-[var(--ink-600)]">{lead}</p>
          )}
        </div>
      </section>

      {children && (
        <section className="px-6 py-[clamp(72px,10vh,120px)]">
          <div className="max-w-[820px] mx-auto">{children}</div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
