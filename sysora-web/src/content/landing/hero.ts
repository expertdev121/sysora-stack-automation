export const hero = {
  eyebrow: "Your on-demand engineering, automation and AI team",
  headline: "Someone in your business is doing a job ",
  headlineAccent: "a system should do.",
  lead: "At three people, it's you, answering a lead at eleven at night because there's nothing set up to answer it for you. At eighty, it's five people moving the same information between a CRM, a spreadsheet, and Slack. We design, build, fix, and manage the technology underneath, from connecting the tools you already pay for to writing the application when nothing off the shelf does the job.",
  primaryCta: "Get your Business Systems Review, $49",
  secondaryCta: "Get a Free Build Quote",
  note: "One-time diagnostic. No obligation to hire us. Build quotes are free.",
} as const;

export type FlowStep = {
  n: string;
  label: string;
  state: string;
  /** Stagger for the travelling packet on the wire. */
  delay: string;
};

/** The "system view" panel beside the hero. Illustrative, not live data. */
export const heroFlow: FlowStep[] = [
  { n: "01", label: "New lead arrives", state: "Captured", delay: "0s" },
  { n: "02", label: "CRM record created", state: "Synced", delay: ".5s" },
  { n: "03", label: "AI qualification", state: "Scored", delay: "1s" },
  { n: "04", label: "Follow-up sequence", state: "Sending", delay: "1.5s" },
  { n: "05", label: "Call booked", state: "Done", delay: "2s" },
];

export const heroPanel = {
  title: "Sysora · system view",
  status: "Running",
  tiles: [
    { title: "Owned and monitored", body: "A failure pages us, not your customer" },
    { title: "Documented", body: "So the next person can follow it" },
  ],
  disclaimer: "Illustrative system view",
} as const;
