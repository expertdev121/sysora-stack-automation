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
  title: "GoHighLevel and Automation Hours From $13/hr, No Contract",
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

/**
 * The legal pages carry a shorter nav, as the design has it: a way back
 * to the offer, and the two documents side by side so a reader can move
 * between them without going via the footer.
 */
export const legalNav = [
  { label: "Home", href: "" },
  { label: "Packages", href: "#packages" },
  { label: "Refunds", href: "#refund" },
  { label: "FAQ", href: "#faq" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy-policy" },
] as const;

/** The contact page's nav, as the design has it: the offer, then Contact. */
export const contactNav = [
  { label: "Home", href: "" },
  { label: "Packages", href: "#packages" },
  { label: "Refunds", href: "#refund" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "/contact" },
] as const;

export const hero = {
  eyebrow: "Prepaid GoHighLevel, automation and development hours",
  /**
   * The H1 carries the search term as well as the voice. "Pay for the
   * hours it takes" said nothing a search engine could match, which left
   * the <title> doing the keyword work by itself.
   */
  headline: "Send us the list. ",
  headlineAccent: "GoHighLevel and automation hours from $13.",
  lead: "$19 an hour, down to $13 at volume, and the full table is one scroll below. Buy a block of hours and an 11-person technical team works through your backlog: GoHighLevel builds, automations, integrations, websites and custom development. Real people handle chat and tickets around the clock. The hours you do not use are refundable.",
  primaryCta: "Choose Your Hours",
  secondaryCta: "Request a Project Estimate",
  bullets: [
    "Smallest pack, $95",
    "One-time or monthly, same seven prices",
    "Cancel any time, up to 24 hours before a renewal",
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

export const reviews = {
  eyebrow: "Client reviews",
  headline: "What clients say after the list is done",
  rating: "on every completed job",
  /**
   * The quotes used to carry square brackets around every substituted
   * name and pronoun, and this line explained the convention. The design
   * dropped the brackets — they made three testimonials read like a
   * redacted document — so the explanation changed with them.
   */
  /** Split at the end so "Upwork profile" is a link to the real profile. */
  intro:
    "Upwork reviews of work our founder delivered before the company carried the Sysora Stack name. Clients are not named on the platform, so each one is credited to its job. Where a client wrote a person’s name, we have written the company instead, and the original wording is live on the ",
  introLink: "Upwork profile",
  introTail: ".",
  cards: [
    {
      quote:
        "“Sysora Stack was so good, I hired them again. They are now my official team for all my CRM/Tech and web needs.”",
      tag: "GHL",
      job: "GHL client accounts, automations and funnel build, repeat client",
    },
    {
      quote:
        "“Sysora Stack has been one of the best teams I have found on UpWork. They go above and beyond, I don’t have to hold their hand through every little thing, they bring strategy, make decisions, and their work ethic is unmatched. I will be using them for all my future projects.”",
      tag: "OPS",
      job: "Tech Operations Specialist engagement, $6,550 over 640 hours",
    },
    {
      quote:
        "“Sysora Stack was THE BEST to work with. Super efficient, communicated well and came to the table with ideas to make my website even better. I love when I don’t have to hand hold people through everything and they took the lead and crushed what I wanted.”",
      tag: "WEB",
      job: "GHL UI updates, automations and checkout integration, $697.50 over 53 hours",
    },
  ] as Review[],
  closingLead:
    "Two of those three are repeat hires, and both wrote about not having to hold the team’s hand. ",
  closingBold: "That is what the hourly rate is buying.",
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
      body: "After checkout you fill in the onboarding in your account and we come back with what we think each task takes. Substantial work gets a written time estimate and a milestone plan. Nothing starts until you say so, and none of that scoping comes out of your hours.",
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
  lead: "Sysora Stack’s delivery record on Upwork, built under founder Nikhil before the company carried the name. Clients are not named on the platform, so each job is credited by what it was.",
  figures: [
    { value: "100%", label: "Job Success Score" },
    { value: "Top", label: "Rated" },
    { value: "19", label: "Jobs" },
    { value: "1,220", label: "Hours logged" },
    { value: "5.0", label: "Every job, out of 5.0", accent: true },
  ],
  /** The figures above are only checkable if this is a link. */
  disclaimerLink: "Upwork profile",
  disclaimer:
    " of Sysora Stack’s founder. Freelance-platform delivery record, not company-branded client results.",
  closingLead:
    "19 jobs, 1,220 hours, and not one rated below 5.0. Three of those clients came back with bigger work than they first hired for, including the 640-hour engagement and a 357-hour build. ",
  closingBold: "That is what the hourly rate is buying.",
  closingCta: "Choose Your Hours",
} as const;

export const work = {
  eyebrow: "What the hours get spent on",
  headline: "The work, plainly",
  cards: [
    {
      icon: "grid",
      illustration: "/illustrations/work-ghl.svg",
      illustrationAlt: "A GoHighLevel sales pipeline with leads moving across new, contacted and booked",
      title: "GoHighLevel",
      items: [
        "Account and subaccount setup, onboarding",
        "Snapshots and templates",
        "Pipelines, opportunities, forms, surveys, calendars, booking and lead routing",
        "Funnels, landing pages, websites and checkout setup",
        "Workflows, triggers, email and SMS configuration, troubleshooting and cleanup",
        "CRM migrations, data imports, permissions",
        "SaaS-mode configuration",
        "Messaging and A2P registration work",
      ],
    },
    {
      icon: "nodes",
      illustration: "/illustrations/work-automation.svg",
      illustrationAlt:
        "A lead follow-up workflow: form submitted, wait two minutes, send SMS, update the CRM",
      title: "Automation and integration",
      items: [
        "n8n, Zapier and Make workflow design, build, repair and maintenance",
        "Webhooks, REST APIs, data sync and error-handling workflows",
        "AI-assisted workflows and agents where they fit the job",
        "Custom integrations between GoHighLevel and the systems around it",
      ],
    },
    {
      icon: "code",
      illustration: "/illustrations/work-software.svg",
      illustrationAlt:
        "A booking page beside the deployed code that syncs each lead to the CRM",
      title: "Websites, apps and software",
      items: [
        "Website and funnel implementation, fixes and maintenance",
        "Custom apps, dashboards, portals, scripts and software integrations",
        "Hosting, deployment and infrastructure help, as scoped",
        "Custom development, estimated in writing before substantial work begins",
      ],
    },
  ] as {
    icon: "grid" | "nodes" | "code";
    illustration: string;
    illustrationAlt: string;
    title: string;
    /**
     * One line per capability. These were a single paragraph of
     * full stops; the design lists them, which is how someone
     * scanning for "does it do CRM migrations" actually reads it.
     */
    items: readonly string[];
  }[],
  callout:
    "A clever automation that breaks every week is not a good system. Error handling and monitoring are part of the build, not a follow-up ticket.",
} as const;

export type StartPill = { label: string; on?: boolean };

/**
 * Each audience is a full band: a picture with two floating badges on one
 * side, the pitch on the other. `reversed` puts the picture second, so the
 * two bands mirror each other down the page.
 */
export const audiences = [
  {
    id: "agencies",
    reversed: false,
    band: "bg-[linear-gradient(180deg,var(--surface-0),var(--mint-50))]",
    media: {
      src: "/illustrations/agencies.svg",
      alt: "An agency workspace: five client subaccounts in a delivery queue, hours by month, delivered white-label",
    },
    badge: "For US marketing agencies and GHL SaaS owners",
    headline: "You keep the client. We do the delivery.",
    paragraphs: [
      "Your pipeline is fine. The delivery queue is what caps how many clients you can take. Subaccounts to set up, a snapshot to rebuild, workflows that worked last month, a migration the client keeps asking about, and the A2P submission nobody wants to own. Hiring a full-time technical person for that load is a bet on the load staying steady, and agency workloads rarely are.",
      "Hours flex with the month. Scale up for a heavy build period and back down afterwards, without a redundancy conversation.",
    ],
    hoursLabel: "Hours go on",
    chips: [
      "Client subaccount setup and upkeep",
      "Snapshots and templates",
      "Funnels, forms, calendars and pipelines",
      "Workflow builds and cleanup of whatever the last person left",
      "CRM migrations, imports and permissions",
      "SaaS-mode configuration",
      "A2P registration work",
      "Integrations to whatever your client runs on",
      "Recurring task queues so capacity stops depending on one person's week",
    ],
    noteTitle: "White-label.",
    noteBody:
      "We work behind your brand. What carries your name and what stays unbranded is agreed in writing for each engagement, and the Sysora Stack name appears nowhere your client can see unless you ask for it. End-customer phone coverage and a named person assigned to your account are not included by default.",
    startLabel: "Where agencies tend to start",
    /** Pills and the prose between them, in render order. */
    startPills: [{ label: "25h" }, { label: "50h", on: true }] as StartPill[],
    startMid: "to clear a backlog, or",
    startPills2: [
      { label: "50h" },
      { label: "100h" },
      { label: "150h" },
    ] as StartPill[],
    startTail: "monthly for standing capacity.",
    link: "See the packages →",
    href: "#packages",
  },
  {
    id: "local",
    reversed: true,
    band: "bg-[var(--surface-0)] border-t-[1.5px] border-[var(--border-faint)]",
    media: {
      src: "/illustrations/local.svg",
      alt: "A missed call answered by text, booked into the calendar, lead to booked call in four minutes",
    },
    badge: "For US local businesses",
    headline: "The leads are arriving. The follow-up is not.",
    paragraphs: [
      "A form gets filled in on Tuesday afternoon and nobody calls back until Thursday. The booking calendar and the CRM disagree about who is coming in. Every tool is paid for and none of them are talking to each other.",
      "Fixing that does not need an agency on a twelve-month contract. It needs someone technical for a defined number of hours, and someone to call when it breaks later.",
    ],
    hoursLabel: "Hours go on",
    chips: [
      "GoHighLevel onboarding and pipeline structure",
      "CRM cleanup",
      "Lead forms and routing",
      "Missed-call text back",
      "SMS and email follow-up",
      "Appointment calendars, reminders and no-show follow-up",
      "Connecting GHL to the tools you already pay for",
      "Websites and funnels",
      "Troubleshooting when something stops firing",
    ],
    noteTitle: "The boundary.",
    noteBody:
      "We build the system and keep it working. We do not promise a number of leads, a conversion rate or a revenue figure, because those depend on your market and your offer, not only on the plumbing.",
    startLabel: "Where local businesses tend to start",
    startPills: [{ label: "10h" }, { label: "25h", on: true }] as StartPill[],
    startMid: "",
    startPills2: [] as StartPill[],
    startTail: "then a smaller monthly plan if you want someone on hand afterwards.",
    link: "See the packages →",
    href: "#packages",
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
    /** The billing increment, said before anyone pays rather than only in the terms. */
    note: "Time is logged in 15-minute increments, rounded up per task.",
  },
  notPromisedTitle: "Not promised by default:",
  notPromisedBody:
    " unlimited free calls, a dedicated engineer, a response-time target, or a guaranteed resolution window.",
  teamNote:
    "The team is 11 people, which is what makes the overnight intake possible.",
} as const;

export const howItRuns = {
  eyebrow: "How it runs, start to finish",
  headline: "From payment to finished work",
  kicker:
    "And when the system is live, the same hours cover the changes and the breakages afterwards.",
  steps: [
    {
      n: "01",
      title: "Payment and account access",
      /**
       * `bodyTail` and `contactLink` exist because the design puts a
       * link mid-sentence here. Splitting the copy at the link beats
       * putting markup in a content string.
       */
      body: "Your hour balance is created and your account access is sent to the email you used at checkout. If it is not in your inbox, check your spam folder, or ",
      contactLink: "contact us",
      bodyTail: ".",
    },
    {
      n: "02",
      title: "Onboarding, in your account",
      body: "Everything we need from you is on one screen in there. Agency or local business, your GoHighLevel account situation, the other tools in play, your goals and backlog, how you want to grant access, your US time zone, and who approves work and billing. Fill it in when it suits you and add the first task while you are there. We ask for delegated or role-based access rather than shared passwords, we request the minimum permissions a job needs, and if something is missing we come back to you by email or phone.",
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
  eyebrow: "The small jobs too",
  headline: "An eight-hour job gets the same process",
  /** One shared attribution, rather than repeating it under each card. */
  intro:
    "Same source as above. Upwork reviews of founder-led work, with the company written in where a client named a person.",
  cards: [
    {
      quote:
        '"Excellent Technical skills, Speed of delivery, Prompt and clear communications, flexible and co-operative. Recommended"',
      source: "Upwork review, WhatsApp API integration via PHP, 8 hours",
    },
    {
      quote:
        '"Sysora Stack did the work exactly as I wanted. Very good and very knowledgeable. Excellent team. Will be using again."',
      source: "Upwork review, website feature changes, fixed-price job",
    },
  ],
  closing:
    "Both of those were small fixed-price jobs. The 5-hour pack at $95 exists for that kind of work, and it is how most of the longer engagements on this page started.",
} as const;

export const whoBuilt = {
  eyebrow: "Who built this",
  headline: "The team you are buying hours from",
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
    "Sysora Stack is an 11-person technical team working across GoHighLevel, n8n, Make, Zapier, React, Node.js, Next.js and Laravel. It was founded by Nikhil, and the early years of this work were delivered freelance under his name, which is where the reviews on this page come from. Those jobs kept running longer than they were booked for. A webinar funnel build scheduled for one week ran close to two months, because both sides kept testing for what would fail under load. A small tech operations project turned into 640 hours.",
  ],
  patternLead:
    "The pattern held every time. Nobody was hiring for an automation. They were hiring because nobody in the building could answer one question, which was ",
  patternBold: "how this is supposed to work.",
  disclaimer:
    "Sysora Stack is not an official HighLevel employee team, partner or certified provider.",
  link: "More on the team at About Sysora Stack →",
} as const;

export const refund = {
  eyebrow: "The refund guarantee in full",
  headline: "Not happy with our work? Get a refund for your unused hours.",
  lead: "Buy 50 hours, use 12, decide we are not the right team. The 38 hours you have not used come back at the rate you paid, $646 in that example. You do not have to prove the work was poor to get an unused balance back.",
  rulesTitle: "The rules, at the same size as the promise",
  /** Numbered, as the design has them: eight rules you can cite by number. */
  rules: [
    {
      n: "01",
      label: "What is refundable",
      body: "Prepaid hours you have not used, at the rate you paid for that pack",
    },
    {
      n: "02",
      label: "What is not",
      body: "Hours already worked and logged. Third-party subscriptions, messaging and usage fees, hosting, domains and taxes",
    },
    { n: "03", label: "When to ask, one-time pack", body: "Before the 60-day expiry" },
    {
      n: "04",
      label: "When to ask, monthly plan",
      body: "Before the current cycle resets. Only the current paid cycle is in scope",
    },
    {
      n: "05",
      label: "How to ask",
      /**
       * Split at the address so the email renders as a mailto link, the
       * way the design has it. A refund route nobody can click is a
       * refund route nobody uses.
       */
      body: "Message support from your account, or email ",
      email: "support@sysorastack.com",
      bodyTail:
        ", and say you want to cancel and refund your unused hours. Either one reaches a person at any hour.",
    },
    {
      n: "06",
      label: "What happens next",
      body: "We pause new billable work on that pack, send an itemized ledger of hours used and unused, confirm the amount, and refund it to the original payment method with written confirmation",
    },
    {
      n: "07",
      label: "Cancelling a monthly plan",
      body: "Ask at least 24 hours before your next renewal date. That stops future renewals, and the unused part of the cycle you already paid for is refundable under the same rules",
    },
    {
      n: "08",
      label: "If you disagree with the logged time",
      body: "We review it against the task log with you. Time is never quietly deducted after a refund request",
    },
  ],
  caveatTitle: "Honest caveat:",
  caveatBody:
    " This is an unused-hours guarantee, not a full money-back guarantee. Once we approve a refund, how fast it posts depends on your payment provider, which is outside our control.",
  policyLink: "Full refund policy →",
} as const;

export const costs = {
  eyebrow: "What the price does not cover",
  headline: "Costs that stay yours",
  paragraphs: [
    "Your hours buy Sysora Stack labor. They do not cover third-party software subscriptions, SMS and email usage, telephony charges, AI model fees, hosting, domains, platform licensing, taxes, or any paid external tool, unless a written quote says otherwise.",
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
  quote: '"Genuinely top notch work from Sysora Stack! I recommend 10 out of 10."',
  quoteSource:
    "Upwork review, funnel layout design in GoHighLevel, 30 hours. Founder-led work, with the company written in place of the name.",
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
      q: "Am I paying for a person or for a package?",
      a: "A team, billed by the hour against a balance you buy up front. An 11-person group covering GoHighLevel, automation, integration, web and software work, plus 24/7 human chat and ticket triage at no extra charge.",
    },
    {
      q: "How do I know the hours are real?",
      a: "Every task carries its logged time in the ledger inside your account, next to the balance you have left. If you disagree with an entry, we go through the task log with you.",
    },
    {
      q: "How is time rounded?",
      a: "Time is tracked in 15-minute increments, rounded up to the nearest increment per task. A two-minute fix is logged as 15 minutes, and a task that runs 70 minutes is logged as 75. Every entry is visible to you with what it was spent on, and we do not bill you for our own mistakes or for rework caused by them.",
    },
    {
      q: "Where do I see my hours and send new work?",
      a: "In your account. Your balance, every logged entry and what it was spent on are in there, and so is onboarding. You can send a new task and buy more hours from the same place, and a new order is priced at the tier of that order.",
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
      q: "Do I have to email you every time I need something?",
      a: "No. Send the task from your account and it reaches the team. Chat and ticket triage stay open around the clock as well, at no extra charge, and that is the route for anything urgent or unclear. Sending a task costs you nothing, and the work it turns into is what comes out of your hours.",
    },
    {
      q: "How fast will you respond?",
      a: "We do not publish a response-time commitment, because we have not operationalized one, and a number we cannot hold is worse than no number. Intake is staffed around the clock.",
    },
    {
      q: "How do I cancel a monthly plan?",
      a: "Message support from your account or email support@sysorastack.com, at least 24 hours before your next renewal date. Cancelling stops future renewals and does not refund earlier cycles. The unused hours in the cycle you have already paid for can be refunded, as long as you ask before that cycle resets.",
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
      q: "Who owns what you build?",
      a: "You do. On full payment for the hours used to produce them, the workflows, funnels, configurations, code and documentation we built for you are yours. We keep our own reusable libraries, snapshot templates and internal tooling, and you get a perpetual licence to use those wherever they are embedded in your deliverables. We will not publish your name, your logo or your project as a case study without your written permission.",
    },
    {
      q: "Does Sysora Stack only work in GoHighLevel?",
      a: "GoHighLevel is where most of our work starts. When a job needs n8n, Zapier, Make, a webhook, an API, a database or custom code, the same team builds that part.",
    },
    {
      q: "Are the reviews on this page Sysora Stack client reviews?",
      a: "They are Upwork reviews of work our founder delivered before the company carried the Sysora Stack name, and the people who delivered it run delivery here now. Each review appears once on this page, credited to the job it came from. Where a client wrote a person’s name or a pronoun, we have written the company instead, and the unedited wording stays live on the Upwork profile. We are not going to show you a corporate client roster we do not have yet.",
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

/** Copy for the hour-pack checkout. */
export const checkout = {
  chrome: { title: "Secure checkout", back: "← Back to packages" },
  steps: ["Hours", "Details", "Payment"],
  plan: {
    step: "Step 1 of 3",
    headline: "Confirm your hours",
    lead: "Same seven prices for a one-time pack or a monthly plan. You can change this before you pay.",
    next: "Continue to your details",
    validityOnce: "One-time pack. Your hours are valid for 60 days from purchase.",
    validityMonthly:
      "Monthly plan. Your balance resets each billing cycle and does not carry over. Cancel any time to stop future renewals.",
  },
  details: {
    step: "Step 2 of 3",
    headline: "Who are we working with?",
    lead: "Your account access goes to this email.",
    name: "Full name",
    email: "Work email",
    emailHint: "Your account access is sent to this address after payment.",
    company: "Company",
    timezone: "Your US time zone",
    timezones: [
      "Eastern (ET)",
      "Central (CT)",
      "Mountain (MT)",
      "Pacific (PT)",
      "Alaska (AKT)",
      "Hawaii (HT)",
    ],
    kind: "What best describes you?",
    kinds: ["Marketing agency", "Local business", "SaaS or other"],
    ghl: "Your GoHighLevel account",
    ghlOpts: ["Not set up yet", "Live, built in-house", "Inherited from someone else"],
    tools: "Other tools in play",
    toolOpts: [
      "n8n",
      "Zapier",
      "Make",
      "Stripe",
      "Calendly",
      "WordPress",
      "HubSpot",
      "Twilio",
      "Custom API",
    ],
    back: "Back",
    next: "Continue to payment",
  },
  pay: {
    step: "Step 3 of 3",
    headline: "Payment",
    lead: "Your hour balance is created the moment payment clears.",
    /** Said plainly, because the card form lives on Stripe's side. */
    handoff:
      "Card details are entered on the next screen, inside Stripe. They never touch our servers.",
    /**
     * Split at the two documents so each is a link. Someone ticking a box
     * about terms should be one click from reading them, and A2P review
     * looks for exactly that.
     */
    agree:
      "I understand hours already worked are not refundable, and that unused hours can be refunded under the ",
    agreeRefundLink: "refund policy",
    agreeMid: ". I agree to the ",
    agreeTermsLink: "terms and conditions",
    agreeAnd: " and the ",
    agreePrivacyLink: "privacy policy",
    agreeTail: ".",
    agreeMonthly: " I understand this plan renews monthly until I cancel.",
    agreeError: "Please accept the terms to continue.",
    back: "Back",
    submit: "Continue to secure payment",
    working: "Starting",
    /** What happens after the money moves, said before it does. */
    afterPay:
      "Account access is sent to the email you entered. Onboarding happens in there, and nothing billable starts until you approve the scope.",
  },
  summary: {
    title: "Order summary",
    included: "24/7 human chat and ticket triage",
    includedValue: "Included",
    refundTitle: "Unused hours come back",
    refundBody:
      "Not happy with our work? Get a refund for your unused hours at the rate you paid. Ask before your 60-day pack expires or your monthly cycle resets. Hours already worked are not refundable.",
    bullets: [
      "You approve the scope before anything is built",
      "No automatic overage, ever",
      "No contract. Cancel up to 24 hours before renewal",
    ],
  },
} as const;

/**
 * The band between the final CTA and the footer, added to the design
 * once /book-a-call existed: the page's last word is still "pick a
 * size", and this is the way out for someone who cannot.
 */
/**
 * The strip under the hero pointing at /on-demand-ghl-team.
 *
 * The em-dash in the supplied copy is a comma here. House rules ban
 * em-dashes in anything a customer reads, and the content test fails
 * the build on one, so it could not have shipped as written.
 */
export const agencyBanner = {
  badge: "New, for GHL agencies",
  title: "Running a GHL agency? Meet your on-demand technical team.",
  body: "Funnels, workflows, integrations, and white-label technical support, starting at $95 for 5 hours.",
  cta: "Explore agency support",
  href: "/on-demand-ghl-team",
} as const;

/**
 * The client-portal section, between the delivery timeline and the
 * eight-hour walkthrough.
 *
 * It answers the objection the page cannot argue its way out of —
 * prepaying a stranger — by showing that the balance is visible rather
 * than asserted, so it sits right after the timeline that explains what
 * happens to the money.
 */
export const portalPromise = {
  eyebrow: "What you get the morning after you pay",
  title: "Your hours are not a number you have to trust us about",
  lead: "Prepaying a stranger for time is the hardest part of this offer, so the balance sits in your account and so does everything that moves between us.",
  cards: [
    {
      icon: "clock" as const,
      title: "Hours left",
      body: "What you bought, what each task consumed, what is still there, and when it was logged. If you disagree with an entry, we go through the task log with you.",
    },
    {
      icon: "send" as const,
      title: "Send a task",
      body: "Write what needs doing and a person reads it, comes back with what it takes, and nothing starts until you approve the scope.",
    },
    {
      icon: "plus" as const,
      title: "Buy more hours",
      body: "When a stretch of work needs more than you have, order it there. Each order is priced at the tier of that order, so a 25-hour top-up is $18 an hour whatever you bought last time.",
    },
  ],
  closing:
    "Onboarding happens in there too. Filling it in costs no hours, and so does sending a task. Scoping, configuration and build work are what the hours are for. Chat and ticket triage stay open around the clock as well, at no extra charge, and that is still the route for anything urgent.",
} as const;

export const bookCall = {
  eyebrow: "Free 15-minute call",
  title: "Not sure where to start? Book your call with us.",
  body: "Walk us through your setup. You leave with a clear next step and no obligation to hire us.",
  cta: "Book your call",
  href: "/book-a-call",
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
        { label: "What we do", href: "#work" },
        { label: "How it runs", href: "#how" },
        { label: "Request an estimate", href: "/request-estimate" },
        { label: "Checkout", href: "/checkout/hours" },
        { label: "Book a call", href: "/book-a-call" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms and conditions", href: "/terms" },
        { label: "Privacy policy", href: "/privacy-policy" },
        // The policy itself, not the homepage pitch for it: the Pricing
        // column already links the section at /#refund.
        { label: "Refund policy", href: "/terms#s-7" },
      ],
    },
  ],
  copyright: "© 2026 Sysora Stack. All rights reserved.",
  disclaimer:
    "Sysora Stack is not an official HighLevel employee team, partner or certified provider.",
} as const;
