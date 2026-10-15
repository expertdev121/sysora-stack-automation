import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PortalLoginForm } from "@/components/portal/PortalLoginForm";
import { SysoraLogo } from "@/components/ui/Logo";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Client sign in",
  robots: { index: false, follow: false },
};

export default async function PortalLoginPage() {
  // Already signed in: skip the form rather than showing it pointlessly.
  const user = await getSessionUser();
  if (user?.role === "client") redirect("/portal");
  if (user) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,var(--surface-0)_0,var(--surface-1)_420px)] px-6 py-16">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="mb-8 block" aria-label="Sysora Stack home">
          <SysoraLogo className="block h-[30px] w-auto" />
        </Link>

        <h1 className="font-display text-[30px] font-black tracking-[-0.8px] text-[var(--ink-900)]">
          Client sign in
        </h1>
        <p className="mt-2 text-[15px] leading-[1.7] text-[var(--ink-500)]">
          Your hours, your ledger, your invoices and your tickets.
        </p>

        <PortalLoginForm />

        <p className="mt-6 text-[13px] leading-[1.7] text-[var(--ink-500)]">
          Need access, or forgotten your password? Email{" "}
          <a
            href="mailto:team@sysorastack.com"
            className="font-medium text-[var(--accent-strong)] underline underline-offset-[3px]"
          >
            team@sysorastack.com
          </a>{" "}
          and we will set it up.
        </p>
      </div>
    </div>
  );
}
