"use client";

import { useState } from "react";

import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { routes } from "@/config/site";
import { router } from "@/content/landing/router";
import { cn } from "@/lib/cn";

/**
 * Three entry points, one panel. The reader picks the sentence that
 * sounds like their business and gets the route that matches.
 */
export function Router() {
  const [active, setActive] = useState(0);
  const stage = router.stages[active];

  return (
    <section id="router" className="px-6 py-[clamp(78px,10vh,126px)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[720px]">
          <Eyebrow className="text-[var(--mint-700)]">{router.eyebrow}</Eyebrow>
          <h2 className="text-[clamp(30px,3.6vw,46px)] font-black leading-[1.1] tracking-[-1px] text-[var(--ink-900)]">
            {router.headline}
          </h2>
          <p className="mt-4 mb-0 text-[16.5px] leading-[1.75] text-[var(--ink-500)]">
            {router.lead}
          </p>
        </div>

        <div className="flex flex-wrap gap-[10px] mt-8" role="tablist">
          {router.stages.map((s, i) => {
            const on = i === active;
            return (
              <button
                key={s.tab}
                type="button"
                role="tab"
                aria-selected={on}
                data-on={on ? "1" : "0"}
                onClick={() => setActive(i)}
                className={cn(
                  "sx-tab px-5 py-[11px] rounded-full border-[1.5px] text-[14.5px] font-semibold",
                  on
                    ? "border-[var(--accent-strong)] bg-[var(--accent-strong)] text-white"
                    : "border-[var(--border-default)] bg-[var(--surface-0)] text-[var(--ink-600)]",
                )}
              >
                {s.tab}
              </button>
            );
          })}
        </div>

        <div className="sx-card mt-5 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_3px_8px_rgba(0,80,50,0.05),0_22px_48px_rgba(0,80,50,0.09)] overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] to-860:grid-cols-1">
            <div className="p-[clamp(30px,3.4vw,44px)]">
              <h3 className="text-[clamp(24px,2.5vw,31px)] font-extrabold leading-[1.2] tracking-[-0.7px] text-[var(--ink-900)]">
                {stage.title}
              </h3>
              <p className="mt-4 mb-0 text-[17px] leading-[1.75] text-[var(--ink-500)]">
                {stage.body}
              </p>
              <div className="flex items-center gap-[10px] mt-[26px] pt-[22px] border-t-[1.5px] border-[var(--border-faint)]">
                <ArrowRightIcon size={17} strokeWidth={1.75} />
                <a href={routes.waysToStart} className="text-[15px] font-semibold">
                  {stage.route}
                </a>
              </div>
            </div>

            <div className="p-[clamp(26px,3vw,36px)] bg-[var(--mint-50)] border-l-[1.5px] border-[var(--border-faint)] to-860:border-l-0 to-860:border-t-[1.5px]">
              <p className="mt-0 mb-4 font-mono text-[10.5px] tracking-[1.3px] uppercase text-[var(--mint-700)]">
                {router.firstStepsLabel}
              </p>
              <div className="flex flex-col gap-[10px]">
                {stage.firstSteps.map((step) => (
                  <span
                    key={step}
                    className="flex gap-[10px] px-[15px] py-[13px] rounded-xl bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] text-[14.5px] leading-[1.55] text-[var(--ink-700)]"
                  >
                    <CheckIcon
                      size={15}
                      strokeWidth={2.4}
                      className="flex-none mt-[3px] text-[var(--accent)]"
                    />
                    <span>{step}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
