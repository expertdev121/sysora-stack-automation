export type Stage = {
  /** Label on the pill. */
  tab: string;
  title: string;
  body: string;
  /** Where this reader should go next. */
  route: string;
  firstSteps: string[];
};

export const router = {
  eyebrow: "Wherever you are",
  headline: "Businesses come to us from three different places.",
  lead: "Pick the one that sounds like yours.",
  firstStepsLabel: "What we usually do first",
  stages: [
    {
      tab: "You're starting",
      title: "You're starting.",
      body: "You know what you sell. You do not know how any of it gets built, and every article you read assumes you already have a CRM. You do not need automation yet. You need the thing set up correctly the first time so you are not undoing it in a year.",
      route: "Launch System, or the $49 review if you want the map before the build",
      firstSteps: [
        "Map what should exist, before anything is bought",
        "Website, payment flow, CRM and follow-up built once",
        "A place every lead lands, with an owner",
      ],
    },
    {
      tab: "You're growing",
      title: "You're growing.",
      body: "Revenue is coming in and the systems behind it were assembled one tool at a time. There is a Zap, a GHL workflow, and a spreadsheet holding the middle together. You know which bit is broken. You need someone to fix it, or you have hit the point where the software you can buy no longer covers what you do.",
      route: "Submit a Build Request, or pick the service that matches the problem",
      firstSteps: [
        "Audit what exists, keep what works",
        "Rebuild the fragile pieces with monitoring",
        "Write the application when nothing off the shelf fits",
      ],
    },
    {
      tab: "You're established",
      title: "You're established.",
      body: "The business runs on technology and nobody owns it. Automations break and you find out from a customer. The technical backlog gets longer while everyone stays busy.",
      route: "On-Demand Systems Team",
      firstSteps: [
        "One owner for every automation and application",
        "Monitoring, patching and dependency upkeep",
        "A monthly systems review with a prioritised list",
      ],
    },
  ] as Stage[],
} as const;
