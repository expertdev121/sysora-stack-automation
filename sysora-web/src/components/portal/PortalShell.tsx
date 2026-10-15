import Link from "next/link";

import { SysoraLogo } from "@/components/ui/Logo";
import { PortalNav } from "@/components/portal/PortalNav";
import { signOut } from "@/lib/portal/session-actions";

/** Initials for the avatar, from a name or failing that an email. */
function initials(name: string | null, email: string): string {
  const source = (name ?? "").trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}

/**
 * Signed-in chrome for the client portal.
 *
 * The sidebar carries the three things the design puts there and that a
 * client checks without navigating: hours left, a way to buy more, and
 * a way to reach a person.
 */
export function PortalShell({
  eyebrow,
  title,
  openTickets,
  remaining,
  purchased,
  userName,
  userEmail,
  company,
  children,
}: {
  eyebrow: string;
  title: string;
  openTickets: number;
  remaining?: number;
  purchased?: number;
  userName?: string | null;
  userEmail?: string;
  company?: string | null;
  children: React.ReactNode;
}) {
  const showHours = typeof remaining === "number";

  return (
    <div className="flex min-h-screen bg-[var(--surface-1)] to-860:flex-col">
      <aside className="flex w-[244px] flex-none flex-col border-r border-[var(--line-mint)] bg-white px-4 py-6 to-860:w-full to-860:border-b to-860:border-r-0">
        <Link href="/" className="mb-6 block px-2" aria-label="Sysora Stack home">
          <SysoraLogo className="block h-[28px] w-auto" />
        </Link>

        {showHours && (
          <div className="mb-5 rounded-[14px] border border-[var(--line-mint)] bg-[var(--surface-1)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--text-muted)]">
              Hours left
            </p>
            <p className="mt-1 font-display text-[26px] font-black leading-none text-[var(--ink-900)]">
              {Math.round((remaining ?? 0) * 100) / 100}
              {typeof purchased === "number" && purchased > 0 && (
                <span className="text-[14px] font-semibold text-[var(--text-muted)]">
                  {" "}
                  / {Math.round(purchased * 100) / 100}h
                </span>
              )}
            </p>
            <Link
              href="/portal/plans"
              className="mt-3 block rounded-lg bg-[var(--accent)] px-3 py-[8px] text-center text-[13px] font-semibold text-white"
            >
              Buy more hours
            </Link>
          </div>
        )}

        <PortalNav openTickets={openTickets} />

        <div className="mt-5 rounded-[14px] border border-[var(--line-mint)] bg-[var(--mint-50)] p-4">
          <p className="text-[13px] font-bold text-[var(--ink-900)]">Support</p>
          <p className="mt-1 text-[12px] leading-[1.6] text-[var(--text-muted)]">
            24/7 human chat and ticket triage on every active package.
          </p>
          <Link
            href="/portal/support"
            className="mt-3 inline-block text-[12.5px] font-semibold text-[var(--accent-strong)]"
          >
            Open a ticket →
          </Link>
        </div>

        <div className="mt-auto pt-6 to-860:pt-4">
          {userEmail && (
            <div className="mb-3 flex items-center gap-[10px] px-1">
              <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-[var(--mint-50)] text-[12.5px] font-bold text-[var(--accent-strong)]">
                {initials(userName ?? null, userEmail)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-[var(--ink-900)]">
                  {userName ?? userEmail}
                </span>
                {company && (
                  <span className="block truncate text-[11.5px] text-[var(--text-muted)]">
                    {company}
                  </span>
                )}
              </span>
            </div>
          )}
          <form action={signOut} className="px-1">
            <button
              type="submit"
              className="text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--ink-900)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-8 py-10 to-860:px-6">
        <div className="max-w-[1100px]">
          <p className="text-[11px] font-bold uppercase tracking-[1.6px] text-[var(--accent-strong)]">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-[clamp(26px,3.2vw,34px)] font-black tracking-[-0.8px] text-[var(--ink-900)]">
            {title}
          </h1>
          <div className="mt-7">{children}</div>
        </div>
      </main>
    </div>
  );
}
