import type { Metadata } from "next";
import { Geist, Geist_Mono, Lato, Roboto, Space_Grotesk } from "next/font/google";

import { Analytics } from "@/components/seo/Analytics";
import { siteConfig } from "@/config/site";
import { OG_DEFAULT } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

/*
 * Only the fonts above the fold are preloaded: Geist for body text and
 * Lato for the H1. Seven preloaded font files were competing with the
 * largest contentful paint on every page, so the others load when they
 * are first used. `display: swap` keeps text visible while they do.
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  preload: false,
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
  adjustFontFallback: false,
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  preload: false,
});

/**
 * metadataBase is the single source of every absolute URL Next generates:
 * canonicals, OG urls, the sitemap's base. It pointed at sysora.com — a
 * domain that is parked and for sale — which told Google the authoritative
 * copy of all 16 pages lived somewhere we do not control. That one line is
 * why a brand-plus-category search returned nothing from this site.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "GoHighLevel & Automation Hours From $13/hr | Sysora Stack",
    template: "%s | Sysora Stack",
  },
  description: siteConfig.description,
  // Empty until the site is verified in each tool, and then set in the
  // environment rather than here. See docs/operations.md.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  // src/app/favicon.ico is served at /favicon.ico by the file convention
  // and covers legacy browsers; the SVG is what modern ones actually use.
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "GoHighLevel & Automation Hours From $13/hr | Sysora Stack",
    description: siteConfig.description,
    type: "website",
    siteName: siteConfig.name,
    images: [{ url: OG_DEFAULT, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GoHighLevel & Automation Hours From $13/hr | Sysora Stack",
    description: siteConfig.description,
    images: [OG_DEFAULT],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${lato.variable} ${roboto.variable}`}
    >
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
