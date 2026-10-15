import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * robots.txt, which previously 404'd.
 *
 * Two things were missing as a result: a Sitemap: directive, so the
 * sitemap had to be found by guesswork, and any statement at all about
 * the AI crawlers. A 404 is not permission — several of these crawlers
 * treat an unreachable robots.txt conservatively — so the allows below
 * are said out loud rather than left to inference.
 *
 * The AI crawlers are allowed on purpose. The published hour prices and
 * the FAQ are exactly the material an assistant needs to answer "who
 * does GoHighLevel work by the hour", and being quotable there is worth
 * more here than withholding the text.
 *
 * Disallowed paths are the ones with nothing to rank: the admin, the
 * API, and the per-customer request and thank-you pages. /checkout/ is
 * disallowed for the same reason — a per-order page is nobody's landing
 * page — but /checkout/hours is the package picker the homepage links
 * to on every CTA, so it is allowed back in. The longer, more specific
 * Allow wins over the Disallow, which is how both Google and Bing match.
 */
export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["/admin/", "/api/", "/checkout/", "/request/"];
  /** Allowed back: the picker every homepage CTA points at. */
  const allowed = ["/", "/checkout/hours"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: allowed,
        disallow: privatePaths,
      },
      // Named explicitly so the policy is a statement, not an assumption.
      {
        userAgent: ["GPTBot", "ChatGPT-User", "OAI-SearchBot"],
        allow: allowed,
        disallow: privatePaths,
      },
      {
        userAgent: ["ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai"],
        allow: allowed,
        disallow: privatePaths,
      },
      {
        userAgent: ["PerplexityBot", "Perplexity-User"],
        allow: allowed,
        disallow: privatePaths,
      },
      {
        userAgent: "Google-Extended",
        allow: allowed,
        disallow: privatePaths,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
