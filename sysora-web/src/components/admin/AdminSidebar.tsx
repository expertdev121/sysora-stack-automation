"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { SignOutButton } from "@/components/admin/SignOutButton";
import { SysoraMark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { canManageTeam } from "@/lib/admin/roles";
import type { StaffSession } from "@/lib/admin/auth";

/* ---- Icons: 20px, same line weight as the rest of the system ---- */

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
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Icon>
  ),
  requests: (
    <Icon>
      <path d="M5 4h14v16l-7-3.5L5 20z" />
    </Icon>
  ),
  contacts: (
    <Icon>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 5.5a3.5 3.5 0 0 1 0 6.9" />
      <path d="M18 14.5a6 6 0 0 1 3 5.5" />
    </Icon>
  ),
  services: (
    <Icon>
      <path d="M3 8.5l9-4.5 9 4.5-9 4.5z" />
      <path d="M3 13l9 4.5 9-4.5" />
      <path d="M3 17.5L12 22l9-4.5" />
    </Icon>
  ),
  plans: (
    <Icon>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </Icon>
  ),
  questions: (
    <Icon>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </Icon>
  ),
  settings: (
    <Icon>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3v2.5" />
      <path d="M12 18.5V21" />
      <path d="M4.2 7.5l2.2 1.2" />
      <path d="M17.6 15.3l2.2 1.2" />
      <path d="M4.2 16.5l2.2-1.2" />
      <path d="M17.6 8.7l2.2-1.2" />
    </Icon>
  ),
  targets: (
    <Icon>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.75" />
    </Icon>
  ),
  team: (
    <Icon>
      <circle cx="12" cy="7" r="3.5" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </Icon>
  ),
  today: (
    <Icon>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M9 15l2 2 4-4" />
    </Icon>
  ),
  scoreboard: (
    <Icon>
      <path d="M4 20V11" />
      <path d="M10 20V4" />
      <path d="M16 20v-6" />
      <path d="M22 20H2" />
    </Icon>
  ),
  activities: (
    <Icon>
      <path d="M3 12h4l2.5-6 4 12L16 12h5" />
    </Icon>
  ),
} as const;

type NavItem = { href: string; label: string; icon: keyof typeof icons; exact?: boolean };

const primary: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "overview", exact: true },
  // The delivery console: who owes us work, who needs attention.
  { href: "/admin/console", label: "Operations", icon: "overview" },
  { href: "/admin/clients", label: "Clients", icon: "contacts" },
  { href: "/admin/tickets", label: "Tickets", icon: "questions" },
  { href: "/admin/builds", label: "Build requests", icon: "requests" },
  { href: "/admin/requests", label: "Orders", icon: "requests" },
  { href: "/admin/contacts", label: "Contacts", icon: "contacts" },
];

const configure: NavItem[] = [
  { href: "/admin/services", label: "Services", icon: "services" },
  { href: "/admin/plans", label: "Plans", icon: "plans" },
  { href: "/admin/surveys", label: "Questions", icon: "questions" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export function AdminSidebar({ session }: { session: StaffSession }) {
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
        "flex items-center gap-3 px-3 py-[9px] rounded-[10px] text-[14px] font-medium transition-colors duration-150",
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
    <aside
      className={cn(
        "w-[240px] flex-none border-r-[1.5px] border-[var(--border-faint)] bg-[var(--surface-0)]",
        "sticky top-0 h-screen flex flex-col",
        // Below 860px it becomes a bar across the top with a toggle.
        "to-860:w-full to-860:h-auto to-860:border-r-0 to-860:border-b-[1.5px] to-860:static",
      )}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4 to-860:border-b-[1.5px] to-860:border-[var(--border-faint)]">
        <Link href="/admin" className="flex items-center gap-[10px]">
          <SysoraMark className="h-7 w-7" />
          <span className="font-display font-semibold text-[17px] tracking-[-0.5px] text-[var(--mint-900)]">
            Sysora
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="hidden to-860:inline-flex items-center justify-center w-9 h-9 rounded-[9px] border-[1.5px] border-[var(--border-default)] bg-white text-[var(--ink-600)] cursor-pointer hover:bg-[var(--mint-50)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? (
              <>
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
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
          <div className="flex flex-col gap-[2px]">{primary.map(navLink)}</div>

          {sectionLabel("Configure")}
          <div className="flex flex-col gap-[2px]">{configure.map(navLink)}</div>

          {canManageTeam(session.role) && (
            <>
              {sectionLabel("Admin")}
              <div className="flex flex-col gap-[2px]">
                {navLink({ href: "/admin/staff", label: "Team", icon: "team" })}
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
            {session.role !== "admin" && (
              <span className="block mt-1 font-mono text-[9.5px] tracking-[1px] uppercase text-[var(--accent-strong)]">
                {session.role}
              </span>
            )}
          </p>
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
