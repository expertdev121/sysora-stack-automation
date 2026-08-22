export const outcomes = {
  eyebrow: "What changes when the plumbing works",
  headline: "The business runs while you're not watching it.",
  cards: [
    {
      title: "Leads answered at 11pm",
      body: "A lead comes in overnight and gets a response before your team wakes up. Onboarding runs itself: the account is created, access is granted, the tasks appear where they should.",
    },
    {
      title: "A pipeline number you trust",
      body: "Your CRM reflects reality closely enough that you trust the number in your Monday meeting. The launch you've rebuilt four times becomes infrastructure you switch on.",
    },
    {
      title: "Failures you hear from us",
      body: "The automations have an owner, monitoring, and documentation. When something fails you hear about it from us and not from a customer. The manual hours go back to the team.",
    },
  ],
  comparison: {
    before: {
      label: "Today · manual",
      title: "Five people-steps per lead",
      steps: [
        "Form filled, someone copies it into the CRM",
        "Welcome email sent by hand, sometimes",
        "Account created, access granted, task assigned",
        "Someone pings the person who needs to know",
        "Four days later, nobody noticed the lead",
      ],
      metricLabel: "Avg. response: ",
      metricValue: "4 days",
    },
    after: {
      label: "With Sysora · automated",
      title: "One system, zero handoffs",
      steps: [
        "Lead captured and enriched automatically",
        "Welcome sequence fires in seconds",
        "Account, access and tasks created on payment",
        "Owner notified in Slack with full context",
        "Failures alert us before a customer notices",
      ],
      metricLabel: "Avg. response: ",
      metricValue: "42 seconds",
    },
  },
} as const;
