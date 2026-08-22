"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { SysoraLogo } from "@/components/ui/Logo";
import { navLinks, routes } from "@/config/site";

/**
 * Sticky site header. The desktop layout matches the source design exactly;
 * below 860px the inline links collapse into a drawer (the source simply
 * dropped them, which left phones with no navigation).
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-[20px] border-b-[1.5px] border-[var(--border-faint)]">
      <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between gap-6">
        <Link href={routes.home} className="flex items-center" aria-label="Sysora home">
          <SysoraLogo className="h-8 w-auto block" />
        </Link>

        <nav className="flex items-center gap-[30px] to-860:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14px] font-medium text-[var(--text-muted)] hover:text-[var(--accent-strong)] transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button size="sm" href={routes.waysToStart} className="to-520:hidden">
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
              href={routes.waysToStart}
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
