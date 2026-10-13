"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { SysoraLogo } from "@/components/ui/Logo";
import { navLinks, routes } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * Sticky site header. The desktop layout matches the source design exactly;
 * below 860px the inline links collapse into a drawer (the source simply
 * dropped them, which left phones with no navigation).
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Once the page has moved at all, the header earns a shadow.
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 backdrop-blur-[20px] saturate-[140%] border-b-[1.5px] border-[var(--border-faint)]",
        "transition-[box-shadow,background] duration-[250ms] ease-out",
        stuck
          ? "bg-white/95 shadow-[0_1px_0_var(--border-faint),0_14px_34px_rgba(0,80,50,0.08)]"
          : "bg-white/90",
      )}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-[15px] flex items-center justify-between gap-7">
        <Link href={routes.home} className="flex items-center" aria-label="Sysora home">
          <SysoraLogo className="h-8 w-auto block" />
        </Link>

        <nav className="flex items-center gap-[26px] to-980:gap-5 to-860:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative py-2 px-[2px] text-[14px] font-medium text-[var(--text-muted)] transition-colors duration-[180ms] hover:text-[var(--ink-900)] after:content-[''] after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:rounded-[2px] after:bg-[var(--accent)] after:origin-left after:scale-x-0 after:transition-transform after:duration-[220ms] hover:after:scale-x-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 flex-none">
          <Link
            href={routes.waysToStart}
            className="text-[14px] font-semibold text-[var(--ink-700)] hover:text-[var(--accent-strong)] to-980:hidden"
          >
            Ways to start
          </Link>

          <Button size="sm" arrow href={routes.systemsReview} className="to-520:hidden">
            Start with the $49 review
          </Button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="hidden to-860:inline-flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border-[1.5px] border-[var(--border-default)] bg-white text-[var(--ink-800)] transition-colors duration-150 hover:bg-[var(--mint-50)] hover:border-[var(--accent)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? (
                <>
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </>
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="hidden to-860:block border-t-[1.5px] border-[var(--border-faint)] bg-white/95 backdrop-blur-[20px]"
        >
          <nav className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 px-2 rounded-[10px] text-[15px] font-semibold text-[var(--ink-800)] hover:bg-[var(--mint-50)] hover:text-[var(--accent-strong)] transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
            <Button
              size="md"
              arrow
              fullWidth
              href={routes.systemsReview}
              className="mt-3"
              onClick={() => setOpen(false)}
            >
              Start with the $49 review
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
