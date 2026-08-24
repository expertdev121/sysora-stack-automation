/**
 * The ranges the filter offers, and how to read one out of a URL.
 *
 * A plain module, not part of RangeFilter: that component is
 * "use client", and anything exported from a client module can only be
 * rendered by the server, never called by it. The pages need to call
 * this while deciding what to fetch, so it lives on its own.
 */

export const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 180, label: "6 months" },
] as const;

export const DEFAULT_RANGE = 30;

/** Clamp whatever arrives in the URL to a range we actually offer. */
export function rangeFromParam(value: string | undefined): number {
  const asNumber = Number(value);
  return RANGES.some((r) => r.days === asNumber) ? asNumber : DEFAULT_RANGE;
}
