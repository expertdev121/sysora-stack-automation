import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { allArticles, articlePath } from "@/content/articles";
import { PAGES_UPDATED } from "@/content/pages";

/**
 * The sitemap.
 *
 * lastmod is the date the content last changed, from the content itself.
 * It used to be the time of the request, which told Google every page had
 * changed on every crawl and so told it nothing.
 *
 * /checkout/hours is deliberately not listed. It stays crawlable, because
 * robots.txt has a specific Allow for it, but it is a step in buying and
 * not a page anyone should arrive on from a search. Also absent: its
 * ?hours= variants, /checkout/[reference], /admin/* and the per-reference
 * request and thank-you pages, private to one customer.
 */

const PAGES: { path: string; priority: number; freq: "weekly" | "monthly" | "yearly" }[] = [
  { path: "", priority: 1, freq: "weekly" },
  { path: "/pricing", priority: 0.9, freq: "monthly" },
  { path: "/services", priority: 0.9, freq: "monthly" },
  { path: "/for/agencies", priority: 0.9, freq: "monthly" },
  { path: "/for/local-business", priority: 0.8, freq: "monthly" },
  { path: "/case-studies", priority: 0.8, freq: "monthly" },
  { path: "/guides", priority: 0.8, freq: "weekly" },
  { path: "/about", priority: 0.7, freq: "monthly" },
  { path: "/request-estimate", priority: 0.7, freq: "monthly" },
  { path: "/book-a-call", priority: 0.6, freq: "monthly" },
  { path: "/contact", priority: 0.5, freq: "monthly" },
  { path: "/privacy-policy", priority: 0.2, freq: "yearly" },
  { path: "/terms", priority: 0.2, freq: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

  return [
    ...PAGES.map((page) => ({
      url: `${base}${page.path}`,
      lastModified: PAGES_UPDATED,
      changeFrequency: page.freq,
      priority: page.priority,
    })),
    ...allArticles.map((article) => ({
      url: `${base}${articlePath(article)}`,
      lastModified: article.modified,
      changeFrequency: "monthly" as const,
      priority: article.kind === "guide" ? 0.7 : 0.8,
    })),
  ];
}
