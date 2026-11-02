import { CONTENT_DATE, type Article } from "./types";

/**
 * Write-ups of four engagements from the founder's Upwork record.
 *
 * Every figure, date and quotation here comes from the public Upwork
 * record as it was already published on this site. Clients are not named
 * and no detail is added about their business, because the site promises
 * not to publish a client or their project without written permission.
 * Do not embellish these. Add detail only with the client's agreement.
 */

const dates = { published: CONTENT_DATE, modified: CONTENT_DATE };

const BASIS =
  "This write-up uses only the public Upwork record of work delivered by our founder before the company carried the Sysora Stack name. The client is not named on the platform and is not named here. Where the client wrote a person's name, the company is written in instead.";

export const caseStudies: readonly Article[] = [
  {
    kind: "case-study",
    slug: "640-hour-tech-operations",
    eyebrow: "Case study, tech operations",
    title: "640 hours of tech operations for one client",
    metaTitle: "640-Hour Tech Operations Case Study",
    description:
      "A small tech operations job that became 640 hours and $6,550 over six months, rated 5.0 on Upwork. What happened, using only the public record.",
    answer:
      "A small tech operations project grew into 640 logged hours and $6,550 of work between July 2025 and January 2026. The client rated it 5.0 on Upwork and wrote that they would use the team for all future projects. The useful part is why the job kept growing, which is that the client stopped having to supervise it.",
    ...dates,
    blocks: [
      { k: "h2", text: "What were the numbers?" },
      {
        k: "table",
        head: ["Measure", "Figure"],
        rows: [
          ["Engagement", "Tech Operations Specialist"],
          ["Dates", "July 4, 2025 to January 12, 2026"],
          ["Hours logged", "640"],
          ["Total billed", "$6,550"],
          ["Rating", "5.0"],
        ],
      },
      { k: "h2", text: "What did the client say?" },
      {
        k: "quote",
        paragraphs: [
          "“Sysora Stack has been one of the best teams I have found on UpWork. They go above and beyond, I don’t have to hold their hand through every little thing, they bring strategy, make decisions, and their work ethic is unmatched. I will be using them for all my future projects.”",
        ],
        source: "Upwork review, Tech Operations Specialist engagement",
      },
      { k: "h2", text: "Why did a small job become 640 hours?" },
      {
        k: "p",
        text: "It began as a small project. Over six months the work moved from individual tasks to knowing how the client's systems fit together. That knowledge is what kept the engagement going.",
      },
      {
        k: "p",
        text: "The review names the reason directly. The client did not have to hand-hold, and decisions were being made without being asked for. Another client on the same record wrote nearly the same thing.",
      },
      { k: "h2", text: "What does this mean for a buyer today?" },
      {
        k: "p",
        text: "Hours are logged against tasks in the same way now, in 15-minute increments, with every entry visible in your account. A long engagement is many small approved tasks rather than one large bet. You can start with the [smallest pack](/pricing) and see how it goes.",
      },
      { k: "note", title: "Where this comes from", text: BASIS },
    ],
    related: ["/for/agencies", "/pricing", "/case-studies/357-hour-web-app"],
  },
  {
    kind: "case-study",
    slug: "357-hour-web-app",
    eyebrow: "Case study, software",
    title: "A 357-hour web app in TypeScript and Neon Postgres",
    metaTitle: "357-Hour Web App Case Study",
    description:
      "A web app completed in TypeScript and HTML on Neon Postgres over 357 logged hours. The largest software engagement on the Sysora Stack record.",
    answer:
      "This engagement completed a web app using TypeScript, HTML and a Neon Postgres database, across 357 logged hours between July 2025 and May 2026. It is the largest software build on the record. The client left no written review, so this page reports what the record shows and claims nothing beyond it.",
    ...dates,
    blocks: [
      { k: "h2", text: "What were the numbers?" },
      {
        k: "table",
        head: ["Measure", "Figure"],
        rows: [
          ["Engagement", "Completion of a web app using Neon DB, TypeScript and HTML"],
          ["Dates", "July 3, 2025 to May 25, 2026"],
          ["Hours logged", "357"],
          ["Written review", "None left by the client"],
        ],
      },
      { k: "h2", text: "Why include a job with no review?" },
      {
        k: "p",
        text: "Because it is evidence of a specific thing. Most of the record is GoHighLevel and automation work. This job shows software being written, not only tools being connected.",
      },
      { k: "h2", text: "What can a buyer take from it?" },
      {
        k: "p",
        text: "A web app of this size is the kind of work that gets a written estimate and a milestone plan before it begins. If you have something similar, [request an estimate](/request-estimate) and we will put a number on it before you pay anything.",
      },
      { k: "note", title: "Where this comes from", text: BASIS },
    ],
    related: [
      "/services/web-app-development",
      "/request-estimate",
      "/case-studies/640-hour-tech-operations",
    ],
  },
  {
    kind: "case-study",
    slug: "53-hour-ghl-checkout-integration",
    eyebrow: "Case study, GoHighLevel",
    title: "53 hours on GoHighLevel UI, automations and checkout",
    metaTitle: "GoHighLevel Checkout Case Study, 53 Hours",
    description:
      "GoHighLevel UI updates, automations and a checkout integration, $697.50 over 53 hours and rated 5.0 on Upwork. What the public record shows.",
    answer:
      "A client hired for GoHighLevel interface updates, automations and a checkout integration, and the job came to $697.50 across 53 logged hours between April 2025 and March 2026. It was rated 5.0 on Upwork. It shows what a mid-sized GoHighLevel job looks like when it is billed by the hour instead of as a package.",
    ...dates,
    blocks: [
      { k: "h2", text: "What were the numbers?" },
      {
        k: "table",
        head: ["Measure", "Figure"],
        rows: [
          ["Engagement", "GHL updates, UI, automations and checkout integration"],
          ["Dates", "April 23, 2025 to March 24, 2026"],
          ["Hours logged", "53"],
          ["Total billed", "$697.50"],
          ["Rating", "5.0"],
        ],
      },
      { k: "h2", text: "What did the client say?" },
      {
        k: "quote",
        paragraphs: [
          "“Sysora Stack was THE BEST to work with. Super efficient, communicated well and came to the table with ideas to make my website even better. I love when I don’t have to hand hold people through everything and they took the lead and crushed what I wanted.”",
        ],
        source: "Upwork review, GHL UI updates, automations and checkout integration",
      },
      { k: "h2", text: "What would 53 hours cost today?" },
      {
        k: "p",
        text: "Hours are sold in fixed packs, so the nearest fit is the 75-hour pack at $15 an hour, or the 50-hour pack at $17 plus a small top-up. The [pricing page](/pricing) has every size. Unused hours are refundable at the rate you paid.",
      },
      { k: "note", title: "Where this comes from", text: BASIS },
    ],
    related: [
      "/services/funnels-and-websites",
      "/pricing",
      "/guides/gohighlevel-setup-cost",
    ],
  },
  {
    kind: "case-study",
    slug: "webinar-funnel-two-months",
    eyebrow: "Case study, an honest overrun",
    title: "The one-week webinar funnel that took almost two months",
    metaTitle: "Webinar Funnel Overrun Case Study",
    description:
      "A webinar funnel planned for one week ran almost two months because both sides kept testing it. Why the client stayed, in the client's own words.",
    answer:
      "A webinar funnel in GoHighLevel was planned as a one-week project and ran from June 18 to August 10, 2026, almost two months. Most write-ups would hide that. Both sides chose to keep testing for what could fail before launch, and the client rated the work 5.0 and kept working with the team afterwards.",
    ...dates,
    blocks: [
      { k: "h2", text: "What were the numbers?" },
      {
        k: "table",
        head: ["Measure", "Figure"],
        rows: [
          ["Engagement", "Webinar funnel builder and GoHighLevel expert"],
          ["Planned length", "One week"],
          ["Actual dates", "June 18, 2026 to August 10, 2026"],
          ["Actual length", "53 days"],
          ["Rating", "5.0"],
        ],
      },
      { k: "h2", text: "Why did it overrun?" },
      {
        k: "p",
        text: "Nothing went wrong in the usual sense. Each round of testing looked for what would fail under load, and each round found something worth fixing before moving on. Neither side wanted a funnel that would quietly break on launch day.",
      },
      { k: "h2", text: "What did the client say?" },
      {
        k: "quote",
        paragraphs: [
          "“Working with Sysora Stack has been a great experience. What originally started as a one-week project ended up turning into almost two months, but for all the right reasons. We are both obsessed with getting things right, so instead of rushing to finish, we kept testing, looking for anything that could go wrong, and fixing it before moving forward.",
          "“They were patient, responsive, detail-oriented, and never complained when I wanted to go back and improve something. They cared about the quality of the funnel just as much as I did, which is hard to find.",
          "“Sysora Stack started as someone I hired for a project and has since become a great addition to my team. I am still working with them today, and that probably says more than anything else I could put in this review.",
          "“Highly recommend Sysora Stack if you want someone who actually cares about the finished product and is not just trying to get the job done and move on.”",
        ],
        source: "Upwork review, webinar funnel build",
      },
      { k: "h2", text: "How would an overrun be handled now?" },
      {
        k: "p",
        text: "The same choice stays with you. Time estimates are estimates, and when a build runs longer than scoped you hear about it before the hours are spent. We do not work past your balance and bill you afterwards.",
      },
      { k: "note", title: "Where this comes from", text: BASIS },
    ],
    related: [
      "/services/funnels-and-websites",
      "/case-studies/53-hour-ghl-checkout-integration",
      "/for/agencies",
    ],
  },
];
