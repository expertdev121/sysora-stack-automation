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
  wrongQuestion: {
    label: "The usual starting point",
    body: '"Can we do this in n8n. Or Zapier. Or with AI." Most businesses try to solve this by adding another tool.',
  },
  rightQuestion: {
    label: "The right one, quieter",
    body: "What actually needs to happen here, and what's the simplest way to make it happen reliably.",
  },
  closing:
    "Once you ask it that way, the answer stops being a tool and starts being a system. Sometimes that means an AI agent. Sometimes it's a webhook and twenty minutes of cleanup. Sometimes the best thing we can do is delete three automations and replace them with one that doesn't break.",
} as const;
