import Link from "next/link";

import { SysoraLogo } from "@/components/ui/Logo";
import { PortalNav } from "@/components/portal/PortalNav";
import { signOut } from "@/lib/portal/session-actions";

/**
 * Signed-in chrome for the client portal: sidebar on the left, page on
 * the right, folding to a top bar on a phone — the same shape as the
 * admin console so the two feel like one product.
 */
export function PortalShell({
  eyebrow,
  title,
  openTickets,
  children,
}: {
  eyebrow: string;
  title: string;
  openTickets: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--surface-1)] to-860:flex-col">
      <aside className="flex w-[232px] flex-none flex-col border-r border-[var(--line-slate)] bg-white px-4 py-6 to-860:w-full to-860:border-b to-860:border-r-0">
        <Link href="/" className="mb-7 block px-2" aria-label="Sysora Stack home">
          <SysoraLogo className="block h-[28px] w-auto" />
        </Link>

        <PortalNav openTickets={openTickets} />

        <form action={signOut} className="mt-auto px-2 pt-6 to-860:pt-3">
          <button
            type="submit"
            className="text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-heading)]"
          >
            Sign out
          </button>
        </form>
      </aside>

      <main className="min-w-0 flex-1 px-8 py-10 to-860:px-6">
        <div className="max-w-[1100px]">
          <p className="text-[11px] font-bold uppercase tracking-[1.6px] text-[var(--accent-strong)]">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-[clamp(26px,3.2vw,34px)] font-black tracking-[-0.8px] text-[var(--text-heading)]">
            {title}
          </h1>
          <div className="mt-7">{children}</div>
        </div>
      </main>
    </div>
  );
}
