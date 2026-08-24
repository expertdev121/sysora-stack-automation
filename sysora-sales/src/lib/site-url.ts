/**
 * The site's own origin, for links we generate server-side.
 *
 * Order matters. An explicit NEXT_PUBLIC_SITE_URL always wins, because on a
 * custom domain that's the only value that's right. Failing that, Vercel
 * sets VERCEL_URL per deployment — using it means an invite link sent from
 * a preview or from production never points at localhost just because
 * someone forgot to set a variable.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  // Vercel gives this without a protocol, e.g. "sysora.vercel.app".
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}
