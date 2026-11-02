import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

/**
 * One way to build a page's metadata.
 *
 * Every public page used to spell out its title, description, canonical,
 * Open Graph and Twitter blocks by hand, and between them they had no
 * og:image at all while declaring `summary_large_image`, so every share
 * rendered an empty card. Routing them through here means a page cannot
 * forget the image or the canonical.
 */

/** The 1200 by 630 share images in public/og, one per kind of page. */
export type OgKind = "default" | "services" | "guides" | "case-studies" | "agencies" | "about";

export const OG_DEFAULT = `/og/default.png`;

export function ogImage(kind: OgKind = "default"): string {
  return `/og/${kind}.png`;
}

export function pageMetadata({
  title,
  description,
  path,
  og = "default",
  type = "website",
  publishedTime,
  modifiedTime,
  absoluteTitle = false,
}: {
  /** Without the brand suffix, unless `absoluteTitle` is set. */
  title: string;
  description: string;
  path: string;
  og?: OgKind;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  absoluteTitle?: boolean;
}): Metadata {
  const full = `${title} | ${siteConfig.name}`;
  const images = [
    { url: ogImage(og), width: 1200, height: 630, alt: `${siteConfig.name}, ${title}` },
  ];

  return {
    title: absoluteTitle ? { absolute: full } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: full,
      description,
      url: path,
      siteName: siteConfig.name,
      images,
      ...(type === "article"
        ? { type: "article" as const, publishedTime, modifiedTime }
        : { type: "website" as const }),
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description,
      images: images.map((image) => image.url),
    },
  };
}
