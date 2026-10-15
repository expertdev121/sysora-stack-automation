"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Portal navigation. Client-side only so the current route can be
 * highlighted; the pages themselves stay server-rendered.
 */
type NavItem = { href: string; label: string; exact?: boolean };

const ITEMS: NavItem[] = [
  // Overview matches exactly, or it would light up on every sub-page.
  { href: "/portal", label: "Overview", exact: true },
  { href: "/portal/hours", label: "Hours" },
  { href: "/portal/plans", label: "Plans and hours" },
  { href: "/portal/invoices", label: "Invoices" },
  { href: "/portal/billing", label: "Payment and plan" },
  { href: "/portal/build-requests", label: "Build requests" },
  { href: "/portal/support", label: "Support" },
];

export function PortalNav({ openTickets }: { openTickets: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 to-860:flex-row to-860:flex-wrap">
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              "flex items-center justify-between rounded-lg px-3 py-[9px] text-[14px] transition-colors " +
              (active
                ? "bg-[var(--mint-50)] font-semibold text-[var(--accent-strong)]"
                : "font-medium text-[var(--text-body)] hover:bg-[var(--surface-1)]")
            }
          >
            {item.label}
            {item.href === "/portal/support" && openTickets > 0 && (
              <span className="ml-2 rounded-full bg-[var(--accent)] px-[7px] py-[1px] text-[11px] font-bold text-white">
                {openTickets}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
