/**
 * Client reviews, collected on the platform where the work was booked.
 * Client names aren't published there, so each review is credited to the
 * project it came from. Square brackets mark our only edits, substituting
 * the company name for the founder's.
 */
export type Review = {
  title: string;
  dates: string;
  /** Quoted paragraphs, verbatim apart from the bracketed substitutions. */
  quote: string[];
  /** Used where a contract has no written review but belongs on the record. */
  note: string;
  stack: string[];
};

export const reviews: Review[] = [
  {
    title:
      "Webinar Funnel Builder and GoHighLevel Expert Needed For Digital Marketing Business",
    dates: "Jun 18, 2026 - Aug 10, 2026",
    note: "",
    stack: [],
    quote: [
      '"Working with [Sysora] has been a great experience. What originally started as a one-week project ended up turning into almost two months, but for all the right reasons. We are both obsessed with getting things right, so instead of rushing to finish, we kept testing, looking for anything that could go wrong, and fixing it before moving forward.',
      "[They were] patient, responsive, detail-oriented, and never complained when I wanted to go back and improve something. [They] cared about the quality of the funnel just as much as I did, which is hard to find.",
      "[Sysora] started as someone I hired for a project and has since become a great addition to my team. I am still working with [them] today, and that probably says more than anything else I could put in this review.",
      'Highly recommend [Sysora] if you want someone who actually cares about the finished product and is not just trying to get the job done and move on."',
    ],
  },
  {
    title: "Tech Operations Specialist",
    dates: "Jul 4, 2025 - Jan 12, 2026 · 640 hours",
    note: "",
    stack: [],
    quote: [
      '"[Sysora has] been one of the best [teams] I have found. [They go] above and beyond, I do not have to hold [their] hand through every little thing, [they bring] strategy, [make] decisions, and [their] work ethic is unmatched. I will be using [them] for all my future projects."',
    ],
  },
  {
    title: "Completion of Web App Using Neon DB, TypeScript and HTML",
    dates: "Jul 3, 2025 - May 25, 2026 · 357 hours",
    quote: [],
    note: "A completed software build with no written review. Included here because it is the largest engineering engagement on the record, and the clearest evidence that Sysora writes software rather than only connecting tools.",
    stack: ["TypeScript", "Neon Postgres", "Web app", "357 hours"],
  },
  {
    title: "GHL Manage Client Accounts, Automations and Funnel",
    dates: "Jun 22, 2025 - Mar 24, 2026",
    note: "",
    stack: [],
    quote: [
      '"[They were] so good, I hired [them] again. [Sysora is] now my official [team] for all my CRM/Tech and web needs."',
    ],
  },
  {
    title: "GHL updates UI, Automations and Checkout Integration",
    dates: "Apr 23, 2025 - Mar 24, 2026",
    note: "",
    stack: [],
    quote: [
      '"[They were] THE BEST to work with. Super efficient, communicated well and came to the table with ideas to make my website even better. I love when I do not have to hand hold people through everything and [they] took the lead and crushed what I wanted."',
    ],
  },
];
