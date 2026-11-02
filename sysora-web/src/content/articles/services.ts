import { CONTENT_DATE, type Article } from "./types";

/**
 * The service pages.
 *
 * These describe what the hours are spent on. They deliberately carry no
 * price of their own. The old catalogue sold fixed-price jobs and that
 * offer was retired, so every job here is scoped in hours and billed at
 * the published rate table, which lives in one place in sales.ts.
 */

const dates = { published: CONTENT_DATE, modified: CONTENT_DATE };

const PRICE_LINE =
  "This work is billed against prepaid hours at the [published rates](/pricing), from $19 an hour down to $13. We scope each task in writing and nothing starts until you approve it.";

export const services: readonly Article[] = [
  {
    kind: "service",
    slug: "gohighlevel-setup-and-rebuild",
    eyebrow: "GoHighLevel",
    title: "GoHighLevel setup and account rebuilds",
    metaTitle: "GoHighLevel Setup and Account Rebuilds",
    description:
      "GoHighLevel account setup and rebuilds, billed by the hour from $13. Pipelines, calendars, forms, workflows and sub-accounts, scoped before work starts.",
    answer:
      "Sysora Stack sets up new GoHighLevel accounts and rebuilds ones that have stopped making sense. That covers sub-accounts, pipelines, calendars, forms, workflows and sending setup. You buy prepaid hours, we scope each task in writing, and nothing starts until you approve it. Unused hours are refundable.",
    ...dates,
    blocks: [
      { k: "h2", text: "What does a GoHighLevel setup include?" },
      {
        k: "ul",
        items: [
          "Account and sub-account setup, including onboarding",
          "Snapshots and templates",
          "Pipelines, opportunities, forms, surveys, calendars, booking and lead routing",
          "Workflows, triggers, email and SMS configuration",
          "Permissions, data imports and cleanup",
          "SaaS-mode configuration for agencies that resell the platform",
        ],
      },
      { k: "h2", text: "Can you take over an account somebody else built?" },
      {
        k: "p",
        text: "Yes, and a good share of our work starts that way. We go through the workflows, pipelines and data first. We tell you what is worth keeping and what should be rebuilt. Then we do the agreed work against your hours.",
      },
      { k: "h2", text: "What does it cost?" },
      { k: "p", text: PRICE_LINE },
      {
        k: "p",
        text: "For outside reference, our [GoHighLevel setup cost guide](/guides/gohighlevel-setup-cost) lists what other providers publish.",
      },
      { k: "h2", text: "What is not included?" },
      {
        k: "p",
        text: "Your hours buy our labor. Your HighLevel subscription, SMS and email usage, and any paid external tool stay on your own account. We do not guarantee lead volume, conversion rates or revenue.",
      },
    ],
    faq: [
      {
        q: "Do you need my password?",
        a: "No. We ask for delegated or role-based access rather than shared passwords. We request the minimum permissions a job needs.",
      },
      {
        q: "Who owns what you build?",
        a: "You do, on full payment for the hours used to produce it.",
      },
    ],
    related: [
      "/guides/gohighlevel-snapshots",
      "/guides/gohighlevel-workflow-not-triggering",
      "/services/workflow-automation",
    ],
  },
  {
    kind: "service",
    slug: "a2p-10dlc-registration",
    eyebrow: "Compliance",
    title: "A2P 10DLC registration for GoHighLevel",
    metaTitle: "A2P 10DLC Registration for GoHighLevel",
    description:
      "A2P 10DLC brand and campaign registration inside your GoHighLevel account, billed by the hour. Consent pages fixed first. Carriers decide approval.",
    answer:
      "A2P 10DLC is the carrier registration standard for application-to-person SMS sent over US local numbers. Sysora Stack prepares the brand and campaign registration inside your GoHighLevel account, fixes consent pages first, and handles resubmissions, billed against prepaid hours. Registry and carriers decide approval, so nobody can promise a first-pass result.",
    ...dates,
    blocks: [
      { k: "h2", text: "What does the work include?" },
      {
        k: "ul",
        items: [
          "Checking that your website, opt-in form, privacy policy and terms agree with each other",
          "Brand registration in the Trust Center",
          "Campaign use case, description, sample messages and opt-in details",
          "Working through required fixes after a rejection",
          "Confirming numbers are linked to the approved campaign",
        ],
      },
      { k: "h2", text: "What does A2P registration cost?" },
      {
        k: "p",
        text: "Two separate costs apply. Our time comes out of your hours at the [published rates](/pricing). Registry and carrier fees are charged separately through your platform. The current fees are listed in our [A2P 10DLC guide](/guides/a2p-10dlc-registration-gohighlevel).",
      },
      { k: "h2", text: "Can you guarantee approval?" },
      {
        k: "p",
        text: "No. Approval is decided by the registry and the carriers, on their timeline. Any provider promising a guaranteed first pass is promising something they do not control.",
      },
    ],
    faq: [
      {
        q: "Is the registration fee included in my hours?",
        a: "No. Registry and carrier fees are separate from your hours.",
      },
      {
        q: "Does registering a brand let me start sending?",
        a: "No. HighLevel states that a campaign must also be approved before messages can be sent.",
      },
    ],
    sources: [
      {
        label: "HighLevel: What is A2P 10DLC",
        url: "https://help.gohighlevel.com/support/solutions/articles/155000002380-what-is-a2p-10-dlc-brand-and-campaign-registration",
      },
    ],
    related: [
      "/guides/a2p-10dlc-registration-gohighlevel",
      "/guides/gohighlevel-missed-call-text-back",
      "/services/gohighlevel-setup-and-rebuild",
    ],
  },
  {
    kind: "service",
    slug: "funnels-and-websites",
    eyebrow: "Build",
    title: "Funnels, websites and checkout builds",
    metaTitle: "GoHighLevel Funnel and Website Builds",
    description:
      "Landing pages, webinar funnels, checkout and full sites, built in GoHighLevel or your own stack and wired to the CRM. Billed by the hour from $13.",
    answer:
      "Sysora Stack builds landing pages, webinar registration funnels, checkout flows and full websites, in GoHighLevel or on your own stack. Every page is wired to your CRM and tested before launch. The work is billed against prepaid hours from $19 down to $13, and you approve the scope before anything starts.",
    ...dates,
    blocks: [
      { k: "h2", text: "What can you build?" },
      {
        k: "ul",
        items: [
          "Funnels, landing pages and websites",
          "Checkout setup and order pages",
          "Webinar registration, reminders and replays",
          "Fixes and ongoing maintenance on existing pages",
        ],
      },
      { k: "h2", text: "What does a funnel build look like in practice?" },
      {
        k: "p",
        text: "One webinar funnel on our record was planned for one week and ran close to two months, because both sides kept testing for what would fail under load. The [full write-up](/case-studies/webinar-funnel-two-months) explains why that overrun was the right call.",
      },
      { k: "h2", text: "What does it cost?" },
      { k: "p", text: PRICE_LINE },
    ],
    related: [
      "/case-studies/webinar-funnel-two-months",
      "/case-studies/53-hour-ghl-checkout-integration",
      "/for/local-business",
    ],
  },
  {
    kind: "service",
    slug: "workflow-automation",
    eyebrow: "Automation",
    title: "Workflow automation with n8n, Make and Zapier",
    metaTitle: "n8n, Make and Zapier Workflow Automation",
    description:
      "Workflow design, build, repair and maintenance in n8n, Make, Zapier and GoHighLevel, with error handling included. Billed by the hour from $13.",
    answer:
      "Sysora Stack designs, builds and repairs workflows in n8n, Make, Zapier and GoHighLevel. We map the process first, then build it with error handling and monitoring, so a failed step gets noticed. The work comes out of prepaid hours from $19 down to $13, and nothing starts before you approve the scope.",
    ...dates,
    blocks: [
      { k: "h2", text: "What does the automation work cover?" },
      {
        k: "ul",
        items: [
          "n8n, Zapier and Make workflow design, build, repair and maintenance",
          "GoHighLevel workflows, triggers and cleanup",
          "Webhooks, data sync and error-handling workflows",
          "AI-assisted steps where they fit the job",
        ],
      },
      { k: "h2", text: "Why is error handling part of the build?" },
      {
        k: "p",
        text: "A clever automation that breaks every week is not a good system. Error handling and monitoring belong in the build, not in a follow-up ticket.",
      },
      { k: "h2", text: "What does it cost?" },
      { k: "p", text: PRICE_LINE },
    ],
    related: [
      "/guides/n8n-gohighlevel-integration",
      "/guides/gohighlevel-workflow-not-triggering",
      "/services/api-integrations",
    ],
  },
  {
    kind: "service",
    slug: "api-integrations",
    eyebrow: "Integration",
    title: "API and custom integrations",
    metaTitle: "GoHighLevel API and Custom Integrations",
    description:
      "Custom API work, webhooks, middleware and data sync between GoHighLevel and the systems around it. Documented and billed by the hour from $13.",
    answer:
      "Sysora Stack builds custom integrations between GoHighLevel and the systems around it, using REST APIs, webhooks, middleware and scheduled sync jobs. Each integration includes error handling and written documentation. The work is billed against prepaid hours, and substantial builds get a written estimate before any time is spent on them.",
    ...dates,
    blocks: [
      { k: "h2", text: "What can you connect?" },
      {
        k: "ul",
        items: [
          "GoHighLevel to your billing, CRM, spreadsheets and internal tools",
          "Inbound and outbound webhooks",
          "Middleware and scheduled sync jobs",
          "WhatsApp API work and other third-party APIs",
        ],
      },
      { k: "h2", text: "What does the API limit in practice?" },
      {
        k: "p",
        text: "HighLevel publishes its limits, and they shape how a sync should be built. Our [GoHighLevel API guide](/guides/gohighlevel-api) covers authentication, rate limits and example requests.",
      },
      { k: "h2", text: "What does it cost?" },
      { k: "p", text: PRICE_LINE },
    ],
    related: [
      "/guides/gohighlevel-api",
      "/guides/n8n-gohighlevel-integration",
      "/services/web-app-development",
    ],
  },
  {
    kind: "service",
    slug: "crm-migration",
    eyebrow: "Data",
    title: "CRM migration to GoHighLevel",
    metaTitle: "CRM Migration to GoHighLevel",
    description:
      "Move contacts, deals, pipelines and notes to GoHighLevel from HubSpot, Keap, ActiveCampaign or Pipedrive. Mapped, tested and billed by the hour.",
    answer:
      "Sysora Stack moves contacts, deals, notes, tags and pipelines into GoHighLevel from CRMs such as HubSpot, Keap, ActiveCampaign and Pipedrive. We map fields first, run a small test import, then reconcile the results. Automations and forms are rebuilt, because they do not transfer. The work is billed against prepaid hours.",
    ...dates,
    blocks: [
      { k: "h2", text: "What moves and what gets rebuilt?" },
      {
        k: "table",
        head: ["Item", "How it moves"],
        rows: [
          ["Contacts and custom fields", "Native import or CSV, depending on the source"],
          ["Deals", "Imported as opportunities in a pipeline and stage"],
          ["Automations", "Rebuilt as HighLevel workflows"],
          ["Forms and landing pages", "Rebuilt in the HighLevel builders"],
          ["Tracking codes", "Added again in HighLevel"],
        ],
      },
      { k: "h2", text: "Which CRMs do you have guides for?" },
      {
        k: "ul",
        items: [
          "[HubSpot to GoHighLevel](/guides/migrate-hubspot-to-gohighlevel)",
          "[Keap to GoHighLevel](/guides/migrate-keap-to-gohighlevel)",
          "[ActiveCampaign to GoHighLevel](/guides/migrate-activecampaign-to-gohighlevel)",
          "[Pipedrive to GoHighLevel](/guides/migrate-pipedrive-to-gohighlevel)",
        ],
      },
      { k: "h2", text: "What does it cost?" },
      { k: "p", text: PRICE_LINE },
    ],
    related: [
      "/guides/migrate-hubspot-to-gohighlevel",
      "/guides/migrate-activecampaign-to-gohighlevel",
      "/services/gohighlevel-setup-and-rebuild",
    ],
  },
  {
    kind: "service",
    slug: "ai-agents",
    eyebrow: "AI",
    title: "AI agents and AI-assisted workflows",
    metaTitle: "AI Agents and AI-Assisted Workflows",
    description:
      "AI-assisted workflows and agents built into your GoHighLevel and automation stack, where they fit the job. Billed by the hour. AI model fees stay yours.",
    answer:
      "Sysora Stack builds AI-assisted workflows and agents where they fit the job, such as lead qualification, inbox triage and call summaries. They sit inside your GoHighLevel and automation stack, with review steps. The work is billed against prepaid hours, and AI model fees stay on your own account rather than being bundled in.",
    ...dates,
    blocks: [
      { k: "h2", text: "When is an AI agent the right tool?" },
      {
        k: "p",
        text: "When the job has variable input and a checkable output. Sorting an inbox fits that description. Sending a contract without review does not. If a plain workflow does the job more reliably, we will tell you so.",
      },
      { k: "h2", text: "What do you build?" },
      {
        k: "ul",
        items: [
          "Lead qualification and routing",
          "Inbox triage and call summaries",
          "Internal answer tools built on your own data",
          "Review steps and error handling around the model",
        ],
      },
      { k: "h2", text: "What does it cost?" },
      {
        k: "p",
        text: "Our time is billed at the [published rates](/pricing). AI model fees are separate and stay on your account, unless a written quote says otherwise.",
      },
    ],
    related: [
      "/services/workflow-automation",
      "/guides/n8n-gohighlevel-integration",
      "/services/api-integrations",
    ],
  },
  {
    kind: "service",
    slug: "web-app-development",
    eyebrow: "Software",
    title: "Web app and portal development",
    metaTitle: "Web App and Client Portal Development",
    description:
      "Custom web apps, dashboards and client portals in React, Next.js, Node.js and Laravel. Written estimate first, billed by the hour from $13.",
    answer:
      "Sysora Stack builds custom web apps, dashboards, client portals and internal tools using React, Next.js, Node.js and Laravel. Substantial work gets a written time estimate and a milestone plan first. Time is billed against prepaid hours from $19 down to $13, and you get the source code and deployment notes at handover.",
    ...dates,
    blocks: [
      { k: "h2", text: "What can you build?" },
      {
        k: "ul",
        items: [
          "Client portals and dashboards",
          "Internal tools that have outgrown a spreadsheet",
          "Scripts and software integrations",
          "Hosting, deployment and infrastructure help, as scoped",
        ],
      },
      { k: "h2", text: "Have you built software, or only connected tools?" },
      {
        k: "p",
        text: "The largest engineering engagement on our record is a [357-hour web app](/case-studies/357-hour-web-app) in TypeScript on Neon Postgres.",
      },
      { k: "h2", text: "What does it cost?" },
      { k: "p", text: PRICE_LINE },
    ],
    related: [
      "/case-studies/357-hour-web-app",
      "/services/api-integrations",
      "/request-estimate",
    ],
  },
];
