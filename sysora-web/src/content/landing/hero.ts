export const hero = {
  badge: "Your on-demand AI, automation and systems team",
  headline: {
    line1: "Your business grew.",
    line2: "Your systems didn't.",
  },
  lead: "We design, build, fix, and manage the technology behind your operations. Your people spend less time moving information between tools, and more time on the work that moves the business forward.",
  primaryCta: "Get your Business Systems Review, $49",
  secondaryCta: "Submit a Build Request",
  note: "One-time diagnostic. No obligation to hire us. Build requests are free to submit.",
} as const;

export type HeroStat = {
  value: string;
  label: string;
  accent?: boolean;
};

export const heroStats: HeroStat[] = [
  { value: "100%", label: "Job Success Score, Top Rated" },
  { value: "1,220", label: "Hours inside client operations" },
  { value: "19", label: "Projects delivered, every one rated 5.0" },
  { value: "$49", label: "To find out what to fix first", accent: true },
];
