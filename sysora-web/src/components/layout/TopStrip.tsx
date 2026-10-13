import { topStrip } from "@/content/landing/closing";

/**
 * The thin dark strip above the header. Hidden below 900px, where the
 * header itself has already dropped to its compact layout.
 */
export function TopStrip() {
  return (
    <div className="relative z-[31] bg-[var(--forest-hero)] text-white/70 to-860:hidden">
      <div className="max-w-[1200px] mx-auto px-6 py-[9px] flex items-center justify-between gap-5">
        <span className="inline-flex items-center gap-[9px] font-mono text-[10.5px] font-semibold tracking-[1.3px] uppercase">
          <span className="sx-dot w-[6px] h-[6px] rounded-full bg-[var(--accent)]" />
          {topStrip.live}
        </span>
        <span className="text-[12.5px]">
          {topStrip.ratingLead}{" "}
          <span className="text-[var(--accent)] font-semibold">{topStrip.ratingValue}</span>{" "}
          {topStrip.ratingTail}
        </span>
      </div>
    </div>
  );
}
