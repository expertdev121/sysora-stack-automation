export type ProblemCard = {
  icon: "handoff" | "gear" | "chart";
  title: string;
  body: string;
};

export const problem = {
  eyebrow: "Where you probably are right now",
  headline: "Every tool works. ",
  headlineAccent: "Together they don't.",
  lead: "You are paying for a dozen tools. CRM, forms, calendars, SMS, email, project management, spreadsheets that somehow still run half the company. So your team fills the gaps by hand. Someone copies a lead from the form into the CRM. Someone else sends the welcome email, creates the account, assigns the task, and pings the person who needs to know. It works, until the day it doesn't, and by then a lead has sat for four days and nobody noticed.",
  cards: [
    {
      icon: "handoff",
      title: "Your people are the integration",
      body: "The work moves because a human moves it. That's payroll spent on copy and paste, and it caps how much volume you can take without hiring again.",
    },
    {
      icon: "gear",
      title: "Nobody owns the automations you have",
      body: "There's a Zap, a Make scenario, a GHL workflow someone built two years ago. When it breaks, the first question is who built this, and the second is whether anyone can touch it safely.",
    },
    {
      icon: "chart",
      title: "Your data can't answer basic questions",
      body: "It lives in the CRM, three spreadsheets, and a platform nobody logs into. Asking what’s happening in the business turns into a two-day project.",
    },
  ] as ProblemCard[],
  callout: {
    title: "The cost isn't dramatic. That's what makes it dangerous.",
    body: "It shows up as slower follow-up, a launch that takes three weeks of coordination every single time, and a technical backlog that gets longer while everyone stays busy.",
  },
} as const;
