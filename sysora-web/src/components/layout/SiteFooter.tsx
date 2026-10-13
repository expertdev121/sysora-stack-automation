import { siteConfig } from "@/config/site";
import { topStrip } from "@/content/landing/closing";

export function SiteFooter() {
  return (
    <footer className="px-6 py-10 bg-[var(--forest-hero)] text-white/60">
      <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-[18px]">
        <span className="text-[14px]">
          {siteConfig.name}, {siteConfig.tagline.replace(/^Your/, "your")}
        </span>
        <span className="font-mono text-[11px] tracking-[1.1px] uppercase text-white/[0.38]">
          {topStrip.ratingLead} {topStrip.ratingValue}
        </span>
      </div>
    </footer>
  );
}
