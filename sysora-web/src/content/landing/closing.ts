/** The thin dark strip above the header. */
export const topStrip = {
  live: "46 build requests submitted last month",
  /** Split so the score itself can carry the accent colour. */
  ratingLead: "Every project rated",
  ratingValue: "5.0",
  ratingTail: "across 19 contracts",
} as const;

export const urgency = {
  eyebrow: "The part where most pages add a countdown",
  headline: "We won't. The cost of waiting is already running.",
  body: "There's no expiring discount and no fake deadline. Every week the manual work continues, you pay for it in salaried hours, or in your own evenings if you haven't hired anyone yet. The leads that go cold stay cold. The automation nobody owns keeps working until the morning it doesn't, and that morning tends to arrive during a launch.",
  kicker:
    "Nothing about your systems will fix itself while you're busy. That's the whole problem with systems.",
  cta: "Get your Business Systems Review, $49",
} as const;

export const faq = {
  eyebrow: "Questions people ask",
  headline: "Straight answers.",
  items: [
    {
      n: "01",
      q: "We are just starting out. Is there even anything to automate.",
      a: "Probably not yet, and we will say so. What there is at that stage is setup, getting the website, the payment flow, the CRM and the follow-up built once and built properly. Automation comes after there is a process to automate. Paying to automate nothing is the most common way early businesses waste money on this.",
    },
    {
      n: "02",
      q: "We already have automations. Do you replace all of it.",
      a: "Usually not. We audit what exists, keep what works, fix what is fragile, and rebuild only where rebuilding is cheaper than maintaining. Ripping out working systems to sell you new ones is how people waste money.",
    },
    {
      n: "03",
      q: "We are not technical. Is this going to be a lot of work for us.",
      a: "The heavy lifting sits with us. We need access, and we need someone who can answer questions about how the business runs. Beyond that, you should be reviewing decisions, not writing specifications.",
    },
    {
      n: "04",
      q: "Do you write software, or do you just connect tools that already exist.",
      a: "Both, and we start with the second one because it is cheaper for you. If a workflow in n8n and a webhook solve it, that is what you get. When there is genuinely nothing on the market that does the job, we build the application in React, Next.js, Node, Python or Laravel, deploy it on AWS or Cloudflare, and keep running it afterwards.",
    },
    {
      n: "05",
      q: "Who owns the code and the infrastructure.",
      a: "You do. The code lives in your GitHub or Bitbucket organisation and the infrastructure is billed to your own AWS and Cloudflare accounts. If you stop working with us you keep everything, including the deploy pipeline and the documentation.",
    },
    {
      n: "06",
      q: "Which tools do you work in.",
      a: "n8n, Zapier, Make, GoHighLevel, most major CRMs, APIs and webhooks, AI agents, and custom software when the off-the-shelf option does not fit. On the engineering side that means React, Next.js, Node.js, Python, Laravel, PostgreSQL and MySQL, running on AWS, Cloudflare and Docker, with GitHub, Bitbucket and Jenkins handling the pipeline. We choose based on your problem and what you already pay for.",
    },
    {
      n: "07",
      q: "How fast does this move.",
      a: "Fixed-price services carry a timeline in the proposal. For anything scoped, it depends entirely on the work, and we will not quote you a date before we have seen it. What we will do is tell you the truth during scoping, including when a project is smaller than you think.",
    },
    {
      n: "08",
      q: "What if the $49 review shows we do not need you.",
      a: "Then it says so. That is a $49 answer to a question that was costing you more than that every week, and you have lost nothing.",
    },
    {
      n: "09",
      q: "Are we locked into anything.",
      a: "No long-term contract on the review, a service, or a build request. The On-Demand Systems Team is a monthly arrangement, sized to what you need.",
    },
  ],
} as const;

export const lastWord = {
  eyebrow: "Last word",
  headline: "Your systems are still shaped for the company you used to be.",
  body: "Most of the businesses we work with weren't broken when they came to us. Some were growing faster than the setup underneath them. Some hadn't built the setup yet and wanted it done right before the first client arrived. Some had gone as far as the available software would take them and needed something written. All three are better problems than the alternative, and all three are fixable. Start with the $49 review and let us tell you what we'd build first. If you already know what needs building, send it over and we'll scope it, and if it's on the services list you'll get a price instead of a proposal.",
  primaryCta: "Get your Business Systems Review, $49",
  secondaryCta: "Get a Free Build Quote",
} as const;

export const stickyBar = {
  title: "Find out what to fix first, for $49.",
  subtitle: "A lightweight diagnostic. No obligation to hire us.",
  primary: "Get your Business Systems Review",
  secondary: "Get a Free Build Quote",
} as const;
