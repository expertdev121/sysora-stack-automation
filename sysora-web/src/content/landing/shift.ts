export const shift = {
  eyebrow: "The shift",
  headline: "The right question was never which tool.",
  lead: "We are tool-agnostic on purpose. We pick what fits the problem, not what we're used to selling.",
  tools: [
    "n8n",
    "Zapier",
    "Make",
    "GoHighLevel",
    "APIs and webhooks",
    "AI agents",
    "Custom software",
  ],
  before: {
    label: "The usual starting point",
    quote: '"Can we do this in n8n. Or Zapier. Or with AI."',
    body: "Most businesses try to solve this by adding another tool. The ones just starting out get stuck a step earlier, asking whether the thing in their head is even possible.",
  },
  after: {
    label: "The right one, quieter",
    quote:
      "What needs to happen here, and what's the simplest way to make it happen reliably.",
    body: "Once you ask it that way, the answer stops being a tool and starts being a system. Sometimes that means an AI agent. Sometimes it's a webhook and twenty minutes of cleanup. Sometimes the best thing we can do is delete three automations and replace them with one that doesn't break.",
  },
} as const;
