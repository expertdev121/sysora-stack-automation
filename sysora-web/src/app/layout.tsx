import type { Metadata } from "next";
import { Geist, Geist_Mono, Lato, Roboto, Space_Grotesk } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://sysora.com"),
  title: {
    default: "Sysora — Your on-demand AI, automation and systems team",
    template: "%s — Sysora",
  },
  description:
    "We design, build, fix, and manage the technology behind your operations. Your people spend less time moving information between tools, and more time on the work that moves the business forward.",
  icons: {
    icon: "/sysora-mark.svg",
  },
  openGraph: {
    title: "Sysora — Your on-demand AI, automation and systems team",
    description:
      "We design, build, fix, and manage the technology behind your operations. Start with the $49 Business Systems Review.",
    type: "website",
    siteName: "Sysora",
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
