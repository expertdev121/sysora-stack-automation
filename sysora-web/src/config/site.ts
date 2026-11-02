/**
 * Every outbound destination on the site lives here.
 *
 * One offer: prepaid hour packs on the homepage, $19 down to $13. The
 * $49 Business Systems Review, the On-Demand Systems Team and the
 * services catalogue are gone — three offers competing on one site gave
 * a visitor three different answers to "what do you sell", and gave
 * Google three pages to rank instead of one.
 *
 * The anchors below are the ones the current homepage actually renders.
 * The previous set (#problem, #build, #engineering, #proof, #start)
 * belonged to a homepage that no longer exists, so every link in the old
 * nav scrolled nowhere.
 */

export const routes = {
  home: "/",
  /** The packages grid — the primary CTA target. */
  packages: "/#packages",
  /** The hour calculator. */
  calculator: "/#calculator",
  /** Refund guarantee. */
  refund: "/#refund",
  /** How the work runs once hours are bought. */
  how: "/#how",
  /** What we actually do with the hours. */
  work: "/#work",
  faq: "/#faq",
  /** Scope-first estimate form, for work too big to guess at in hours. */
  requestEstimate: "/request-estimate",
  contact: "/contact",
  privacy: "/privacy-policy",
  terms: "/terms",
} as const;

export const siteConfig = {
  name: "Sysora Stack",
  tagline: "GoHighLevel, automation and development hours. $19 down to $13.",
  description:
    "Prepaid GoHighLevel, automation and development hours. Send us the list, pay for the hours it takes. No contract, unused hours refundable.",
  /**
   * On sysorastack.com, not sysora.com: that domain is parked and for
   * sale, so mail to the old address never arrived anywhere.
   */
  email: "support@sysorastack.com",
  /**
   * The canonical host. Everything server-generated — canonicals, the
   * sitemap, OG URLs — derives from this one value.
   */
  url: "https://www.sysorastack.com",
  /**
   * The founder's Upwork profile: the only third-party corroboration of
   * the delivery record this site claims. It was quoted in prose and
   * linked nowhere, which left both the reviews and the 100%/19-job
   * figures unverifiable — by a reader or by a machine. It is now in
   * `sameAs` on the Organization schema and linked from both places the
   * page cites it.
   */
  upwork: "https://www.upwork.com/freelancers/~019b0e0fb5393a59a8",
} as const;

/**
 * The facts that make the company and its founder a checkable entity.
 *
 * Empty values are deliberate. They are facts only the business can
 * supply, and everything that reads them, the footer, /about, /contact
 * and the JSON-LD, leaves a field out rather than print a placeholder.
 * Filling one in here publishes it everywhere at once, which is also how
 * the same name and address stay identical across the site.
 */
export const entity = {
  /** Full legal name, surname included. First name only until supplied. */
  founderName: "Nikhil",
  founderGivenName: "Nikhil",
  founderTitle: "Founder and Lead Automation Engineer",
  founderPhoto: "/nikhil.jpg",
  founderLinkedIn: "",
  /** E.164, for example +919800000000. */
  telephone: "",
  foundingDate: "",
  streetAddress: "",
  postalCode: "",
  locality: "Jagadhri",
  region: "Haryana",
  country: "IN",
  countryName: "India",
  /** Add a profile here once it exists. Each one goes into sameAs. */
  companyProfiles: [] as readonly string[],
} as const;

/** The one printed form of the address, so it cannot differ between pages. */
export function printedAddress(): string {
  return [
    entity.streetAddress,
    entity.locality,
    entity.region,
    entity.postalCode,
    entity.countryName,
  ]
    .filter(Boolean)
    .join(", ");
}

export const navLinks = [
  { label: "Packages", href: "/#packages" },
  { label: "What we do", href: "/#work" },
  { label: "How it runs", href: "/#how" },
  { label: "Calculator", href: "/#calculator" },
  { label: "FAQ", href: "/#faq" },
] as const;
