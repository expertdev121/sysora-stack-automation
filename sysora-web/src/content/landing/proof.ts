export const proof = {
  eyebrow: "The proof behind Sysora",
  headline: "Sysora is a new company. ",
  headlineAccent: "The work it was built on is not.",
  /** Set to false to hide the provenance note above the reviews. */
  showDisclaimer: true,
  disclaimer:
    "Every review below is from a Sysora client relationship that started before the company had a name, collected on the platform where the work was booked. Client names aren't published there, so each review is credited to the project it came from.",
  reviewsHeader: {
    left: "Client reviews · 17 completed contracts",
    right: "Every project rated 5.0",
  },
  showMore: "Show more",
  showLess: "Show less",
  founder: {
    cardLabel: "Founder profile · verified",
    availability: "Available now",
    /** Headshot in /public. Set to null to fall back to the placeholder. */
    avatar: "/nikhil.jpg" as string | null,
    avatarPlaceholder: "Photo",
    name: "Nikhil N.",
    badges: [
      { label: "100% Job Success", kind: "jss" as const },
      { label: "Top Rated", kind: "topRated" as const },
    ],
    stats: [
      { value: "$10K+", label: "Total earnings" },
      { value: "19", label: "Total jobs" },
      { value: "1,220", label: "Total hours" },
    ],
    headline: "Business Automation Expert | GHL, n8n, Zapier, AI Agents Built",
    skills: ["GoHighLevel", "n8n", "Zapier", "Make", "AI agents", "API integrations"],
    ratingLine: "5.0 average across 19 completed projects",
  },
  pullQuote: {
    title:
      "Two different clients, on two different projects, wrote the same line about not having to hold his hand.",
    body: "A third called the work a great addition to my team. That's the pattern worth paying attention to, because it's what you're buying from Sysora. Not automation on its own. Not having to manage the people delivering it.",
  },
} as const;

export const founderNote = {
  /** Set to false to hide the founder's note section entirely. */
  show: true,
  eyebrow: "A note from Nikhil, founder",
  headline: "Why Sysora exists.",
  paragraphs: [
    "Before Sysora had a name, I logged 1,220 hours inside other people's businesses. Nineteen jobs, every one rated 5.0, and almost all of them started the same way. Something had broken, or two tools had never talked to each other in the first place, and there was nobody internally who could fix it.",
    "One of those jobs was supposed to take a week. A webinar funnel build. It ran close to two months, because we kept testing it looking for what would fail under load, and neither of us wanted to ship something that would quietly break on launch day. Another began as a small tech operations project and turned into 640 hours across six months, until I knew their systems better than most of their staff did.",
  ],
  highlight:
    "The pattern got obvious fast. Nobody was hiring me to build an automation. They were hiring me because nobody in the building could answer one question: how is this supposed to work.",
  closing:
    "That question is the whole job. It is also the reason Sysora exists, because a business shouldn't need to hire an automation engineer, a CRM architect, an AI specialist, an integration developer, and a software developer just to get its own operations running properly.",
  signature: {
    initial: "N",
    name: "Nikhil",
    role: "Founder, Sysora",
  },
} as const;
