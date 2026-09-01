"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { SignOutButton } from "@/components/SignOutButton";
import { cn } from "@/lib/cn";
import { canManageTeam } from "@/lib/admin/roles";
import { ROLE_LABELS, type StaffRole } from "@/lib/admin/types";

/**
 * Signed-in chrome: nav on the left, page on the right. Below 860px the
 * nav folds into a bar across the top, the same way the marketing
 * dashboard does.
 */

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="flex-none"
    >
      {children}
    </svg>
  );
}

const icons = {
  overview: (
    <Icon>
      <path d="M4 20V11" />
      <path d="M10 20V4" />
      <path d="M16 20v-6" />
      <path d="M22 20H2" />
    </Icon>
  ),
  revenue: (
    <Icon>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M21 7v5h-5" />
    </Icon>
  ),
  targets: (
    <Icon>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.75" />
    </Icon>
  ),
  spend: (
    <Icon>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </Icon>
  ),
  activity: (
    <Icon>
      <path d="M3 12h4l2.5-6 4 12L16 12h5" />
    </Icon>
  ),
  acquisition: (
    <Icon>
      <path d="M3 21l7-7" />
      <path d="M14 4h6v6" />
      <path d="M20 4l-8.5 8.5" />
      <circle cx="7" cy="17" r="3.5" />
    </Icon>
  ),
  team: (
    <Icon>
      <circle cx="12" cy="7" r="3.5" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </Icon>
  ),
} as const;

type NavItem = { href: string; label: string; icon: keyof typeof icons; exact?: boolean };

const money: NavItem[] = [
  { href: "/", label: "Overview", icon: "overview", exact: true },
  { href: "/revenue", label: "Revenue", icon: "revenue" },
  { href: "/expenses", label: "Expenses", icon: "spend" },
  { href: "/acquisition", label: "Acquisition", icon: "acquisition" },
];

const plan: NavItem[] = [
  { href: "/targets", label: "Targets", icon: "targets" },
  { href: "/activity", label: "Activity", icon: "activity" },
];

export function Shell({
  session,
  children,
}: {
  session: { email: string; fullName: string | null; role: StaffRole };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const navLink = (item: NavItem) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={() => setOpen(false)}
      aria-current={isActive(item) ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-[9px] rounded-[10px] text-[14px] font-medium transition-colors duration-150 no-underline",
        isActive(item)
          ? "bg-[var(--mint-50)] text-[var(--accent-strong)] font-semibold"
          : "text-[var(--ink-500)] hover:bg-[var(--surface-2)] hover:text-[var(--ink-800)]",
      )}
    >
      {icons[item.icon]}
      {item.label}
    </Link>
  );

  const sectionLabel = (text: string) => (
    <p className="mt-6 mb-2 px-3 font-mono text-[9.5px] tracking-[1.4px] uppercase text-[var(--ink-100)]">
      {text}
    </p>
  );

  return (
    <div className="min-h-screen flex to-860:flex-col">
      <aside className="w-[236px] flex-none flex flex-col border-r-[1.5px] border-[var(--border-faint)] bg-[var(--surface-0)] to-860:w-full to-860:border-r-0 to-860:border-b-[1.5px]">
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="grid h-[26px] w-[26px] place-items-center rounded-[8px] bg-[var(--accent)] text-[13px] font-extrabold text-white">
              S
            </span>
            <span className="text-[15px] font-extrabold tracking-[-0.3px] text-[var(--ink-900)]">
              Sales
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle navigation"
            className="hidden to-860:grid h-9 w-9 place-items-center rounded-[9px] border-[1.5px] border-[var(--border-default)] bg-white cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              {open ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>

        <div className={cn("flex-1 flex flex-col min-h-0", !open && "to-860:hidden")}>
          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            <div className="flex flex-col gap-[2px]">{money.map(navLink)}</div>

            {sectionLabel("Plan")}
            <div className="flex flex-col gap-[2px]">{plan.map(navLink)}</div>

            {canManageTeam(session.role) && (
              <>
                {sectionLabel("Admin")}
                <div className="flex flex-col gap-[2px]">
                  {navLink({ href: "/metrics", label: "Metrics", icon: "activity" })}
                  {navLink({ href: "/team", label: "Team", icon: "team" })}
                </div>
              </>
            )}
          </nav>

          <div className="border-t-[1.5px] border-[var(--border-faint)] px-5 py-4">
            <p className="m-0 mb-1 text-[13px] font-semibold text-[var(--ink-800)] break-words">
              {session.fullName ?? session.email}
            </p>
            <p className="m-0 mb-3 text-[11.5px] text-[var(--ink-300)] break-all">
              {session.fullName ? session.email : null}
              <span className="block mt-1 font-mono text-[9.5px] tracking-[1px] uppercase text-[var(--accent-strong)]">
                {ROLE_LABELS[session.role]}
              </span>
            </p>
            <SignOutButton />
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-8 py-10 to-860:px-6">
        <div className="max-w-[1240px]">{children}</div>
      </main>
    </div>
  );
}
