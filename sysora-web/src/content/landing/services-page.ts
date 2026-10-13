import { routes } from "@/config/site";

export type ServiceCard = {
  /** Badge over the card image. */
  kind: string;
  /** Describes the screenshot that belongs here, until there is one. */
  shot: string;
  title: string;
  promise: string;
  body: string;
  chips: string[];
  priceLabel: string;
  price: string;
};

export const servicesPage = {
  meta: {
    title: "Services and pricing",
    description:
      "Fixed scope, fixed price. Every service is a job with a defined start, a defined end, and a price you see before you commit — from a $49 systems review to full builds.",
  },

  eyebrow: "Services and pricing",
  headline: { lead: "Fixed scope.", accent: "Fixed price." },
  intro:
    "Every service below is a job with a defined start, a defined end, and a price you see before you commit. Pick the one that matches your problem, or send us the problem and we will tell you which it is.",
  priceChips: [
    { label: "Systems review", value: "$49" },
    { label: "A2P 10DLC", value: "from $249" },
    { label: "Builds", value: "from $499" },
    { label: "Managed team", value: "$2,000/mo" },
  ],
  primaryCta: { label: "See all services and prices", href: "#catalog" },
  secondaryCta: { label: "Get a quote", href: routes.requestEstimate },

  featured: {
    badge: "Most requested",
    category: "Compliance",
    title: "A2P 10DLC Verification for GoHighLevel",
    promise:
      "We submit the whole registration for you. Approved, or you get a full refund.",
    body: "Every GoHighLevel sub-account that sends SMS to US numbers has to be registered under A2P 10DLC first. We complete the brand and campaign registration, submit it inside your account, and resubmit at our cost if it comes back rejected.",
    chips: [
      "Approved, or a full refund",
      "Submitted inside your account",
      "Free resubmissions",
    ],
    priceLabel: "Starting at",
    price: "$249",
    cta: "Get a quote",
    panel: {
      status: "A2P 10DLC registered",
      title: "Approved to send",
      body: "Brand and campaign cleared inside your GoHighLevel account.",
    },
  },

  grid: {
    heading: "Everything else we build",
    metaSuffix: "prices shown",
  },

  services: [
    {
      kind: "Build",
      shot: "Screenshot: GoHighLevel account build",
      title: "GoHighLevel Setup & Rebuild",
      promise: "Your account set up the way an agency would run it.",
      body: "Pipelines, calendars, forms, sub-account structure, sending setup, and the automations that hold it together. Built from scratch or cleaned up from what is already there.",
      chips: ["Sub-accounts", "Pipelines", "Calendars"],
      priceLabel: "Starting at",
      price: "$899",
    },
    {
      kind: "Build",
      shot: "Screenshot: funnel or landing page",
      title: "Funnel & Website Build",
      promise: "Pages that load fast and actually convert.",
      body: "Landing pages, webinar registration, checkout, and full sites built in GoHighLevel or on your own stack, wired to the CRM and tested end to end before launch.",
      chips: ["Funnels", "Checkout", "Webinars"],
      priceLabel: "Starting at",
      price: "$699",
    },
    {
      kind: "Automation",
      shot: "Screenshot: n8n or Make workflow canvas",
      title: "Workflow Automation",
      promise: "The manual handoffs between your tools, removed.",
      body: "We map the process, then build it in n8n, Make, or Zapier with error handling and alerts, so a failed step gets noticed by us instead of by your client.",
      chips: ["n8n", "Make", "Zapier"],
      priceLabel: "Per workflow, from",
      price: "$499",
    },
    {
      kind: "Integration",
      shot: "Screenshot: API or webhook logs",
      title: "API & Custom Integrations",
      promise: "Two systems that were never meant to talk, talking.",
      body: "Custom API work, webhooks, middleware, and sync jobs between your CRM, billing, spreadsheets, and internal tools. Documented so the next person can follow it.",
      chips: ["REST APIs", "Webhooks", "Middleware"],
      priceLabel: "Starting at",
      price: "$1,200",
    },
    {
      kind: "Data",
      shot: "Screenshot: CRM migration mapping sheet",
      title: "CRM Migration & Data Cleanup",
      promise: "Move platforms without losing your history.",
      body: "Contacts, notes, tags, pipelines, and campaign history mapped and moved, duplicates merged, and a reconciliation report so you can see nothing went missing.",
      chips: ["Mapping", "Deduplication", "Reconciliation"],
      priceLabel: "Starting at",
      price: "$1,500",
    },
    {
      kind: "AI",
      shot: "Screenshot: AI agent handling a lead",
      title: "AI Agents & Assistants",
      promise: "AI put to work on a real job, not a demo.",
      body: "Lead qualification, inbox triage, call summaries, and internal answer bots built on your own data, with the guardrails and review steps that make them safe to leave running.",
      chips: ["Qualification", "Summaries", "Internal bots"],
      priceLabel: "Per agent, from",
      price: "$1,900",
    },
    {
      kind: "Build",
      shot: "Screenshot: client portal or dashboard",
      title: "Web App Development",
      promise: "The internal tool your spreadsheet has outgrown.",
      body: "Client portals, dashboards, and internal apps built with a real database and auth. Full stack work, handed over with source and deployment notes.",
      chips: ["Portals", "Dashboards", "Full stack"],
      priceLabel: "Per phase, from",
      price: "$3,500",
    },
    {
      kind: "Advisory",
      shot: "Screenshot: systems map document",
      title: "Systems Audit & Documentation",
      promise: "A written map of how your business actually runs.",
      body: "Every tool, workflow, and handoff documented, with the gaps and single points of failure flagged and ranked by what they cost you each month.",
      chips: ["Process map", "Risk list", "SOPs"],
      priceLabel: "One time",
      price: "$49",
    },
  ] as ServiceCard[],

  priceFootnote:
    "Prices are starting points for a typical job. Final scope and price are confirmed in writing before any work begins.",

  closing: {
    heading: "Not sure which one you need",
    body: "Send the problem, not the spec. We come back with the service that fits, the scope, and the price before anyone commits.",
    primary: { label: "Submit a build request", href: routes.requestEstimate },
    secondary: { label: "Browse the hour packs", href: "/#packages" },
    note: "Free to submit. No obligation to hire us.",
  },
} as const;
