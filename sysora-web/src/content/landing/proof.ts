export const proof = {
  eyebrow: "The proof behind Sysora",
  headline: "1,220 hours inside other people's businesses.",
  lead: "Every review below comes from a completed client engagement, collected on the platform where the work was booked. Client names aren't published there, so each review is credited to the project it came from.",
  carousel: {
    label: "Client reviews · 19 completed contracts",
    rating: "Every project rated 5.0",
    footnote:
      "Square brackets mark our only edits, substituting the company name for the founder's. The unedited originals stay live on the platform.",
  },
  profile: {
    label: "Founder profile · verified",
    figures: [
      { value: "100%", label: "Job Success, Top Rated" },
      { value: "19", label: "Total jobs" },
      { value: "1,220", label: "Total hours" },
      { value: "5.0", label: "Average rating", accent: true },
    ],
    skills: [
      "GoHighLevel",
      "n8n",
      "Zapier",
      "Make",
      "AI agents",
      "API integrations",
    ],
  },
  pattern: {
    label: "The pattern",
    lead: "Two different clients, on two different projects, wrote the same line about not having to hold [their] hand. A third called the work a great addition to my team.",
    body: "That's the pattern worth paying attention to, because it's what you're buying from Sysora. Not automation on its own. Not having to manage the people delivering it.",
  },
} as const;

/** Also rendered on /about. */
export const founderNote = {
  eyebrow: "A note from Nikhil, founder",
  headline: "Why Sysora exists.",
  paragraphs: [
    "Before Sysora had a name, I logged 1,220 hours inside other people's businesses. Nineteen jobs, every one rated 5.0, and almost all of them started the same way. Something had broken, or two tools had never talked to each other in the first place, and there was nobody internally who could fix it.",
    "One of those jobs was supposed to take a week. A webinar funnel build. It ran close to two months, because we kept testing it looking for what would fail under load, and neither of us wanted to ship something that would quietly break on launch day. Another began as a small tech operations project and turned into 640 hours across six months, until I knew their systems better than most of their staff did.",
  ],
  highlight:
    "The pattern got obvious fast. Nobody was hiring me to build an automation. They were hiring me because nobody in the building could answer one question: how is this supposed to work.",
  closing:
    "Some of the people asking it had eighty staff. Some were on their own with an idea and a domain they'd bought the week before. The question is the same one, and it is the whole job. It is also the reason Sysora exists, because a business shouldn't need to hire an automation engineer, a CRM architect, an AI specialist, an integration developer, and a software developer just to get its own operations running properly.",
  signature: "Nikhil, Founder, Sysora",
} as const;
