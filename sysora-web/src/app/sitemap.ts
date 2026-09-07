import type { MetadataRoute } from "next";

import { listPublishedServices } from "@/lib/sales/services";

/**
 * The sitemap, including one entry per published service.
 *
 * Services are database rows, so a hand-maintained list would go stale
 * the first time somebody adds one from the dashboard — which is the
 * only way they get added. Drafts are excluded because the pages 404.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://sysora.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/services`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/systems-review`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/systems-team`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/build-request`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  let services: MetadataRoute.Sitemap = [];
  try {
    services = (await listPublishedServices()).map((s) => ({
      url: `${base}/services/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch {
    // A sitemap that renders without the database beats a 500 at /sitemap.xml.
  }

  return [...staticPages, ...services];
}
