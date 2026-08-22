import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Sysora Eyebrow — the mint, uppercase, tracked-out label that tops every
 * marketing section as a navigation cue.
 */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mt-0 mb-3 text-[11px] font-bold tracking-[2px] uppercase text-[var(--accent)]",
        className,
      )}
    >
      {children}
    </p>
  );
}
