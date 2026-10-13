/**
 * Copy and data for the hourly-packages sales page.
 *
 * Prices live in `packs` and nowhere else: the hero chart, the package
 * tiles, the calculator and the refund examples all derive from it, so a
 * price change is one edit here.
 */

export type Pack = {
  hours: number;
  /** Whole dollars. */
  price: number;
  /** Effective rate, whole dollars per hour. */
  rate: number;
};

export const packs: Pack[] = [
  { hours: 5, price: 95, rate: 19 },
  { hours: 10, price: 190, rate: 19 },
  { hours: 25, price: 450, rate: 18 },
  { hours: 50, price: 850, rate: 17 },
  { hours: 75, price: 1125, rate: 15 },
  { hours: 100, price: 1400, rate: 14 },
  { hours: 150, price: 1950, rate: 13 },
];

/** Index of the pack the calculator opens on. */
export const DEFAULT_PACK = 3;

export const meta = {
  title: "GoHighLevel Help From $13/hr, No Contract",
  description:
    "Buy a block of hours and an 11-person technical team works through your GoHighLevel, automation, integration and development backlog. $19 an hour, down to $13 at volume. Unused hours are refundable.",
} as const;

export const nav = [
  { label: "Packages", href: "#packages" },
  { label: "The work", href: "#work" },
  { label: "How it runs", href: "#how" },
  { label: "Refunds", href: "#refund" },
  { label: "Calculator", href: "#calculator" },
  { label: "FAQ", href: "#faq" },
] as const;

export const hero = {
  eyebrow: "Prepaid GoHighLevel, automation and development hours",
  headline: "Send us the list. ",
  headlineAccent: "Pay for the hours it takes.",
  lead: "$19 an hour, down to $13 at volume, and the full table is one scroll below. Buy a block of hours and an 11-person technical team works through your backlog: GoHighLevel builds, automations, integrations, websites and custom development. Real people handle chat and tickets around the clock. The hours you do not use are refundable.",
  primaryCta: "Choose Your Hours",
  secondaryCta: "Request a Project Estimate",
  bullets: [
    "Smallest pack, $95",
    "One-time or monthly, same seven prices",
    "Cancel any time, nothing to give notice on",
  ],
  chart: {
    label: "Effective rate by pack",
    unit: "USD / hour",
    tiles: [
      { value: "24/7", label: "Human triage" },
      { value: "11", label: "Person team" },
      { value: "$0", label: "Lost on unused hours" },
    ],
  },
} as const;

export type Review = {
  quote: string;
  job: string;
  /** Three-letter badge on the card. */
  tag: string;
};

/** The marquee strip under the hero. */
export const marqueeReviews: Review[] = [
  {
    quote:
      "Sysora was so good, I hired them again. They are now my official team for all my CRM/Tech and web needs.",
    job: "GHL client accounts, automations and funnel build. Repeat client.",
    tag: "GHL",
  },
  {
    quote:
      "Sysora has been one of the best teams I have found on Upwork. They go above and beyond. I don't have to hold their hand through every little thing. They bring strategy, make decisions, and their work ethic is unmatched.",
    job: "Tech operations engagement, 640 hours.",
    tag: "OPS",
  },
  {
    quote:
      "Sysora was THE BEST to work with. Super efficient, communicated well and came to the table with ideas to make my website even better. They took the lead and crushed what I wanted.",
    job: "GHL UI updates, automations and checkout integration, 53 hours.",
    tag: "WEB",
  },
  {
    quote:
      "Excellent technical skills, speed of delivery, prompt and clear communications, flexible and co-operative. Recommended.",
    job: "WhatsApp API integration via PHP, 8 hours.",
    tag: "API",
  },
  {
    quote:
      "Sysora did the work exactly as I wanted. Very good and very knowledgeable. Will be using again.",
    job: "Website feature changes, fixed-price job.",
    tag: "WEB",
  },
  {
    quote: "Genuinely top notch work from Sysora! I recommend 10 out of 10.",
    job: "Funnel layout design in GoHighLevel, 30 hours.",
    tag: "GHL",
  },
];

export const marquee = {
  eyebrow: "Client reviews",
  headline: "What clients say after the list is done",
  rating: "on every completed job",
} as const;

export const packages = {
  eyebrow: "The packages",
  headline: "All seven, no gating",
  billingNote: "Same prices either way.",
  onceLabel: "One-time pack",
  monthlyLabel: "Monthly plan",
  footnotes: [
    "One-time packs valid 60 days. Monthly balances reset each cycle.",
    "Each order is priced at the package on that order.",
  ],
  customLead: "Over 150 hours?",
  customCta: "Ask for a custom quote",
} as const;

export const safeguards = {
  eyebrow: "Why the price is safe to act on",
  headline: "Three things that happen before any of your money is at risk",
  cards: [
    {
      n: "01",
      title: "You approve the scope before anything is built",
      body: "After checkout you get an onboarding intake and we come back with what we think each task takes. Substantial work gets a written time estimate and a milestone plan. Nothing starts until you say so.",
    },
    {
      n: "02",
      title: "Nothing is spent past your balance without you",
      body: "No automatic overage, no invoice arriving after the fact. When the hours get thin you hear from us with what is left and what the open tasks still need.",
    },
    {
      n: "03",
      title: "The hours you do not use come back",
      body: "Not happy with our work? Get a refund for your unused hours, at the rate you paid, to the original payment method. Request it before your pack expires or your monthly cycle resets. Hours already worked are not refundable.",
    },
  ],
  kicker: "We would rather you knew the limits now than argue about them later.",
} as const;

export const trackRecord = {
  eyebrow: "The track record underneath the price",
  headline: "The work this was built on",
  lead: "Founder Nikhil's delivery record on Upwork. Client names are not published on the platform, so each review is credited to the job it came from.",
  figures: [
    { value: "100%", label: "Job Success Score" },
    { value: "Top", label: "Rated" },
    { value: "19", label: "Jobs" },
    { value: "1,220", label: "Hours logged" },
    { value: "5.0", label: "Every job, out of 5.0", accent: true },
  ],
  disclaimer:
    "Founder's Upwork profile, freelance-platform delivery record. Not Sysora-branded company client results.",
  featured: [
    {
      quote:
        '"He was so good, I hired him again. He is now my official guy for all my CRM/Tech and web needs."',
      source:
        "Upwork review, GHL client accounts, automations and funnel build, repeat client. Founder's freelance work.",
      large: true,
    },
    {
      quote:
        '"Nikhil has been one of the best freelancers I have found on UpWork. He goes above and beyond, I don\'t have to hold his hand through every little thing, he brings strategy, makes decisions, and his work ethic is unmatched. I will be using him for all my future projects."',
      source:
        "Upwork review, Tech Operations Specialist engagement, $6,550 over 640 hours. Founder's freelance work.",
      large: false,
    },
  ],
  closingLead: "Two clients, unrelated projects, both wrote about not having to hold his hand. ",
  closingBold: "That is what the hourly rate is buying.",
  closingCta: "Choose Your Hours",
} as const;

export const work = {
  eyebrow: "What the hours get spent on",
  headline: "The work, plainly",
  cards: [
    {
      icon: "grid",
      title: "GoHighLevel",
      body: "Account and subaccount setup. Onboarding. Snapshots and templates. Pipelines, opportunities, forms, surveys, calendars, booking and lead routing. Funnels, landing pages, websites and checkout setup. Workflows, triggers, email and SMS configuration, troubleshooting and cleanup. CRM migrations, data imports, permissions. SaaS-mode configuration. Messaging and A2P registration work.",
    },
    {
      icon: "nodes",
      title: "Automation and integration",
      body: "n8n, Zapier and Make workflow design, build, repair and maintenance. Webhooks, REST APIs, data sync and error-handling workflows. AI-assisted workflows and agents where they fit the job. Custom integrations between GoHighLevel and the systems around it.",
    },
    {
      icon: "code",
      title: "Websites, apps and software",
      body: "Website and funnel implementation, fixes and maintenance. Custom apps, dashboards, portals, scripts and software integrations. Hosting, deployment and infrastructure help, as scoped. Custom development, estimated in writing before substantial work begins.",
    },
  ] as { icon: "grid" | "nodes" | "code"; title: string; body: string }[],
  callout:
    "A clever automation that breaks every week is not a good system. Error handling and monitoring are part of the build, not a follow-up ticket.",
} as const;

export const audiences = [
  {
    id: "agencies",
    badge: "For US marketing agencies and GHL SaaS owners",
    headline: "You keep the client. We do the delivery.",
    paragraphs: [
      "Your pipeline is fine. The delivery queue is what caps how many clients you can take. Subaccounts to set up, a snapshot to rebuild, workflows that worked last month, a migration the client keeps asking about, and the A2P submission nobody wants to own. Hiring a full-time technical person for that load is a bet on the load staying steady, and agency workloads rarely are.",
      "Hours flex with the month. Scale up for a heavy build period and back down afterwards, without a redundancy conversation.",
    ],
    hoursLabel: "Hours go on",
    hoursBody:
      "Client subaccount setup and upkeep, snapshots and templates, funnels and forms and calendars and pipelines, workflow builds and cleanup of whatever the last person left, CRM migrations and imports and permissions, SaaS-mode configuration, A2P registration work, integrations to whatever your client runs on, and recurring task queues so capacity stops depending on one person's week.",
    noteTitle: "White-label.",
    noteBody:
      "We can work behind your brand. What carries your name and what stays unbranded is agreed in writing for each engagement. End-customer phone coverage and a named person assigned to your account are not included by default.",
    startTitle: "Where agencies tend to start:",
    startBody: "25 or 50 hours to clear a backlog, or 50, 100 or 150 monthly for standing capacity.",
    link: "Agency detail on Services →",
    href: "/services#agencies",
  },
  {
    id: "local",
    badge: "For US local businesses",
    headline: "The leads are arriving. The follow-up is not.",
    paragraphs: [
      "A form gets filled in on Tuesday afternoon and nobody calls back until Thursday. The booking calendar and the CRM disagree about who is coming in. Every tool is paid for and none of them are talking to each other.",
      "Fixing that does not need an agency on a twelve-month contract. It needs someone technical for a defined number of hours, and someone to call when it breaks later.",
    ],
    hoursLabel: "Hours go on",
    hoursBody:
      "GoHighLevel onboarding and pipeline structure, CRM cleanup, lead forms and routing, missed-call text back, SMS and email follow-up, appointment calendars and reminders and no-show follow-up, connecting GHL to the tools you already pay for, websites and funnels, and troubleshooting when something stops firing.",
    noteTitle: "The boundary.",
    noteBody:
      "We build the system and keep it working. We do not promise a number of leads, a conversion rate or a revenue figure, because those depend on your market and your offer, not only on the plumbing.",
    startTitle: "Where local businesses tend to start:",
    startBody: "10 or 25 hours, then a smaller monthly plan if you want someone on hand afterwards.",
    link: "Local business detail on Services →",
    href: "/services#local-businesses",
  },
] as const;

export const support = {
  eyebrow: "What 24/7 means here",
  headline: "A person reads your message. The work is what you pay for.",
  included: {
    title: "Included, around the clock",
    badge: "$0 extra",
    lead: "With every package, at no extra charge.",
    items: [
      "A real person receives your chat message or ticket at any hour",
      "They read it and acknowledge it",
      "They triage it and route it to whoever handles that kind of work",
    ],
  },
  billed: {
    title: "Billed against your hours",
    badge: "From balance",
    lead: "Technical work, logged as it happens.",
    items: [
      "Scheduled calls",
      "Technical diagnosis and troubleshooting",
      "Configuration, building, revisions and testing",
      "Meetings, project coordination and written documentation",
    ],
  },
  notPromisedTitle: "Not promised by default:",
  notPromisedBody:
    " unlimited free calls, a dedicated engineer, a response-time target, or a guaranteed resolution window.",
  teamNote:
    "The team is 11 people with US shift coverage, which is what makes the overnight intake possible.",
} as const;

export const howItRuns = {
  eyebrow: "How it runs, start to finish",
  headline: "From payment to finished work",
  kicker:
    "And when the system is live, the same hours cover the changes and the breakages afterwards.",
  steps: [
    {
      n: "01",
      title: "Payment and receipt",
      body: "Your hour balance is created immediately.",
    },
    {
      n: "02",
      title: "Onboarding intake",
      body: "Agency or local business, your GoHighLevel account situation, the other tools in play, your goals and backlog, how you want to grant access, your US time zone, and who approves work and billing. We request the minimum permissions a job needs and never ask for a password in plain text.",
    },
    {
      n: "03",
      title: "Scoping",
      body: "We go through the backlog and come back with what each task takes. Substantial work gets a written estimate and a milestone plan.",
    },
    {
      n: "04",
      title: "Your approval",
      body: "Nothing starts until you approve the scope.",
      highlight: true,
    },
    {
      n: "05",
      title: "Build, test, hand over",
      body: "Time is logged against the task as it happens.",
    },
    {
      n: "06",
      title: "Low balance",
      body: "You hear from us with what is left and what the open tasks still need.",
    },
    {
      n: "07",
      title: "Buying more",
      body: "A new order at whatever size fits the next stretch, priced at that order's tier.",
    },
  ],
} as const;

export const moreReviews = {
  eyebrow: "More from the people who hired him",
  headline: "Smaller jobs, same pattern",
  cards: [
    {
      quote:
        '"He was THE BEST to work with. Super efficient, communicated well and came to the table with ideas to make my website even better. I love when I don\'t have to hand hold people through everything and he took the lead and crushed what I wanted."',
      source:
        "Upwork review, GHL UI updates, automations and checkout integration, $697.50 over 53 hours. Founder's freelance work.",
    },
    {
      quote:
        '"Excellent Technical skills, Speed of delivery, Prompt and clear communications, flexible and co-operative. Recommended"',
      source:
        "Upwork review, WhatsApp API integration via PHP, 8 hours. Founder's freelance work.",
    },
    {
      quote:
        '"He did the work exactly as I wanted. Very good and very knowledgeable. Excellent freelancer. Will be using again."',
      source: "Upwork review, website feature changes, fixed-price job. Founder's freelance work.",
    },
  ],
  closing: {
    lead: "Three of those clients came back with bigger work than they first hired for, including a ",
    first: "640-hour",
    middle: " engagement and a ",
    second: "357-hour",
    tail: " build.",
  },
} as const;

export const whoBuilt = {
  eyebrow: "Who built this",
  headline: "Built by someone who did the work first",
  stack: [
    "GoHighLevel",
    "n8n",
    "Make",
    "Zapier",
    "React",
    "Node.js",
    "Next.js",
    "Laravel",
  ],
  paragraphs: [
    "Sysora was founded by Nikhil, a full-stack developer and automation specialist working across GoHighLevel, n8n, Make, Zapier, React, Node.js, Next.js and Laravel. Before the company existed the work was freelance, and it kept turning into something longer than it started as. A webinar funnel build booked for one week ran close to two months, because both sides kept testing for what would fail under load. A small tech operations project turned into 640 hours.",
  ],
  patternLead:
    "The pattern was consistent. Nobody was hiring for an automation. They were hiring because nobody in the building could answer one question, which was ",
  patternBold: "how this is supposed to work.",
  disclaimer:
    "Sysora is not an official HighLevel employee team, partner or certified provider.",
  link: "More on the team at About Sysora →",
} as const;

export const refund = {
  eyebrow: "The refund guarantee in full",
  headline: "Not happy with our work? Get a refund for your unused hours.",
  lead: "Buy 50 hours, use 12, decide we are not the right team. The 38 hours you have not used come back at the rate you paid, $646 in that example. You do not have to prove the work was poor to get an unused balance back.",
  tableHead: ["You bought", "You used", "Refund on unused"],
  examples: [
    { bought: "10 hours, $190", used: "3 hours", maths: "7 × $19 = ", total: "$133" },
    { bought: "50 hours, $850", used: "12 hours", maths: "38 × $17 = ", total: "$646" },
    { bought: "150 hours, $1,950", used: "40 hours", maths: "110 × $13 = ", total: "$1,430" },
  ],
  rulesTitle: "The rules, at the same size as the promise",
  rules: [
    {
      label: "What is refundable",
      body: "Prepaid hours you have not used, at the rate you paid for that pack",
    },
    {
      label: "What is not",
      body: "Hours already worked and logged. Third-party subscriptions, messaging and usage fees, hosting, domains and taxes",
    },
    { label: "When to ask, one-time pack", body: "Before the 60-day expiry" },
    {
      label: "When to ask, monthly plan",
      body: "Before the current cycle resets. Only the current paid cycle is in scope",
    },
    {
      label: "How to ask",
      body: "Tell our 24/7 chat or ticket support that you want to cancel and refund your unused hours",
    },
    {
      label: "What happens next",
      body: "We pause new billable work on that pack, send an itemized ledger of hours used and unused, confirm the amount, and refund it to the original payment method with written confirmation",
    },
    {
      label: "Cancelling a monthly plan",
      body: "Stops future renewals. The unused part of the cycle you already paid for is refundable under the same rules",
    },
    {
      label: "If you disagree with the logged time",
      body: "We review it against the task log with you. Time is never quietly deducted after a refund request",
    },
  ],
  caveatTitle: "Honest caveat:",
  caveatBody:
    " This is an unused-hours guarantee, not a full money-back guarantee. Once we approve a refund, how fast it posts depends on your payment provider, which is outside our control.",
} as const;

export const costs = {
  eyebrow: "What the price does not cover",
  headline: "Costs that stay yours",
  paragraphs: [
    "Your hours buy Sysora labor. They do not cover third-party software subscriptions, SMS and email usage, telephony charges, AI model fees, hosting, domains, platform licensing, taxes, or any paid external tool, unless a written quote says otherwise.",
    "A2P and messaging registration is work we can do for you, and it uses your hours. The registry and carrier fees are separate, and approval is decided by them on their timeline. Nobody can promise a first-pass approval.",
    "We do not guarantee lead volume, conversion rates, revenue outcomes or uptime. Time estimates are estimates, and when a build runs longer than scoped you hear about it before the hours are spent.",
  ],
} as const;

export const calculator = {
  eyebrow: "Calculator",
  headline: "Work out your cost",
  billingLabel: "Billing",
  packLabel: "Hours package",
  tiles: {
    total: "Package total",
    rate: "Effective hourly rate",
    validity: "Validity or reset",
    support: "Support included",
    supportValue: "24/7 human chat and ticket triage",
  },
  validityOnce: "Valid 60 days from purchase",
  validityMonthly: "Resets each billing cycle, no carryover",
  noteOnce:
    "Valid 60 days from purchase. 24/7 human chat and ticket triage included. Calls and technical work are deducted from these hours.",
  noteMonthly:
    "Balance resets each billing cycle, no carryover. Cancel any time to stop future renewals. 24/7 human chat and ticket triage included. Calls and technical work are deducted from these hours.",
  cta: "Continue to checkout",
  ctaNote:
    "These are the seven published packages. For a number of hours that is not listed, pick the nearest package or ask for a custom estimate.",
  quote: '"Genuinely top notch work from Nikhil! I recommend 10 out of 10."',
  quoteSource:
    "Upwork review, funnel layout design in GoHighLevel, 30 hours. Founder's freelance work.",
} as const;

export const faq = {
  eyebrow: "FAQ",
  headline: "Questions people ask before buying",
  items: [
    {
      q: "Why is the rate so much lower at 150 hours?",
      a: "Larger single orders mean less scoping overhead, fewer billing cycles and more predictable scheduling for us, and the rate reflects that. It applies to the order you place, not retroactively to past or future orders.",
    },
    {
      q: "What am I actually paying for, a person or a package?",
      a: "A team, billed by the hour against a balance you buy up front. An 11-person group covering GoHighLevel, automation, integration, web and software work, plus 24/7 human chat and ticket triage at no extra charge.",
    },
    {
      q: "How do I know the hours are real?",
      a: "Every task carries its logged time in your ledger, visible to you. If you disagree with an entry, we go through the task log with you.",
    },
    {
      q: "What happens if I run out mid-project?",
      a: "We stop and tell you where the work stands, what is left, and what we estimate it takes. You decide whether to buy more. We do not keep working past your balance and bill you afterwards.",
    },
    {
      q: "Do my hours roll over?",
      a: "One-time packs are valid 60 days from purchase. Monthly plans reset at the start of each billing cycle and unused hours do not carry forward. That is why the refund request window matters.",
    },
    {
      q: "Is the 24/7 support unlimited?",
      a: "24/7 human chat and ticket triage is included with every package, which means a real person receives, reads, triages and routes your request at any hour. Calls, diagnosis, configuration, building, testing and meetings are technical work and come out of your purchased hours.",
    },
    {
      q: "How fast will you respond?",
      a: "We do not publish a response-time commitment, because we have not operationalized one, and a number we cannot hold is worse than no number. Intake is staffed around the clock.",
    },
    {
      q: "How do I cancel a monthly plan?",
      a: "Tell our chat or ticket support. Cancelling stops future renewals. The unused hours in the cycle you have already paid for can be refunded, as long as you ask before that cycle resets.",
    },
    {
      q: "Can you take over an account somebody else built?",
      a: "Yes, and a good share of our work starts that way. We go through the workflows, pipelines and data first, tell you what is worth keeping and what should be rebuilt, then do the agreed work against your hours.",
    },
    {
      q: "Can you work under my agency's brand?",
      a: "Yes. White-label delivery is a large share of our agency work. What carries your name and what does not is agreed per engagement, in writing.",
    },
    {
      q: "Do you only work in GoHighLevel?",
      a: "GoHighLevel is where most of our work starts. When a job needs n8n, Zapier, Make, a webhook, an API, a database or custom code, the same team builds that part.",
    },
    {
      q: "Are the reviews on this page Sysora client reviews?",
      a: "No, and we are not going to present them that way. They are founder Nikhil's reviews from freelance work on Upwork, completed before Sysora existed, labeled as such everywhere they appear.",
    },
    {
      q: "What if my project is too big for a package?",
      a: "Send the scope and we come back with a time estimate and a milestone plan. The work is still billed against hours, at the tier of the order you place.",
    },
  ],
} as const;

export const finalCta = {
  headline: "Pick a size and send us the list",
  lead: "The smallest pack is $95 and covers one task. If the scope is unclear, send it over and we will put a number on it before you pay anything.",
  primaryCta: "Choose Your Hours",
  secondaryCta: "Request a Project Estimate",
  note: "No contract. 24/7 human chat and ticket triage included. Unused prepaid hours are refundable.",
} as const;

export const footer = {
  blurb:
    "Prepaid GoHighLevel, automation and development hours. $19 an hour, down to $13 at volume. No contract.",
  badges: ["24/7 human triage", "Unused hours refundable"],
  columns: [
    {
      title: "Pricing",
      links: [
        { label: "Packages", href: "#packages" },
        { label: "Calculator", href: "#calculator" },
        { label: "Refund guarantee", href: "#refund" },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Services", href: "/services" },
        { label: "How it runs", href: "#how" },
        { label: "Request an estimate", href: "/request-estimate" },
        { label: "About Sysora", href: "/about" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Contact", href: "/contact" },
        { label: "Refund policy", href: "#refund" },
      ],
    },
  ],
  copyright: "© 2026 Sysora. All rights reserved.",
  disclaimer:
    "Sysora is not an official HighLevel employee team, partner or certified provider.",
} as const;
