export type ServiceGroup = {
  icon: "gear" | "ledger" | "chart";
  title: string;
  items: string[];
};

export const services = {
  eyebrow: "What we build",
  headline: "The work, plainly.",
  lead: "If it moves information, triggers work, or reports on the business, it's in scope.",
  groups: [
    {
      icon: "gear",
      title: "AI and automation",
      items: [
        "AI agents and AI-driven workflows",
        "Workflow automation in n8n, Zapier and Make",
        "API, webhook and software integrations",
      ],
    },
    {
      icon: "ledger",
      title: "CRM and revenue systems",
      items: [
        "CRM and GoHighLevel systems, rebuilt or repaired",
        "Lead capture, qualification, follow-up and booking",
        "Webinar and masterclass infrastructure",
      ],
    },
    {
      icon: "chart",
      title: "Operations and data",
      items: [
        "Client onboarding and delivery operations",
        "Data systems and reporting you can trust",
        "Custom internal tools and software",
      ],
    },
  ] as ServiceGroup[],
} as const;
