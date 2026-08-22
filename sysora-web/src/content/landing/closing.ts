export const urgency = {
  eyebrow: "The part where most pages add a countdown",
  headline: "We won't. ",
  headlineAccent: "The cost of waiting is already running.",
  body: "There's no expiring discount and no fake deadline. Every week the manual work continues, you pay for it in salaried hours. The leads that go cold stay cold. The automation nobody owns keeps working until the morning it doesn't, and that morning tends to arrive during a launch.",
  kicker:
    "Nothing about your systems will fix itself while you're busy. That's the whole problem with systems.",
  cta: "Get your Business Systems Review, $49",
} as const;

export const faq = {
  eyebrow: "Questions people ask",
  headline: "Straight answers.",
  items: [
    {
      question: "We already have automations. Do you replace all of it.",
      answer:
        "Usually not. We audit what exists, keep what works, fix what's fragile, and rebuild only where rebuilding is cheaper than maintaining. Ripping out working systems to sell you new ones is how people waste money.",
    },
    {
      question: "We're not technical. Is this going to be a lot of work for us.",
      answer:
        "The heavy lifting sits with us. We need access, and we need someone who can answer questions about how the business runs. Beyond that, you should be reviewing decisions, not writing specifications.",
    },
    {
      question: "Which tools do you work in.",
      answer:
        "n8n, Zapier, Make, GoHighLevel, most major CRMs, APIs and webhooks, AI agents, and custom software when the off-the-shelf option doesn't fit. We choose based on your problem and what you already pay for.",
    },
    {
      question: "How fast does this move.",
      answer:
        "Depends entirely on scope, and we won't quote you a timeline before we've seen the work. What we will do is tell you the truth during scoping, including when a project is smaller than you think.",
    },
    {
      question: "What if the $49 review shows we don't need you.",
      answer:
        "Then it says so. That's a $49 answer to a question that was costing you more than that every week, and you've lost nothing.",
    },
    {
      question: "Are we locked into anything.",
      answer:
        "No long-term contract on the review or a build request. The On-Demand Systems Team is a monthly arrangement, sized to what you need.",
    },
  ],
} as const;

type LastWordCta = {
  label: string;
  variant: "primary" | "outlineWhite";
  arrow?: boolean;
};

export const lastWord = {
  eyebrow: "Last word",
  headline: "Your systems are still shaped for the company you used to be.",
  body: "Most of the businesses we work with weren't broken when they came to us. They were growing, which is a much better problem to have and a much easier one to fix. Start with the $49 review and let us tell you what we'd fix first. If you already know what needs building, send it over and we'll scope it. Either way you'll get a straight answer about what's worth doing, and what isn't.",
  ctas: [
    { label: "Get your Business Systems Review, $49", variant: "primary", arrow: true },
    { label: "Submit a Build Request", variant: "outlineWhite" },
    { label: "Build your Systems Team", variant: "outlineWhite" },
  ] as LastWordCta[],
} as const;

export const stickyBar = {
  title: "Find out what to fix first, for $49",
  subtitle: "A lightweight diagnostic. No obligation to hire us.",
  primary: "Get your Business Systems Review",
  secondary: "Submit a Build Request",
} as const;
