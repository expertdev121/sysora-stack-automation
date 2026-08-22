/**
 * Client reviews, collected on the platform where each contract was booked.
 * The first 5 render immediately; the rest sit behind "Show more".
 */

export type Review = {
  title: string;
  date: string;
  rating: string;
  /** Each paragraph of the review, quotes included. */
  quotes: string[];
  endorsements: string[];
  contractTags: string[];
};

/** How many reviews are visible before the reader expands the list. */
export const VISIBLE_REVIEWS = 5;

export const reviews: Review[] = [
  {
    title: "Webinar Funnel Builder & GoHighLevel Expert Needed For Digital Marketing Business",
    date: "Jun 18, 2026 - Aug 10, 2026",
    rating: "5.0",
    quotes: [
      "\"Working with Nikhil has been a great experience. What originally started as a one-week project ended up turning into almost two months, but for all the right reasons. We're both obsessed with getting things right, so instead of rushing to finish, we kept testing, looking for anything that could go wrong, and fixing it before moving forward.",
      "Nikhil was patient, responsive, detail-oriented, and never complained when I wanted to go back and improve something. He cared about the quality of the funnel just as much as I did, which is hard to find.",
      "He started as someone I hired for a project and has since become a great addition to my team. I'm still working with him today, and that probably says more than anything else I could put in this review.",
      "Highly recommend Nikhil if you want someone who actually cares about the finished product and isn't just trying to get the job done and move on.\""
    ],
    endorsements: ["Collaborative", "Solution Oriented", "Detail Oriented"],
    contractTags: ["HighLevel", "ClickFunnels", "Sales Funnel Builder", "Sales Funnel", "Webinar Jam"],
  },
  {
    title: "Completion of Web App Using Neon DB, Typescript, and HTML",
    date: "Jul 3, 2025 - May 25, 2026",
    rating: "5.0",
    quotes: [],
    endorsements: [],
    contractTags: [],
  },
  {
    title: "GHL Manage Client's accounts, automations & funnel",
    date: "Jun 22, 2025 - Mar 24, 2026",
    rating: "5.0",
    quotes: [
      "\"He was so good, I hired him again. He is now my official guy for all my CRM/Tech and web needs.\""
    ],
    endorsements: ["Solution Oriented", "Accountable for Outcomes", "Detail Oriented"],
    contractTags: [],
  },
  {
    title: "GHL updates UI, Automations & Checkout Integration",
    date: "Apr 23, 2025 - Mar 24, 2026",
    rating: "5.0",
    quotes: [
      "\"He was THE BEST to work with. Super efficient, communicated well and came to the table with ideas to make my website even better. I love when I don't have to hand hold people through everything and he took the lead and crushed what I wanted.\""
    ],
    endorsements: ["Reliable", "Collaborative", "Committed to Quality", "Solution Oriented", "Clear Communicator", "Detail Oriented"],
    contractTags: [],
  },
  {
    title: "Tech Operations Specialist",
    date: "Jul 4, 2025 - Jan 12, 2026",
    rating: "5.0",
    quotes: [
      "\"Nikhil has been one of the best freelancers I have found on UpWork. He goes above and beyond, I don't have to hold his hand through every little thing, he brings strategy, makes decisions, and his work ethic is unmatched. I will be using him for all my future projects.\""
    ],
    endorsements: ["Committed to Quality", "Solution Oriented", "Clear Communicator", "Accountable for Outcomes"],
    contractTags: [],
  },
  {
    title: "GHL Payment Integration Fix + Add feature",
    date: "Sep 15, 2025 - Oct 8, 2025",
    rating: "5.0",
    quotes: [
      "\"Great professional\""
    ],
    endorsements: ["Professional"],
    contractTags: [],
  },
  {
    title: "Backend Developer for Laravel PHP & API Integration Across Two Websites",
    date: "Jun 21, 2025 - Sep 19, 2025",
    rating: "5.0",
    quotes: [],
    endorsements: [],
    contractTags: [],
  },
  {
    title: "Website Designer in GoHighLevel",
    date: "Mar 17, 2025 - Apr 22, 2025",
    rating: "5.0",
    quotes: [],
    endorsements: [],
    contractTags: [],
  },
  {
    title: "Full Stack Developer for Building a Design Inspiration Platform (Similar to Mobbin)",
    date: "Oct 6, 2024 - Mar 23, 2025",
    rating: "5.0",
    quotes: [],
    endorsements: [],
    contractTags: [],
  },
  {
    title: "Projects Back End Tasks",
    date: "Dec 4, 2024 - Jan 29, 2025",
    rating: "5.0",
    quotes: [
      "\"His work is very good\""
    ],
    endorsements: ["Committed to Quality"],
    contractTags: [],
  },
  {
    title: "Fullstack Laravel Dev with VITE knowledge Needed in the team",
    date: "Dec 26, 2024 - Jan 3, 2025",
    rating: "5.0",
    quotes: [],
    endorsements: [],
    contractTags: [],
  },
  {
    title: "Change the PHP version on server",
    date: "Oct 26, 2024 - Dec 24, 2024",
    rating: "5.0",
    quotes: [
      "\"Very good Freelancer. Will use again!\""
    ],
    endorsements: [],
    contractTags: [],
  },
  {
    title: "Funnel Layout Designer in Go High Level",
    date: "Oct 19, 2024 - Dec 16, 2024",
    rating: "5.0",
    quotes: [
      "\"Genuinely top notch work from Nikhil! I recommend 10 out of 10.\""
    ],
    endorsements: ["Committed to Quality"],
    contractTags: [],
  },
  {
    title: "WhatsApp API integrations via PHP",
    date: "Oct 24, 2024 - Oct 25, 2024",
    rating: "5.0",
    quotes: [
      "\"Excellent Technical skills, Speed of delivery, Prompt and clear communications, flexible and co-operative. Recommended\""
    ],
    endorsements: ["Committed to Quality", "Reliable", "Clear Communicator", "Collaborative"],
    contractTags: [],
  },
  {
    title: "More update some issues",
    date: "Sep 20, 2024 - Oct 20, 2024",
    rating: "5.0",
    quotes: [
      "\"Excellent Freelancer. Works hard and does his best all the time.\""
    ],
    endorsements: [],
    contractTags: [],
  },
  {
    title: "Changes to the features on the site",
    date: "Sep 6, 2024 - Sep 19, 2024",
    rating: "5.0",
    quotes: [
      "\"He did the work exactly as I wanted. Very good and very knowledgeable. Excellent freelancer. Will be using again.\""
    ],
    endorsements: ["Committed to Quality", "Clear Communicator"],
    contractTags: [],
  },
  {
    title: "I need a PHP developer who can create me a similar website in the description",
    date: "Aug 15, 2024 - Aug 23, 2024",
    rating: "5.0",
    quotes: [
      "\"I loved working with him again.\""
    ],
    endorsements: ["Collaborative"],
    contractTags: [],
  },
];
