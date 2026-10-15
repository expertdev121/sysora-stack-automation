import { LEGAL_EMAIL } from "@/content/legal/contact";

/**
 * The contact page, from the Sysora Contact design file.
 *
 * The page's whole argument is that a person reads the message, so the
 * copy avoids every phrase that suggests otherwise — no "submit your
 * enquiry", no promise of a response time we have not operationalized.
 */
export const contact = {
  meta: {
    title: "Contact — GoHighLevel and Automation Help",
    description:
      "Tell Sysora Stack what is eating your week. A person reads every message and replies with a straight answer about what is worth doing. No pitch deck, no discovery-call funnel.",
  },
  eyebrow: "Talk to our team",
  title: "Tell us what's eating your week.",
  lead: "A straight answer about what's worth doing, and what isn't. No pitch deck, no discovery-call funnel.",

  form: {
    nameLabel: "Your name",
    namePlaceholder: "Alex Driscoll",
    emailLabel: "Work email",
    emailPlaceholder: "alex@agency.com",
    companyLabel: "Company or website (optional)",
    companyPlaceholder: "agency.com",
    topicLabel: "What is it about?",
    topics: [
      "GoHighLevel",
      "Automation",
      "Website or app",
      "Hour packages",
      "Something else",
    ],
    messageLabel: "What's eating your week?",
    messagePlaceholder:
      "The snapshot rebuild keeps breaking, and the A2P submission has been sitting for three weeks.",
    note: "A person reads every message. No sales sequence.",
    submit: "Send message",
    working: "Sending",
    directLead: "Email us directly",
    directEmail: LEGAL_EMAIL,
  },

  /** Shown in place of the form once a message is in. */
  sent: {
    /** "Got it, " + first name + "." */
    headingLead: "Got it, ",
    headingFallback: "thanks",
    bodyLead: "A person on our team reads it and replies to ",
    bodyTail: ". If you do not see a reply, check your spam folder or email ",
    packagesCta: "See the hour packages",
    againCta: "Send another",
  },

  next: {
    title: "What happens next",
    steps: [
      { n: "01", text: "A person reads it. Not a bot, not a lead-scoring form." },
      { n: "02", text: "A straight answer. What is worth doing, and what isn't." },
      { n: "03", text: "You decide. Buy hours, request an estimate, or walk away." },
    ],
  },

  cards: [
    { badge: "$19 → $13", label: "See the hour packages →", href: "/#packages" },
    { badge: "150h+", label: "Request an estimate →", href: "/request-estimate" },
  ],

  badges: ["24/7 human triage", "Unused hours refundable", "No contract"],

  errors: {
    name: "Tell us who you are.",
    email: "We need an email address to reach you.",
    emailFormat: "That email address doesn't look right.",
    message: "A sentence or two, so the reply is useful.",
    generic: "Something went wrong. Please try again, or email us directly.",
  },
} as const;
