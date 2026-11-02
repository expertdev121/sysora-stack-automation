import { entity, siteConfig } from "@/config/site";
import { articlePath, type Article, type Faq } from "@/content/articles/types";
import { PAGES_UPDATED } from "@/content/pages";
import {
  calculator,
  faq as homeFaq,
  meta,
  moreReviews,
  packs,
  reviews,
} from "@/content/landing/sales";
import { ogImage, type OgKind } from "@/lib/seo";

/**
 * Every JSON-LD node on the site, built from the constants the pages
 * render, so the marked-up price, quote and answer cannot disagree with
 * the visible ones. Markup that contradicts the page is worse than none.
 *
 * Fields are left out rather than guessed. A founding date, a surname, a
 * phone number or a profile that does not exist yet is simply absent
 * until it is added to `entity` in config/site.ts.
 *
 * The Review nodes will not earn stars in Google, which has not shown
 * review snippets for a business's reviews of itself since 2019. They are
 * here so the proof can be read by machines, not to chase a rich result.
 */

const url = siteConfig.url;
const absolute = (path: string) => (path.startsWith("http") ? path : `${url}${path}`);

export const ORG_ID = `${url}/#organization`;
export const FOUNDER_ID = `${url}/about#founder`;
const WEBSITE_ID = `${url}/#website`;

/** Empty strings and empty lists never reach the output. */
function compact<T extends Record<string, unknown>>(node: T): T {
  return Object.fromEntries(
    Object.entries(node).filter(
      ([, value]) => value !== "" && value != null && !(Array.isArray(value) && value.length === 0),
    ),
  ) as T;
}

const orgRef = { "@id": ORG_ID };

const sameAs = (): string[] => [siteConfig.upwork, ...entity.companyProfiles];

export function organization() {
  return compact({
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteConfig.name,
    alternateName: "Sysora",
    url,
    description: siteConfig.description,
    email: siteConfig.email,
    telephone: entity.telephone,
    logo: {
      "@type": "ImageObject",
      url: `${url}/android-chrome-512x512.png`,
      width: 512,
      height: 512,
    },
    image: absolute(ogImage()),
    foundingDate: entity.foundingDate,
    founder: { "@id": FOUNDER_ID },
    address: compact({
      "@type": "PostalAddress",
      streetAddress: entity.streetAddress,
      addressLocality: entity.locality,
      addressRegion: entity.region,
      postalCode: entity.postalCode,
      addressCountry: entity.country,
    }),
    areaServed: [{ "@type": "Country", name: "United States" }],
    knowsAbout: [
      "GoHighLevel",
      "GoHighLevel SaaS Mode",
      "A2P 10DLC registration",
      "Marketing automation",
      "n8n",
      "Zapier",
      "Make.com",
      "CRM migration",
      "REST API integration",
      "Next.js",
      "Laravel",
    ],
    contactPoint: [
      compact({
        "@type": "ContactPoint",
        contactType: "customer support",
        email: siteConfig.email,
        telephone: entity.telephone,
        availableLanguage: ["English"],
        // Intake only. This says when a person receives a message, which
        // the site already states, and nothing about how fast work happens.
        hoursAvailable: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "00:00",
          closes: "23:59",
        },
      }),
    ],
    sameAs: sameAs(),
  });
}

/** A named reference, for pages that do not carry the full node. */
function orgStub() {
  return { "@type": "Organization", "@id": ORG_ID, name: siteConfig.name, url };
}

export function founder() {
  return compact({
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: entity.founderName,
    givenName: entity.founderGivenName,
    jobTitle: entity.founderTitle,
    worksFor: orgRef,
    url: `${url}/about`,
    image: absolute(entity.founderPhoto),
    description:
      "Founder of Sysora Stack. 1,220 hours logged across 19 Upwork engagements at a 100% Job Success Score, Top Rated, 5.0 on every completed job.",
    knowsAbout: [
      "GoHighLevel",
      "GoHighLevel SaaS Mode",
      "A2P 10DLC",
      "n8n",
      "Zapier",
      "Make.com",
      "React",
      "Node.js",
      "Next.js",
      "Laravel",
    ],
    sameAs: [siteConfig.upwork, entity.founderLinkedIn].filter(Boolean),
  });
}

function website() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url,
    name: siteConfig.name,
    publisher: orgRef,
  };
}

function webPage({
  path,
  name,
  description,
  type = "WebPage",
  og = "default",
  modified = PAGES_UPDATED,
}: {
  path: string;
  name: string;
  description: string;
  type?: string;
  og?: OgKind;
  modified?: string;
}) {
  const pageUrl = path === "/" ? url : absolute(path);
  return {
    "@type": type,
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    about: orgRef,
    primaryImageOfPage: absolute(ogImage(og)),
    dateModified: modified,
    inLanguage: "en-US",
  };
}

export function faqNode(items: readonly Faq[], path: string) {
  const pageUrl = path === "/" ? url : absolute(path);
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbs(trail: readonly { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.path === "/" ? url : absolute(crumb.path),
    })),
  };
}

function hoursService() {
  return {
    "@type": "Service",
    "@id": `${url}/#service`,
    name: "GoHighLevel, automation and development hours",
    serviceType: "GoHighLevel, automation and software development",
    provider: orgRef,
    areaServed: { "@type": "Country", name: "United States" },
    description:
      "Prepaid hours of GoHighLevel, automation and development work. No contract, unused hours refundable.",
    offers: packs.map((pack) => ({
      "@type": "Offer",
      name: `${pack.hours} prepaid hours`,
      price: pack.price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${url}/pricing`,
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

/** The quotation marks are the page's typography, not part of the review. */
const unquote = (text: string) => text.replace(/^["“]|["”]$/g, "");

function review(id: string, body: string, job: string) {
  return {
    "@type": "Review",
    "@id": `${url}/#review-${id}`,
    itemReviewed: orgRef,
    reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
    author: { "@type": "Person", name: `Upwork client, ${job}` },
    publisher: { "@type": "Organization", name: "Upwork" },
    reviewBody: unquote(body),
    url: siteConfig.upwork,
  };
}

function reviewNodes() {
  return [
    ...reviews.cards.map((card) => review(card.tag.toLowerCase(), card.quote, card.job)),
    ...moreReviews.cards.map((card, i) =>
      review(`small-${i + 1}`, card.quote, card.source.replace(/^Upwork review, /, "")),
    ),
    review(
      "funnel",
      calculator.quote,
      calculator.quoteSource.replace(/^Upwork review, /, "").split(".")[0],
    ),
  ];
}

const graph = (nodes: unknown[]) => ({ "@context": "https://schema.org", "@graph": nodes });

const HOME_CRUMB = { name: "Home", path: "/" };

export function homeGraph() {
  return graph([
    organization(),
    founder(),
    website(),
    webPage({ path: "/", name: `${meta.title} | ${siteConfig.name}`, description: meta.description }),
    hoursService(),
    ...reviewNodes(),
    faqNode(homeFaq.items, "/"),
  ]);
}

/** A plain page: its own node, a breadcrumb trail, and optionally an FAQ. */
export function pageGraph({
  path,
  name,
  description,
  type,
  og,
  crumbs,
  faq,
  extra = [],
  modified,
}: {
  path: string;
  name: string;
  description: string;
  type?: string;
  og?: OgKind;
  /** The trail after Home. */
  crumbs: readonly { name: string; path: string }[];
  faq?: readonly Faq[];
  extra?: unknown[];
  modified?: string;
}) {
  return graph([
    orgStub(),
    website(),
    webPage({ path, name, description, type, og, modified }),
    breadcrumbs([HOME_CRUMB, ...crumbs]),
    ...(faq && faq.length > 0 ? [faqNode(faq, path)] : []),
    ...extra,
  ]);
}

export function aboutGraph(name: string, description: string) {
  return graph([
    organization(),
    founder(),
    website(),
    webPage({ path: "/about", name, description, type: "AboutPage", og: "about" }),
    breadcrumbs([HOME_CRUMB, { name: "About", path: "/about" }]),
  ]);
}

export function pricingExtra() {
  return [hoursService()];
}

/** A hub's list of what it links to, in display order. */
export function itemList(items: readonly Article[]) {
  return {
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.title,
      url: absolute(articlePath(item)),
    })),
  };
}

const CRUMB: Record<Article["kind"], { name: string; path: string }> = {
  service: { name: "Services", path: "/services" },
  guide: { name: "Guides", path: "/guides" },
  "case-study": { name: "Case studies", path: "/case-studies" },
};

const OG: Record<Article["kind"], OgKind> = {
  service: "services",
  guide: "guides",
  "case-study": "case-studies",
};

export const articleOg = (article: Article) => OG[article.kind];

export function articleCrumbs(article: Article) {
  return [CRUMB[article.kind], { name: article.metaTitle, path: articlePath(article) }];
}

export function articleGraph(article: Article) {
  const path = articlePath(article);
  const pageUrl = absolute(path);

  const main =
    article.kind === "service"
      ? compact({
          "@type": "Service",
          "@id": `${pageUrl}#service`,
          name: article.title,
          description: article.description,
          url: pageUrl,
          provider: orgRef,
          areaServed: { "@type": "Country", name: "United States" },
          offers: { "@type": "AggregateOffer", priceCurrency: "USD", lowPrice: "95.00", highPrice: "1950.00", offerCount: packs.length, url: `${url}/pricing` },
        })
      : {
          "@type": "Article",
          "@id": `${pageUrl}#article`,
          headline: article.title,
          description: article.description,
          url: pageUrl,
          mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
          image: absolute(ogImage(OG[article.kind])),
          datePublished: article.published,
          dateModified: article.modified,
          author: { "@id": FOUNDER_ID },
          publisher: orgRef,
          inLanguage: "en-US",
        };

  return pageGraph({
    path,
    name: `${article.metaTitle} | ${siteConfig.name}`,
    description: article.description,
    og: OG[article.kind],
    crumbs: articleCrumbs(article),
    faq: article.faq,
    modified: article.modified,
    extra: [
      ...(article.kind === "service"
        ? []
        : [{ "@type": "Person", "@id": FOUNDER_ID, name: entity.founderName, url: `${url}/about` }]),
      main,
    ],
  });
}
