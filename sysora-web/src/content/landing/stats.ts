export type Stat = {
  /** Rendered as-is before the count-up runs, and on no-JS. */
  value: string;
  /** Target for the count-up animation. */
  to: number;
  prefix: string;
  suffix: string;
  label: string;
};

/** The four-up bar that overlaps the bottom of the hero. */
export const stats: Stat[] = [
  { value: "100%", to: 100, prefix: "", suffix: "%", label: "Job Success Score, Top Rated" },
  { value: "1,220", to: 1220, prefix: "", suffix: "", label: "Hours inside client operations" },
  { value: "19", to: 19, prefix: "", suffix: "", label: "Projects delivered, every one rated 5.0" },
  { value: "$49", to: 49, prefix: "$", suffix: "", label: "To find out what to fix first" },
];
