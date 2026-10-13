"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { routes } from "@/config/site";
import { stickyBar } from "@/content/landing/closing";
import { cn } from "@/lib/cn";

/**
 * Appears once the reader is past the hero, and steps aside while the
 * "Three ways to work with us" section is on screen. Hidden below 700px.
 */
export function StickyCtaBar() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const offers = document.getElementById("offers");
      const y = window.scrollY || document.documentElement.scrollTop;
      let nearOffer = false;
      if (offers) {
        const rect = offers.getBoundingClientRect();
        nearOffer = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
      }
      setOn(y > 1200 && !nearOffer);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "cta-bar fixed left-0 right-0 bottom-0 z-40 px-6 py-[14px] bg-[rgba(10,31,20,0.96)] backdrop-blur-[18px] border-t-[1.5px] border-[rgba(0,200,150,0.24)]",
        on && "is-on",
      )}
    >
      <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-[14px]">
        <span className="flex flex-col">
          <span className="text-[15px] font-bold text-white">{stickyBar.title}</span>
          <span className="text-[13px] text-white/55">{stickyBar.subtitle}</span>
        </span>
        <span className="flex flex-wrap gap-[10px]">
          <Button size="sm" arrow href={routes.systemsReview}>
            {stickyBar.primary}
          </Button>
          <Button size="sm" variant="outlineWhite" href={routes.buildRequest}>
            {stickyBar.secondary}
          </Button>
        </span>
      </div>
    </div>
  );
}
