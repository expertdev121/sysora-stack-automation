import Link from "next/link";

import { SysoraLogo } from "@/components/ui/Logo";
import { entity, printedAddress, siteConfig } from "@/config/site";
import { footer } from "@/content/landing/sales";

/**
 * `anchorBase` works as it does on the header: "/" on an inner page.
 *
 * The footer is on every page, so this is where the internal linking and
 * the one printed form of the company's name, address and email live. A
 * phone number appears as soon as `entity.telephone` is set.
 */
export function SalesFooter({
  anchorBase = "",
  updated,
}: {
  anchorBase?: string;
  /** Long-form date for a page with no other place to show it. */
  updated?: string;
}) {
  return (
    <footer className="px-6 pt-[clamp(56px,8vh,80px)] bg-[#0F3A2C] text-white/[0.68]">
      <div className="max-w-[1160px] mx-auto">
        <div className="max-w-[520px]">
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

        <div className="grid grid-cols-5 gap-8 mt-11 to-980:grid-cols-3 to-640:grid-cols-2">
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

        <address className="mt-[clamp(36px,5vh,52px)] text-[13px] not-italic leading-[1.7] text-white/55">
          {siteConfig.name}, {printedAddress()}
          {" · "}
          <a className="sx-ft-a" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
          {entity.telephone ? (
            <>
              {" · "}
              <a className="sx-ft-a" href={`tel:${entity.telephone}`}>
                {entity.telephone}
              </a>
            </>
          ) : null}
        </address>

        <div className="flex flex-wrap items-center justify-between gap-[14px] mt-5 py-[22px] border-t-[1.5px] border-white/10">
          <span className="text-[13px] text-white/50">
            {footer.copyright}
            {updated ? ` Last updated ${updated}.` : ""}
          </span>
          <span className="text-[12px] text-white/40">{footer.disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}
