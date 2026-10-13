import { routes } from "@/config/site";

export type Offer = {
  n: string;
  /** Empty unless the card carries a ribbon. */
  badge: string;
  title: string;
  price: string;
  forWhen: string;
  points: string[];
  /** The honest limit of the offer. Empty where there isn't one. */
  boundary: string;
  cta: string;
  href: string;
  /** Reassurance under the button. Empty where there isn't any. */
  support: string;
};

export type CompareRow = {
  label: string;
  a: string;
  b: string;
};

export const offers = {
  eyebrow: "Three ways to work with us",
  headline: "Pick the one that matches where you are.",
  cards: [
    {
      n: "01",
      badge: "",
      title: "Submit a Build Request",
      price: "Free to submit, scoped per project",
      forWhen:
        "For when you already know what you want built and it is not on the services list.",
      points: [
        "Tell us the project and the problem behind it",
        "We review your requirements and current setup",
        "A call if the scope needs clarifying",
        "A proposal with recommended scope, timeline, and investment",
        "You approve it, we build",
      ],
      boundary: "",
      cta: "Get a Free Build Quote",
      href: routes.buildRequest,
      support:
        "Tell us what you want built. You get a scope, a timeline and a price, at no cost.",
    },
    {
      n: "02",
      badge: "Best seller",
      title: "Business Systems Review",
      price: "$49 one time",
      forWhen:
        "For when something is clearly inefficient and you are not sure what to fix first. Also for when nothing is built yet and you want to know what should be.",
      points: [
        "A short questionnaire about your business, tools, and workflow",
        "The single area where automation, AI, or better design pays off most",
        "A clear recommended direction",
        "What we would do next if it were our business",
      ],
      boundary:
        "A lightweight diagnostic, not a full technical audit. Bigger or messier operations may need a deeper systems diagnosis, and we will say so. There is no obligation to hire us.",
      cta: "Get your Business Systems Review",
      href: routes.systemsReview,
      support: "",
    },
    {
      n: "03",
      badge: "",
      title: "On-Demand Systems Team",
      price: "$2,000/month and up, tailored",
      forWhen:
        "For when your business runs on technology and needs someone to keep it running.",
      points: [
        "Monitoring, maintenance, and troubleshooting",
        "CRM and workflow improvements",
        "Integration support and AI workflow upgrades",
        "Small builds within your plan's capacity",
        "A monthly systems review with recommendations",
        "You send requests, we prioritise them with you",
      ],
      boundary:
        "Scope and capacity are agreed per client. Larger projects get their own proposal. We do not promise unlimited development, and any team that does is either overcharging you or about to under-deliver.",
      cta: "Build your Systems Team",
      href: routes.systemsTeam,
      support: "",
    },
  ] as Offer[],

  compare: {
    eyebrow: "Cheaper than the hire it replaces",
    headline: "A team that already knows the work, for less than one junior hire.",
    columnA: "A junior operations hire",
    columnB: "On-Demand Systems Team",
    rows: [
      {
        label: "Monthly cost",
        a: "More than $2,000 for one junior hire",
        b: "From $2,000 for a team",
      },
      {
        label: "Recruiting and onboarding",
        a: "Yours to run, before any work starts",
        b: "None. We start on the approved list",
      },
      {
        label: "Skill coverage",
        a: "One person expected to cover automation, CRM architecture, integrations, and software",
        b: "A team that already covers all four",
      },
      {
        label: "Ramp-up",
        a: "Weeks of learning your business",
        b: "Systems mapped in the first stage",
      },
      {
        label: "Monitoring and documentation",
        a: "Whatever they get around to",
        b: "Built in, plus a monthly systems review",
      },
    ] as CompareRow[],
    cta: "Build your Systems Team",
  },

  chooser: {
    headline: "Not sure which one",
    lead: "Find the sentence that sounds like your week.",
    cards: [
      {
        quote: '"I am starting out and I do not know what to build first."',
        name: "Business Systems Review",
        note: "$49, one time",
        href: routes.systemsReview,
      },
      {
        quote: '"I know exactly what I need built."',
        name: "Submit a Build Request",
        note: "Free to submit",
        href: routes.buildRequest,
      },
      {
        quote:
          '"I need this maintained and improved by people who know it."',
        name: "On-Demand Systems Team",
        note: "From $2,000/month",
        href: routes.systemsTeam,
      },
    ],
    cta: "Talk to our team",
  },
} as const;
