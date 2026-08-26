/**
 * Money, in minor units, in two currencies.
 *
 * Everything is an integer — cents or paise — because a rupee amount
 * that has been through a float is a rupee amount you cannot reconcile
 * against a bank statement.
 *
 * INR is grouped the Indian way: ₹60,00,000, not ₹6,000,000. Getting
 * that wrong makes a number read as an order of magnitude off to
 * anybody who counts in lakhs, which is the whole audience here.
 */

export type Currency = "INR" | "USD";

export function formatMoney(minorUnits: number, currency: Currency = "INR"): string {
  const major = minorUnits / 100;
  const hasFraction = minorUnits % 100 !== 0;

  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(major);
}

/**
 * The short form for axis ticks and tight columns.
 *
 * Lakh and crore rather than K and M — ₹60L is what somebody would say
 * out loud, and "₹6.0M" would make them stop and convert.
 */
export function compactMoney(minorUnits: number, currency: Currency = "INR"): string {
  const major = minorUnits / 100;
  if (major === 0) return currency === "INR" ? "₹0" : "$0";

  const sign = major < 0 ? "-" : "";
  const size = Math.abs(major);

  if (currency === "INR") {
    if (size >= 10_000_000) return `${sign}₹${trim(size / 10_000_000)}Cr`;
    if (size >= 100_000) return `${sign}₹${trim(size / 100_000)}L`;
    if (size >= 1_000) return `${sign}₹${trim(size / 1_000)}K`;
    return `${sign}₹${Math.round(size)}`;
  }

  if (size >= 1_000_000) return `${sign}$${trim(size / 1_000_000)}M`;
  if (size >= 1_000) return `${sign}$${trim(size / 1_000)}K`;
  return `${sign}$${Math.round(size)}`;
}

/** One decimal, but not a trailing ".0". */
function trim(value: number): string {
  return value % 1 === 0 ? String(value) : value.toFixed(1);
}

/** Major units as typed, to the integer minor units we store. */
export function toMinorUnits(major: number): number {
  return Math.round(major * 100);
}

/**
 * What one payment implied, for display beside a row that has both.
 *
 * Never used to convert anything — it is a fact about that payment on
 * that day, not a rate the system may apply to other money.
 */
export function impliedRate(amountUsd: number | null, amountInr: number | null): number | null {
  if (!amountUsd || !amountInr) return null;
  return Math.round((amountInr / amountUsd) * 100) / 100;
}

/**
 * A derived figure, to the nearest whole unit.
 *
 * "₹26,568.81 a day" is precision nobody can act on and reads as false
 * accuracy. Stored amounts keep every paisa — this is for the pace
 * numbers the system works out, not the ones anybody typed.
 */
export function roundToUnit(minorUnits: number): number {
  return Math.round(minorUnits / 100) * 100;
}
