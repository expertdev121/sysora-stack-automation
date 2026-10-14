import type { NextConfig } from "next";

/**
 * Permanent redirects for the pages the one-offer cleanup removed.
 *
 * These are 301s rather than 404s because the pages were indexed and
 * some of them carried the best writing on the site — the A2P registry
 * mechanics in particular. A 404 throws away whatever authority they
 * accumulated; a 301 passes it to the page that now has to do all the
 * converting. When the blog arrives, the research in those pages comes
 * back as posts and these entries can point at them instead.
 *
 * /services/:slug is listed before /services so the more specific rule
 * matches first.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/services/:slug", destination: "/", permanent: true },
      { source: "/services", destination: "/", permanent: true },
      { source: "/about", destination: "/", permanent: true },
      { source: "/systems-review", destination: "/", permanent: true },
      { source: "/systems-team", destination: "/", permanent: true },
      { source: "/build-request", destination: "/request-estimate", permanent: true },
    ];
  },
};

export default nextConfig;
