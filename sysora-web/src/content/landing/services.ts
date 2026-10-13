export type ServiceRow = {
  title: string;
  price: string;
  body: string;
};

export const services = {
  eyebrow: "Fixed problems, fixed prices",
  headline: "Some things you don't need scoped. You just need them built.",
  lead: "These have a price because we have built them enough times to know what they cost. Everything else gets quoted.",
  rows: [
    {
      title: "Launch System",
      price: "$3,500",
      body: "Website, offer page that takes payment, and a client acquisition system with booking and follow-up. For a business with an offer and nothing built around it.",
    },
    {
      title: "Webinar Funnel Build",
      price: "$1,500",
      body: "Registration, reminders over email and SMS, attendance tracking, replay with an expiry, and follow-up split between people who showed and people who did not.",
    },
    {
      title: "Deployment and Infrastructure Setup",
      price: "$1,200",
      body: "An existing application put on AWS or Cloudflare properly. Docker, a staging environment, a deploy pipeline in GitHub Actions or Jenkins, SSL, backups, and uptime monitoring that alerts someone.",
    },
    {
      title: "Website Build",
      price: "$1,200",
      body: "Three to five pages in GoHighLevel, content written, forms wired to your CRM, domain connected.",
    },
    {
      title: "Funnel Design",
      price: "$900",
      body: "Sales page, order page with Stripe wired in, thank-you page, tracking installed.",
    },
    {
      title: "Lead Magnet Funnel",
      price: "$750",
      body: "Opt-in, automatic delivery, a three-email nurture sequence, and a pipeline stage so new leads are visible.",
    },
    {
      title: "A2P 10DLC Registration",
      price: "$297",
      body: "Brand and campaign registered with The Campaign Registry, consent pages fixed first, numbers linked after approval. Registry and carrier fees are billed through your platform and never marked up.",
    },
  ] as ServiceRow[],
  note: "Each of these has a defined scope written into the proposal before you pay. If your situation needs more than the scope covers, we tell you before you buy, not after.",
  cta: "See all services and what's included",
} as const;
