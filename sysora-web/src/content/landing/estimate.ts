export const estimate = {
  meta: {
    title: "Request a Project Estimate",
    description:
      "Not sure how many hours the work takes? Send the scope and get a written time estimate and a milestone plan before you pay anything.",
  },
  eyebrow: "Request a project estimate",
  headline: "Send us the scope. We put a number on it first.",
  lead: "If you are not sure how many hours the work takes, send it over. You get a written time estimate and a milestone plan before you pay anything.",

  flowLabel: "What happens next",
  flow: [
    ["A person reads it", "Your request is received, read and routed, at any hour."],
    ["We scope it", "A written time estimate and a milestone plan for substantial work."],
    ["You decide", "Pick the package that covers it. Nothing starts until you approve."],
  ] as [string, string][],

  badges: ["Free, no obligation", "24/7 human triage", "Billed against hours"],

  form: {
    typesLabel: "What do you need built?",
    types: [
      "GoHighLevel build",
      "Automation",
      "Integration or API",
      "Website or funnel",
      "Custom app",
      "CRM migration",
      "A2P registration",
      "Something else",
    ],
    descriptionLabel: "Describe the project and the problem behind it",
    descriptionPlaceholder:
      "What exists today, what you want it to do, and what breaks or slows you down now.",
    timingLabel: "When do you need it?",
    timings: ["This week", "This month", "Next quarter", "Flexible"],
    nameLabel: "Full name",
    namePlaceholder: "Jordan Reyes",
    emailLabel: "Work email",
    emailPlaceholder: "jordan@company.com",
    companyLabel: "Company",
    companyPlaceholder: "Company name",
    audienceLabel: "You are a",
    audiences: ["Marketing agency", "Local business", "SaaS or other"],
    submit: "Send for an estimate",
    sending: "Sending",
    terms: "By sending this you agree to our terms and privacy policy.",
  },

  done: {
    headline: "Scope received",
    body: "A real person has it now. We come back with a time estimate and a milestone plan. If anything is unclear, we ask before we guess.",
    refLabel: "Request",
    again: "Send another",
    browse: "Browse the packages",
  },
} as const;
