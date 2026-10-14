import { siteConfig } from "@/config/site";
import { faq, packs } from "@/content/landing/sales";

/**
 * JSON-LD for the homepage.
 *
 * There was none anywhere on the site, while the page itself published
 * seven hour prices and a fourteen-question FAQ — the exact material
 * these schemas exist to describe.
 *
 * Everything below is generated from the same constants the page renders,
 * so the marked-up price and the displayed price cannot disagree. That
 * matters more than it sounds: a rate card in a hand-written script is
 * one edit away from telling Google $19 while the page says $13, and
 * markup that contradicts the page is worse than no markup.
 *
 * Deliberately not here: Service and Offer entries for the retired
 * catalogue, and the A2P FAQPage. Those pages are gone, and schema for a
 * page that 301s is a claim about something that no longer exists.
 */

/** Only emit a profile link once there is one; an empty sameAs is noise. */
const SAME_AS: string[] = [
  // Upwork profile goes here — the one piece of third-party corroboration
  // we have, and currently quoted in prose where no machine can follow it.
].filter(Boolean);

function organization() {
  return {
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.email,
    logo: `${siteConfig.url}/sysora-logo.svg`,
    ...(SAME_AS.length > 0 ? { sameAs: SAME_AS } : {}),
  };
}

function offerCatalogue() {
  return {
    "@type": "Service",
    "@id": `${siteConfig.url}/#service`,
    name: "GoHighLevel, automation and development hours",
    serviceType: "GoHighLevel, automation and software development",
    provider: { "@id": `${siteConfig.url}/#organization` },
    areaServed: "Worldwide",
    description:
      "Prepaid hours of GoHighLevel, automation and development work. No contract, unused hours refundable.",
    offers: packs.map((pack) => ({
      "@type": "Offer",
      name: `${pack.hours} prepaid hours`,
      price: pack.price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}/#packages`,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: pack.rate.toFixed(2),
        priceCurrency: "USD",
        unitCode: "HUR",
        description: `$${pack.rate} an hour at ${pack.hours} hours`,
      },
    })),
  };
}

function faqPage() {
  return {
    "@type": "FAQPage",
    "@id": `${siteConfig.url}/#faq`,
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function HomeStructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      organization(),
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        publisher: { "@id": `${siteConfig.url}/#organization` },
      },
      offerCatalogue(),
      faqPage(),
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Server-rendered from our own constants, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
