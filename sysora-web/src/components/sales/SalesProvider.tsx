"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { DEFAULT_PACK, packs } from "@/content/landing/sales";

export type Billing = "once" | "monthly";

type SalesState = {
  billing: Billing;
  setBilling: (b: Billing) => void;
  /** Index into `packs`, driven by the calculator chips. */
  pick: number;
  setPick: (i: number) => void;
};

const Ctx = createContext<SalesState | null>(null);

/**
 * The packages section and the calculator sit far apart on the page but
 * share one billing choice, exactly as the design does — switching to
 * monthly in either place switches it in both.
 */
export function SalesProvider({ children }: { children: ReactNode }) {
  const [billing, setBilling] = useState<Billing>("once");
  const [pick, setPick] = useState(DEFAULT_PACK);

  const value = useMemo(
    () => ({ billing, setBilling, pick, setPick }),
    [billing, pick],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSales() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSales must be used inside <SalesProvider>");
  return ctx;
}

export const money = (n: number) => "$" + n.toLocaleString("en-US");

/** Where a "buy N hours" click goes, carrying the choice with it. */
export function checkoutHref(hours: number, billing: Billing) {
  return `/checkout/hours?hours=${hours}&billing=${billing}`;
}

/** Bar width for a pack, scaled across the $10–$19 range like the design. */
export function rateBar(rate: number) {
  return Math.round(((rate - 10) / 9) * 100) + "%";
}

export { packs };
