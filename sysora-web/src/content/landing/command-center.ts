export type AutomationRow = {
  label: string;
  status: string;
  tone: "running" | "completed" | "monitoring";
};

export type FlowNode = {
  name: string;
  event: string;
};

export type PlatformTile = {
  name: string;
  detail: string;
};

export type ActivityRow = {
  label: string;
  time: string;
};

export const commandCenter = {
  chrome: {
    brand: "Sysora",
    label: "/ System command center",
    status: "Systems healthy",
  },
  health: {
    label: "System health",
    value: "98.7",
    unit: "%",
    state: "operational",
    caption: "All critical workflows running",
    barWidth: "98.7%",
    eventsLabel: "Events / min",
    eventsValue: "1,942",
  },
  /** Sparkline heights, in percent of the 34px track. */
  healthBars: [38, 54, 42, 68, 50, 76, 58, 84, 62, 92, 70, 88],
  automationsLabel: "Active automations",
  automations: [
    { label: "Lead follow-up", status: "Running", tone: "running" },
    { label: "Client onboarding", status: "Running", tone: "running" },
    { label: "Webinar registration", status: "Completed", tone: "completed" },
    { label: "Data sync", status: "Monitoring", tone: "monitoring" },
  ] as AutomationRow[],
  flow: {
    label: "Live data flow",
    rate: "1,942 events / min",
    core: {
      title: "Sysora",
      subtitle: "system core",
      caption: "route · enrich · verify",
    },
    inputs: [
      { name: "Web forms", event: "new_lead.json" },
      { name: "Calendly", event: "booking.created" },
      { name: "Stripe", event: "payment.succeeded" },
      { name: "Email + SMS", event: "reply.received" },
    ] as FlowNode[],
    outputs: [
      { name: "GoHighLevel CRM", event: "contact.upserted" },
      { name: "Airtable", event: "record.created" },
      { name: "Slack", event: "team.notified" },
      { name: "Custom tools", event: "api.dispatched" },
    ] as FlowNode[],
  },
  platforms: [
    { name: "n8n", detail: "18 workflows" },
    { name: "Zapier", detail: "9 zaps" },
    { name: "Make", detail: "6 scenarios" },
    { name: "AI agents", detail: "6 running" },
  ] as PlatformTile[],
  ticker: {
    label: "In flight",
    items: [
      "new_lead.json → GHL CRM",
      "booking.created → n8n",
      "payment.succeeded → Zapier",
      "reply.received → AI agent",
      "record.created → Airtable",
      "api.dispatched → custom tool",
    ],
  },
  activity: {
    label: "AI activity",
    rows: [
      { label: "New lead analyzed", time: "0:02" },
      { label: "CRM updated", time: "0:04" },
      { label: "Follow-up sequence triggered", time: "0:07" },
      { label: "Call booked, team notified", time: "0:11" },
    ] as ActivityRow[],
    queued: "Agent processing 3 queued tasks",
  },
  metrics: [
    { label: "Manual steps removed", value: "312", unit: "/wk", accent: false },
    { label: "Avg. lead response", value: "42", unit: "sec", accent: true },
  ],
  workflows: [
    {
      label: "Workflow · inbound",
      steps: ["New lead", "CRM", "AI qualification", "Follow-up", "Booked call"],
    },
    {
      label: "Workflow · delivery",
      steps: ["Payment", "Onboarding", "Team notified", "Project created"],
    },
  ],
} as const;
