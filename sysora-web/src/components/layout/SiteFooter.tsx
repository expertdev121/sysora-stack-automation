import { SysoraMark } from "@/components/ui/Logo";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="px-6 py-10 bg-[#081A10] border-t-[1.5px] border-white/[0.07]">
      <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-5">
        <span className="inline-flex items-center gap-3">
          <SysoraMark className="h-7 w-auto block brightness-0 invert opacity-85" />
          <span className="font-display font-semibold text-[19px] tracking-[-0.5px] text-white">
            {siteConfig.name}
          </span>
        </span>
        <span className="text-[13px] text-[var(--text-on-dark-muted)]">{siteConfig.tagline}</span>
      </div>
    </footer>
  );
}
