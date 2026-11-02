/**
 * Copy for the new hub and entity pages: /services, /guides,
 * /case-studies, /pricing, /about and /for/local-business.
 *
 * Prices are not written here. /pricing renders them from `packs` in
 * sales.ts, and the rules around them from `packages` and `refund` there.
 */

export const PAGES_UPDATED = "2026-11-01";

export const servicesHub = {
  meta: {
    title: "GoHighLevel and Automation Services",
    description:
      "GoHighLevel setup, A2P registration, funnels, automation, integrations, CRM migration, AI agents and web apps. Billed by the hour from $13, scoped first.",
  },
  eyebrow: "Services",
  title: "What the hours get spent on",
  answer:
    "Sysora Stack does GoHighLevel setup and rebuilds, A2P 10DLC registration, funnels and websites, workflow automation, API integrations, CRM migration, AI agents and web apps. All of it is billed against prepaid hours from $19 down to $13, and you approve a written scope before work starts on any task.",
} as const;

export const guidesHub = {
  meta: {
    title: "GoHighLevel Guides",
    description:
      "Plain guides to GoHighLevel: A2P 10DLC, setup costs, snapshots, SaaS mode, n8n, the API, CRM migrations and hiring. Checked against vendor documentation.",
  },
  eyebrow: "Guides",
  title: "GoHighLevel guides, checked against the documentation",
  answer:
    "These guides cover the GoHighLevel problems we are asked about most, including A2P registration, setup costs, snapshots, SaaS mode, integrations and migrations. Platform facts are checked against vendor documentation, each page lists its sources and shows the date it was checked, and we say so when the sources disagree.",
} as const;

export const caseStudiesHub = {
  meta: {
    title: "GoHighLevel and Software Case Studies",
    description:
      "Four engagements from the Sysora Stack founder's public Upwork record, with real hours, dollars and dates, including a project that ran well over its plan.",
  },
  eyebrow: "Case studies",
  title: "Real hours, real dollars, and one honest overrun",
  answer:
    "These four write-ups come from our founder's public Upwork record of 19 jobs and 1,220 logged hours. Each one gives the real hours, dates and dollars where the record shows them. Clients are not named, nothing has been added about their businesses, and one of the four explains a project that overran.",
} as const;

export const pricingPage = {
  meta: {
    title: "GoHighLevel and Automation Hourly Pricing",
    description:
      "Seven published packs from 5 to 150 hours, $19 an hour down to $13. One-time or monthly at the same prices. No contract, and unused hours are refundable.",
  },
  eyebrow: "Pricing",
  title: "Seven prices, all published",
  answer:
    "Sysora Stack sells prepaid hours in seven sizes, from 5 hours at $95 to 150 hours at $1,950. The rate falls from $19 an hour to $13. One-time packs last 60 days, monthly balances reset each cycle, and unused hours are refundable at the rate you paid. There is no contract.",
  tableCaption: "The published packs, in US dollars",
  rulesTitle: "How are hours used?",
  rules: [
    "Time is logged in 15-minute increments, rounded up per task.",
    "Every entry shows in your account, with what it was spent on.",
    "Nothing starts until you approve the scope.",
    "Scoping and sending a task cost no hours.",
    "We do not work past your balance and bill you afterwards.",
  ],
  refundTitle: "What happens to unused hours?",
  refundBody:
    "Prepaid hours you have not used are refundable at the rate you paid, up to the pack's 60-day expiry or the end of the current monthly cycle. Hours already worked are not refundable. The [refund rules](/#refund) and the [terms](/terms#s-7) have the full detail.",
  cancelTitle: "How do you cancel a monthly plan?",
  cancelBody:
    "Ask at least 24 hours before your next renewal date. That stops future renewals.",
  costsTitle: "What is not included?",
  costsBody:
    "Third-party subscriptions, SMS, email and telephony usage, AI model fees, hosting, domains, platform licensing and taxes. See how this compares in our [setup cost guide](/guides/gohighlevel-setup-cost).",
  calculatorCta: "Open the calculator",
  estimateCta: "Request a Project Estimate",
} as const;

export const aboutPage = {
  meta: {
    title: "About Sysora Stack and Its Founder",
    description:
      "Sysora Stack was built on 1,220 logged hours across 19 Upwork jobs, all rated 5.0. Who founded it, how the work started, and what we will not promise.",
  },
  eyebrow: "About",
  title: "A new company, built on work that is not new",
  answer:
    "Sysora Stack sells prepaid GoHighLevel, automation and development hours. It was founded by Nikhil, whose freelance record on Upwork is 19 jobs and 1,220 logged hours, with a 100% Job Success Score, Top Rated status and a 5.0 rating on every completed job. You can check that record yourself.",
  bioTitle: "How did this start?",
  bio: [
    "Before the company had a name, Nikhil logged 1,220 hours inside other people's businesses. Almost all of those jobs started the same way. Something had broken, or two tools had never talked to each other, and nobody internally could fix it.",
    "One job was supposed to take a week and ran close to two months, because both sides kept testing for what would fail. Another began as a small tech operations project and became 640 hours across six months.",
    "The pattern got obvious. Nobody was hiring for an automation. They were hiring because nobody in the building could answer one question, which was how this is supposed to work. Sysora Stack exists because a business should not need five specialists to get its own operations running properly.",
  ],
  recordTitle: "What does the record show?",
  record: [
    { value: "19", label: "Jobs" },
    { value: "1,220", label: "Hours logged" },
    { value: "100%", label: "Job Success Score" },
    { value: "5.0", label: "On every completed job" },
  ],
  recordNote:
    "This is a freelance-platform record of founder-led work, not company-branded client results. Read the [case studies](/case-studies) for what it looked like up close.",
  stackTitle: "What do we work in?",
  notTitle: "What do we not do?",
  not: [
    "We do not promise lead volume, conversion rates, revenue or uptime.",
    "We do not publish a response-time target, and we do not include unlimited free calls or a dedicated engineer by default.",
    "We do not offer a full money-back guarantee. Unused hours are refundable, and hours already worked are not.",
    "We are not an official HighLevel employee team, partner or certified provider.",
    "We will not show a corporate client roster that we do not have yet.",
  ],
  contactTitle: "How do you reach us?",
  upworkLabel: "Upwork profile",
  linkedInLabel: "LinkedIn",
  photoAlt: "Nikhil, founder of Sysora Stack",
} as const;

export const localBusinessPage = {
  meta: {
    title: "GoHighLevel for US Local Businesses",
    description:
      "Missed-call text back, follow-up, booking and CRM cleanup for US local businesses, built in GoHighLevel and billed by the hour. No twelve-month contract.",
  },
  eyebrow: "For US local businesses",
  title: "The leads are arriving. The follow-up is not.",
  answer:
    "Sysora Stack builds the follow-up system for US local businesses inside GoHighLevel, including missed-call text back, SMS and email follow-up, booking calendars and CRM cleanup. You buy prepaid hours rather than sign a contract, and approve the scope first. We do not promise more leads. We make sure existing leads get answered.",
  startTitle: "Where should a local business start?",
  startBody:
    "Most start with 10 or 25 hours, at [$190 or $450](/pricing), then move to a smaller monthly plan if they want someone on hand afterwards. Our [missed call text back guide](/guides/gohighlevel-missed-call-text-back) shows the first thing we usually build.",
  related: [
    "/guides/gohighlevel-missed-call-text-back",
    "/guides/a2p-10dlc-registration-gohighlevel",
    "/services/gohighlevel-setup-and-rebuild",
  ],
} as const;

/** The agency hub's own opening answer, placed under its hero copy. */
export const agencyAnswer =
  "Sysora Stack is a white-label GoHighLevel and automation team for US marketing agencies and GHL SaaS owners. You keep the client and we do the delivery, billed against prepaid hours from $19 down to $13. There is no contract or full-time hire, and you can start with 5 hours for $95.";
