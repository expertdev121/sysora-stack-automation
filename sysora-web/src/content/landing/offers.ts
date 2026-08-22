import { routes } from "@/config/site";

export type Offer = {
  number: string;
  badge?: string;
  featured?: boolean;
  title: string;
  price: string;
  priceNote: string;
  summary: string;
  items: string[];
  footnote?: string;
  cta: { label: string; href: string; variant: "primary" | "ghost"; arrow?: boolean };
};

export const offers = {
  eyebrow: "Three ways to start",
  headline: "Pick the one that matches where you are.",
  plans: [
    {
      number: "01",
      title: "Submit a Build Request",
      price: "Free",
      priceNote: "to submit, scoped per project",
      summary: "For when you already know what you want built.",
      items: [
        "Tell us the project and the problem behind it",
        "We review your requirements and current setup",
        "A call if the scope needs clarifying",
        "A proposal with recommended scope, timeline, and investment",
        "You approve it, we build",
      ],
      cta: { label: "Submit a Build Request", href: routes.buildRequest, variant: "ghost" },
    },
    {
      number: "02",
      badge: "Best seller",
      featured: true,
      title: "Business Systems Review",
      price: "$49",
      priceNote: "one time",
      summary:
        "For when something is clearly inefficient and you're not sure what to fix first.",
      items: [
        "A short questionnaire about your business, tools, and workflow",
        "The single area where automation, AI, or better design pays off most",
        "A clear recommended direction",
        "What we'd do next if it were our business",
      ],
      footnote:
        "A lightweight diagnostic, not a full technical audit. Bigger or messier operations may need a deeper systems diagnosis, and we'll say so. There is no obligation to hire us.",
      cta: {
        label: "Get your Business Systems Review",
        href: routes.systemsReview,
        variant: "primary",
        arrow: true,
      },
    },
    {
      number: "03",
      title: "On-Demand Systems Team",
      price: "$2,000",
      priceNote: "/month and up, tailored",
      summary:
        "For when your business runs on technology and needs someone to keep it running.",
      items: [
        "Monitoring, maintenance, and troubleshooting",
        "CRM and workflow improvements",
        "Integration support and AI workflow upgrades",
        "Small builds within your plan's capacity",
        "A monthly systems review with recommendations",
        "You send requests, we prioritise them with you",
      ],
      footnote:
        "Scope and capacity are agreed per client. Larger projects get their own proposal. We don't promise unlimited development, and any team that does is either overcharging you or about to under-deliver.",
      cta: { label: "Build your Systems Team", href: routes.systemsTeam, variant: "ghost" },
    },
  ] as Offer[],
  chooser: {
    /** Set to false to hide the "Not sure which one" helper block. */
    show: true,
    title: "Not sure which one",
    lead: "Find the sentence that sounds like your week.",
    cards: [
      {
        quote: '"We\'re doing too much manually and I don\'t know where to start."',
        answer: "Business Systems Review",
        price: "$49, one time",
      },
      {
        quote: '"I already know what I want built."',
        answer: "Submit a Build Request",
        price: "Free to submit",
      },
      {
        quote: '"I need this maintained and improved by people who know it."',
        answer: "On-Demand Systems Team",
        price: "From $2,000/month",
      },
    ],
    cta: { label: "Talk to our team", href: routes.contact },
  },
} as const;
