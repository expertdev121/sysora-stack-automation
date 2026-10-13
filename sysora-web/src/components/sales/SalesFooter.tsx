import Link from "next/link";

import { SysoraLogo } from "@/components/ui/Logo";
import { footer } from "@/content/landing/sales";

/** `anchorBase` works as it does on the header: "/" on an inner page. */
export function SalesFooter({ anchorBase = "" }: { anchorBase?: string }) {
  return (
    <footer className="px-6 pt-[clamp(56px,8vh,80px)] bg-[#0F3A2C] text-white/[0.68]">
      <div className="max-w-[1160px] mx-auto">
        <div className="grid grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] gap-10 to-980:grid-cols-2 to-640:grid-cols-1">
          <div className="max-w-[340px]">
            <SysoraLogo className="h-8 w-auto block brightness-0 invert" />
            <p className="mt-[18px] text-[14px] leading-[1.7]">{footer.blurb}</p>
            <div className="flex flex-wrap gap-2 mt-5">
              {footer.badges.map((badge, i) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-[7px] px-3 py-[6px] rounded-full border-[1.5px] border-white/[0.14] text-[12px]"
                >
                  {i === 0 && (
                    <span className="sx-dot w-[7px] h-[7px] rounded-full bg-[var(--accent)]" />
                  )}
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {footer.columns.map((column) => (
            <div key={column.title}>
              <p className="font-mono text-[10.5px] tracking-[1.4px] uppercase text-white/45">
                {column.title}
              </p>
              <ul className="list-none mt-4 p-0 flex flex-col gap-[11px]">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") ? (
                      <a className="sx-ft-a" href={`${anchorBase}${link.href}`}>
                        {link.label}
                      </a>
                    ) : (
                      <Link className="sx-ft-a" href={link.href}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-[14px] mt-[clamp(44px,6vh,64px)] py-[22px] border-t-[1.5px] border-white/10">
          <span className="text-[13px] text-white/50">{footer.copyright}</span>
          <span className="text-[12px] text-white/40">{footer.disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}
