import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * The sitemap.
 *
 * Every URL here was previously on sysora.com — a domain this site does
 * not own. Google discards a sitemap whose URLs sit outside the host's
 * own domain, so the effect was not "a sitemap with some wrong links"
 * but no working sitemap at all.
 *
 * It is now a short hand-written list, because the site is a short list:
 * one offer, one estimate form, contact and the two legal pages. The
 * previous version enumerated published services from the database;
 * those pages are gone, and a sitemap that queries the database to list
 * nothing is just a way to fail at request time.
 *
 * /checkout/hours is listed: it is the page every CTA on the homepage
 * points at, so leaving it out of both the sitemap and robots made the
 * site's main conversion step uncrawlable.
 *
 * Deliberately absent: the ?hours= variants of it, which are seven
 * near-duplicates of one page; /checkout/[reference]; /admin/*; and the
 * per-reference request and thank-you pages, private to one customer.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const lastModified = new Date();

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/request-estimate`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/checkout/hours`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/on-demand-ghl-team`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/book-a-call`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/privacy-policy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${base}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
