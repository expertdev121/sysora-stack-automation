/**
 * Copy for /on-demand-ghl-team, from the "Sysora GHL Specific Page"
 * design.
 *
 * A landing page aimed at one audience, GoHighLevel agencies, rather
 * than the homepage's general offer. Same prices, same terms, same
 * checkout: only the framing is different, so nothing here may state a
 * price or a rule that the homepage and the terms do not already agree
 * with.
 */

/** Where the buying CTAs go. The one published checkout shape. */
export const GHL_CHECKOUT_HREF = "/checkout/hours?hours=5&billing=once";

export const ghlTeam = {
  meta: {
    title: "On-Demand GoHighLevel Team for Agencies",
    description:
      "White-label GoHighLevel, automation and development help for agencies, by the hour. Start with 5 prepaid hours for $95. No contract, no full-time hire, unused hours refundable.",
  },

  nav: [
    { label: "Services", href: "#services" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Starter package", href: "#starter" },
    { label: "Demo", href: "#demo" },
    { label: "FAQ", href: "#faq" },
  ],

  hero: {
    eyebrow: "For GoHighLevel agencies",
    titleLead: "Your on-demand GoHighLevel team.",
    titleAccent: "Without the full-time hire.",
    subhead: "You grow your agency. We handle the technical work.",
    body: "Funnels, workflows, automations, integrations, and client requests piling up? Sysora Stack gives your agency access to a flexible, white-label technical team that helps you deliver client projects without the cost and commitment of hiring in-house.",
    primary: "Book a Free 15-Minute Call",
    secondary: "Get Started, 5 Hours for $95",
    chips: ["Flexible prepaid hours", "White-label support", "No full-time hire required"],
    /** The mock delivery queue beside the headline. Illustrative. */
    panel: {
      title: "Delivery queue",
      note: "Your brand, our build",
      rows: [
        {
          initials: "BD",
          task: "Lead follow-up workflow",
          meta: "Bright Dental, subaccount",
          status: "Delivered",
          tone: "done" as const,
        },
        {
          initials: "NR",
          task: "Funnel and booking calendar",
          meta: "Northside Realty, build",
          status: "In progress",
          tone: "active" as const,
          progress: 62,
        },
        {
          initials: "PH",
          task: "Zapier to GHL contact sync",
          meta: "Peak HVAC, integration",
          status: "Scoped",
          tone: "queued" as const,
        },
      ],
      footerLabel: "Next client request",
      footerAction: "Share task",
      badgeTitle: "5 hours, $95",
      badgeNote: "Agency starter package",
    },
  },

  problem: {
    eyebrow: "The growth problem",
    title: "More clients shouldn't mean more technical headaches",
    lead: "You've worked hard to grow your agency. But as client work increases, so does the technical workload.",
    pains: [
      "You're spending too much time fixing workflows instead of finding new clients.",
      "Client projects are waiting because your technical team is stretched thin.",
      "You need GoHighLevel expertise, but you're not ready for another full-time hire.",
      "Small technical requests keep interrupting your day.",
      "You want to say yes to more client work without worrying about who will build it.",
    ],
    calloutTitle: "Your agency needs more delivery capacity, not more complexity.",
    calloutBody: "That's where Sysora Stack comes in.",
  },

  services: {
    eyebrow: "What we do",
    title: "Meet your behind-the-scenes GoHighLevel team",
    lead: "Sysora Stack helps agencies execute technical work while they stay focused on sales, strategy, and client relationships.",
    cards: [
      {
        icon: "build" as const,
        title: "GoHighLevel builds and support",
        body: "Funnels, forms, calendars, pipelines, workflows, account setup, troubleshooting, and ongoing improvements.",
      },
      {
        icon: "flow" as const,
        title: "Automations and integrations",
        body: "Connect your tools, automate repetitive processes, and build workflows using GoHighLevel, n8n, Zapier, Make, and APIs.",
        tags: ["n8n", "Zapier", "Make", "APIs"],
      },
      {
        icon: "page" as const,
        title: "Funnels, websites and landing pages",
        body: "Build, update, and maintain the pages and systems your clients need.",
      },
      {
        icon: "wrench" as const,
        title: "Custom technical requests",
        body: "From small fixes to more involved implementation work, share your requirements and we'll help assess the scope.",
      },
      {
        icon: "shield" as const,
        title: "White-label technical delivery",
        body: "Get behind-the-scenes implementation support while your agency remains the face of the client relationship.",
        whiteLabel: { clientSees: "Your agency", behindScenes: "Sysora Stack" },
      },
    ],
    closingLine: "One technical partner. Flexible hours. Less work sitting on your plate.",
    closingCta: "Talk to Our Team",
  },

  howItWorks: {
    eyebrow: "How it works",
    title: "Technical capacity that grows with your workload",
    steps: [
      {
        n: "1",
        title: "Share your task",
        body: "Tell us what you need built, fixed, connected, or improved. We'll review the requirements and estimate the time needed.",
      },
      {
        n: "2",
        title: "Choose your hours",
        body: "Start with a small prepaid package or select more hours for a larger backlog.",
      },
      {
        n: "3",
        title: "We handle the technical work",
        body: "Our team works on the agreed tasks, keeping technical execution moving while you focus on your agency.",
      },
      {
        n: "4",
        title: "Scale up when you need to",
        body: "Have more projects? Add more hours. Have a quieter month? There's no need to maintain an extra full-time hire.",
      },
    ],
  },

  starter: {
    eyebrow: "Agency starter package",
    title: "Start small. See how we work.",
    lead: "Try Sysora Stack with a clearly defined technical task before committing to a larger package.",
    biggerPrompt: "Have a bigger project?",
    biggerCta: "Book a Free 15-Minute Call",
    price: "$95",
    priceUnit: "/ 5 hours",
    priceRate: "$19 an hour",
    includedTitle: "What's included",
    included: [
      "Five prepaid technical hours",
      "Initial task review and effort estimate",
      "Technical implementation within the purchased hours",
      "Support for eligible GoHighLevel, automation, integration, or website tasks",
      "The option to purchase additional hours as needed",
    ],
    cta: "Start With 5 Hours, $95",
    note: "Five hours may not be enough to complete every project. We'll help estimate the required time before work begins. Unused-hour refunds are subject to our applicable terms.",
  },

  why: {
    eyebrow: "Why agencies choose us",
    title: "Why partner with Sysora Stack?",
    cards: [
      {
        title: "Built for agency workloads",
        body: "Get help with the technical tasks that come with managing multiple client accounts.",
      },
      {
        title: "White-label friendly",
        body: "Keep your agency's brand and client relationships front and center.",
      },
      {
        title: "Pay for the hours you need",
        body: "Start with a small package and add capacity when your workload grows.",
      },
      {
        title: "Multiple technical skills",
        body: "From GoHighLevel workflows to websites, integrations, and custom development.",
      },
      {
        title: "A real technical team",
        body: "Work with people who can help implement your requirements, not just another software tool you have to learn.",
      },
    ],
  },

  demo: {
    eyebrow: "See what we can build",
    title: "From new lead to automated follow-up",
    lead: "See an example of a GoHighLevel workflow that captures a lead, triggers follow-up messages, updates a pipeline, and notifies the team.",
    steps: ["Lead captured", "Follow-up sent", "Pipeline updated", "Team notified"],
  },

  faq: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    lead: "Something not covered here?",
    leadCta: "Book a free 15-minute call.",
    items: [
      {
        q: "Is Sysora Stack a freelancer or a technical team?",
        a: "Sysora Stack provides technical delivery through a team that supports GoHighLevel, automations, integrations, websites, and development tasks.",
      },
      {
        q: "Can you work behind the scenes for my agency?",
        a: "Yes. We support white-label technical work so your agency can remain the primary point of contact for your clients.",
      },
      {
        q: "Do I have to commit to a monthly contract?",
        a: "No. You can begin with a one-time prepaid hours package. Monthly options are also available.",
      },
      {
        q: "What if my project needs more than five hours?",
        a: "We'll help estimate the effort. If additional hours are needed, you can purchase more before continuing.",
      },
      {
        q: "Do you only support GoHighLevel?",
        a: "No. We also work with n8n, Zapier, Make, websites, integrations, and other technical requirements.",
      },
      {
        q: "What happens to unused hours?",
        a: "Unused hours can be refunded at the rate you paid, as long as you ask before your pack expires. The full rules are in our terms and conditions.",
      },
      {
        q: "Can I discuss my project before purchasing?",
        a: "Absolutely. Book a free 15-minute call to discuss your requirements and the most suitable starting package.",
      },
    ],
  },

  finalCta: {
    title: "You bring the clients. We'll help you deliver.",
    body: "Stop letting technical bottlenecks limit how much work your agency can take on. Get flexible GoHighLevel and automation support from a team that works behind the scenes.",
    primary: "Book a Free 15-Minute Call",
    secondary: "Start With 5 Hours, $95",
    tagline: "Sysora Stack, your on-demand technical delivery team.",
  },
} as const;
