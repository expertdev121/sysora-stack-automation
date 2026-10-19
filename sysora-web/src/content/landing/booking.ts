/**
 * Copy for the Book a call page, from the "Sysora Book a Call" design.
 *
 * One deliberate departure from the design: step 03 offered "Hours, a
 * $49 review, or a scoped build". The $49 Business Systems Review was
 * retired along with /systems-review, so naming it here would put a
 * dead offer back in front of a caller. The other two routes are real
 * and are what the step now lists.
 */
export const booking = {
  meta: {
    title: "Book a Free Call, GoHighLevel and Automation Help",
    description:
      "Book a free call with Sysora Stack. Tell us what is slowing the business down, we look at your setup with you, and you leave with a clear next step. No pitch deck, no obligation.",
  },
  eyebrow: "Free 15-minute call",
  title: "Not sure where to start? Book your call with us.",
  lead: "Tell us what is slowing the business down. We look at your setup with you, and you leave with a clear next step. No pitch deck. No obligation to hire us.",
  stepsLabel: "On the call",
  steps: [
    {
      n: "01",
      title: "Where things break today",
      body: "Walk us through your tools, your workflow and the parts held together by hand.",
    },
    {
      n: "02",
      title: "What to fix first",
      body: "We point to the one area where better systems pay off most.",
    },
    {
      n: "03",
      title: "A clear next step",
      body: "Hours, or a scoped build. Or nothing at all if you do not need us.",
    },
  ],
  tags: ["GoHighLevel", "Automation", "AI agents", "Websites and apps"],
  calendar: {
    title: "Systems call with Sysora Stack",
    meta: "15 min · Video call · Free",
    /**
     * The GoHighLevel booking widget. `embedId` must stay as the id on
     * the iframe: form_embed.js finds the frame by it to resize the
     * calendar as the visitor moves between month and time steps.
     */
    embedId: "O1shUC021H53CnZxl2D9_booking",
    src: "https://link.givesuite.com/widget/booking/O1shUC021H53CnZxl2D9",
    script: "https://link.givesuite.com/js/form_embed.js",
  },
} as const;
