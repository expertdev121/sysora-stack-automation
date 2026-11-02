import { siteConfig } from "@/config/site";
import { articlePath, caseStudies, guides, services } from "@/content/articles";
import { packs } from "@/content/landing/sales";

/**
 * /llms.txt, a plain map of the offer for AI systems.
 *
 * A route rather than a file in public/, so the prices come from the same
 * `packs` the page renders and this cannot quote a stale rate. It is
 * static, generated once per build.
 */
export const dynamic = "force-static";

const money = (n: number) => `$${n.toLocaleString("en-US")}`;
const lead = packs[0];
const top = packs[packs.length - 1];

function list(items: readonly { title: string; slug: string; kind: "service" | "guide" | "case-study" }[]) {
  return items.map((item) => `- ${item.title}: ${siteConfig.url}${articlePath(item)}`).join("\n");
}

export function GET() {
  const body = `# ${siteConfig.name}

> Prepaid GoHighLevel, automation and development hours for US marketing agencies, GoHighLevel SaaS owners and US local businesses. Published rates from $${lead.rate} an hour down to $${top.rate} an hour at ${top.hours} hours. No contract. Unused prepaid hours are refundable at the rate paid.

${siteConfig.name} sells blocks of technical hours rather than retainers or fixed packages. Clients send a backlog, ${siteConfig.name} scopes each task in writing, the client approves the scope, and time is logged against the balance in 15-minute increments. Scoping and task submission cost no hours. Founded by Nikhil, whose freelance delivery record on Upwork is 19 jobs, 1,220 hours, a 100% Job Success Score and 5.0 on every completed job.

## Pricing (USD, one-time or monthly at the same rates)
${packs.map((p) => `- ${p.hours} hours: ${money(p.price)} ($${p.rate}/hour)`).join("\n")}
One-time packs are valid 60 days. Monthly balances reset each cycle.

## What the hours cover
- GoHighLevel: account and subaccount setup, snapshots, pipelines, forms, calendars, funnels, workflows, SMS and email configuration, CRM migration, SaaS-mode configuration, A2P 10DLC registration work
- Automation and integration: n8n, Zapier, Make, webhooks, REST APIs, data sync, error handling
- Websites, apps and software: funnel and site implementation, custom apps, dashboards, portals, deployment

## What is not included
Third-party software subscriptions, SMS, email and telephony usage, AI model fees, hosting, domains, platform licensing and taxes. No guarantee of lead volume, conversion rate, revenue or uptime. No published response-time target. ${siteConfig.name} is not an official HighLevel employee team, partner or certified provider.

## Key pages
- Home: ${siteConfig.url}
- Pricing: ${siteConfig.url}/pricing
- About the company and founder: ${siteConfig.url}/about
- For agencies, white-label: ${siteConfig.url}/for/agencies
- For US local businesses: ${siteConfig.url}/for/local-business
- Request a project estimate: ${siteConfig.url}/request-estimate
- Book a free 15-minute call: ${siteConfig.url}/book-a-call
- Terms, including the refund guarantee: ${siteConfig.url}/terms

## Services
${list(services)}

## Guides
${list(guides)}

## Case studies
${list(caseStudies)}

## Contact
${siteConfig.email}
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
