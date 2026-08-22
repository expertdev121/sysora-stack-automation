/** Formats minor units for display: (4900, 'USD') → "$49". */
export function formatMoney(minorUnits: number, currency = "USD"): string {
  const major = minorUnits / 100;
  const hasCents = minorUnits % 100 !== 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(major);
}
