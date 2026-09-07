/**
 * Every outbound destination on the site lives here.
 *
 * The landing page links to internal placeholder routes. When the real
 * checkout / form URLs exist, change them in this file only — nothing
 * else references a destination directly.
 */

export const routes = {
  home: "/",
  /** $49 Business Systems Review — the primary paid CTA. */
  systemsReview: "/systems-review",
  /** Free-to-submit build request. */
  buildRequest: "/build-request",
  /** On-Demand Systems Team, from $2,000/month. */
  systemsTeam: "/systems-team",
  /** The services catalogue — one page per service. */
  services: "/services",
  contact: "/contact",
  about: "/about",
  /** In-page anchor to the "Three ways to start" section. */
  waysToStart: "/#start",
} as const;

export const siteConfig = {
  name: "Sysora",
  tagline: "Your on-demand AI, automation and systems team.",
  description:
    "We design, build, fix, and manage the technology behind your operations.",
  email: "hello@sysora.com",
} as const;

export const navLinks = [
  { label: "The problem", href: "/#problem" },
  { label: "How we work", href: "/#how" },
  { label: "Proof", href: "/#proof" },
  { label: "Services", href: "/services" },
  { label: "Ways to start", href: "/#start" },
] as const;
