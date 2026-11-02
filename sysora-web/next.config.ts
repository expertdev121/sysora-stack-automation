import type { NextConfig } from "next";

/**
 * Permanent redirects.
 *
 * /services and /about are real pages again, so they no longer appear
 * here. The old catalogue's slugs point at the page that replaced each
 * one, which passes on whatever authority they earned, and the retired
 * systems audit goes to the hub because it has no direct replacement.
 *
 * /on-demand-ghl-team moved to /for/agencies so that the two audience
 * pages share a shape. The old URL must keep working, because it has
 * been shared and is on the announcement bar of cached pages.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/services/a2p-ghl-verification", destination: "/services/a2p-10dlc-registration", permanent: true },
      { source: "/services/gohighlevel-setup-rebuild", destination: "/services/gohighlevel-setup-and-rebuild", permanent: true },
      { source: "/services/funnel-website-build", destination: "/services/funnels-and-websites", permanent: true },
      { source: "/services/api-custom-integrations", destination: "/services/api-integrations", permanent: true },
      { source: "/services/crm-migration-data-cleanup", destination: "/services/crm-migration", permanent: true },
      { source: "/services/ai-agents-assistants", destination: "/services/ai-agents", permanent: true },
      { source: "/services/systems-audit-documentation", destination: "/services", permanent: true },
      { source: "/on-demand-ghl-team", destination: "/for/agencies", permanent: true },
      { source: "/hire-ghl-developer", destination: "/guides/hire-gohighlevel-developer", permanent: true },
      { source: "/systems-review", destination: "/", permanent: true },
      { source: "/systems-team", destination: "/", permanent: true },
      { source: "/build-request", destination: "/request-estimate", permanent: true },
    ];
  },
};

export default nextConfig;
