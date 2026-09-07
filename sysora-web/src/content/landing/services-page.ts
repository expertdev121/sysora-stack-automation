import { routes } from "@/config/site";

/**
 * Copy for the /services catalogue page.
 *
 * The services themselves are database rows, edited in the dashboard. This
 * is only the chrome around them: the hero, the section headings, and the
 * closing call to action.
 *
 * The price chips are written here rather than derived from the rows,
 * because two of the four are offers rather than services -- the $49 review
 * and the $2,000/mo managed team have their own pages and checkouts. A
 * figure computed from the services table would quietly drop them.
 */
export const servicesPage = {
  eyebrow: "Services and pricing",
  headline: { lead: "Fixed scope.", accent: "Fixed price." },
  intro:
    "Every service below is a job with a defined start, a defined end, and a price you see before you commit. Pick the one that matches your problem, or send us the problem and we will tell you which it is.",

  /** Keep in step with the rows and with the offers on the landing page. */
  priceChips: [
    { label: "Systems review", value: "$49" },
    { label: "A2P 10DLC", value: "from $249" },
    { label: "Builds", value: "from $499" },
    { label: "Managed team", value: "$2,000/mo" },
  ],

  primaryCta: { label: "See all services and prices", href: "#all-services" },
  secondaryCta: { label: "Get a quote", href: routes.contact },

  hero: {
    imageAlt: "Hero image — team or systems dashboard shot",
    // Both already stated on the landing page; kept identical on purpose so
    // the same claim is never phrased two different ways on one site.
    ratingEyebrow: "Rated on 17 contracts",
    ratingLine: "Every project 5.0",
  },

  grid: {
    heading: "Everything else we build",
    /** Suffix; the count comes from however many rows are published. */
    metaSuffix: "prices shown",
  },

  priceFootnote:
    "Prices are starting points for a typical job. Final scope and price are confirmed in writing before any work begins.",

  closing: {
    heading: "Not sure which one you need",
    body: "Send the problem, not the spec. We come back with the service that fits, the scope, and the price before anyone commits.",
    primary: { label: "Submit a build request", href: routes.buildRequest },
    secondary: { label: "Get the $49 systems review", href: routes.systemsReview },
    note: "Free to submit. No obligation to hire us.",
  },
} as const;
