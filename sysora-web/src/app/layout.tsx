import type { Metadata } from "next";
import { Geist, Geist_Mono, Lato, Roboto, Space_Grotesk } from "next/font/google";

import { siteConfig } from "@/config/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
  adjustFontFallback: false,
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
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
    default: "GoHighLevel, Automation & Dev Hours from $13/hr — Sysora Stack",
    template: "%s — Sysora Stack",
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
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
    title: "GoHighLevel, Automation & Dev Hours from $13/hr — Sysora Stack",
    description: siteConfig.description,
    url: "/",
    type: "website",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "GoHighLevel, Automation & Dev Hours from $13/hr — Sysora Stack",
    description: siteConfig.description,
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
      </body>
    </html>
  );
}
