export type CapabilityGroup = {
  title: string;
  items: string[];
};

export const capabilities = {
  eyebrow: "What we build",
  headline: "The work, plainly.",
  lead: "If it moves information, triggers work, stores data, or reports on the business, it's in scope.",
  groups: [
    {
      title: "AI and automation",
      items: [
        "AI agents and AI-driven workflows",
        "Workflow automation in n8n, Zapier and Make",
        "API, webhook and software integrations",
      ],
    },
    {
      title: "CRM and revenue systems",
      items: [
        "CRM and GoHighLevel systems, rebuilt or repaired",
        "Lead capture, qualification, follow-up and booking",
        "Webinar and masterclass infrastructure",
      ],
    },
    {
      title: "Software and infrastructure",
      items: [
        "Web and internal applications in React, Next.js, Node.js, Python and Laravel",
        "Databases, APIs and the deployment pipeline underneath them",
        "Hosting, monitoring and the ongoing maintenance afterwards",
      ],
    },
    {
      title: "Operations and data",
      items: [
        "Client onboarding and delivery operations",
        "Data systems and reporting you can trust",
        "Custom internal tools",
      ],
    },
  ] as CapabilityGroup[],
} as const;
