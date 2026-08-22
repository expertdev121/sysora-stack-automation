import type { Metadata } from "next";
import Link from "next/link";

import { SetPasswordForm } from "@/components/admin/SetPasswordForm";
import { Button } from "@/components/ui/Button";
import { SysoraMark } from "@/components/ui/Logo";
import { checkPasswordToken } from "@/lib/auth/actions";

export const metadata: Metadata = { title: "Set your password" };

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const valid = await checkPasswordToken(token);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-[linear-gradient(180deg,var(--surface-0)_0%,var(--mint-50)_100%)]">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="flex items-center gap-3 mb-8">
          <SysoraMark className="h-8 w-8" />
          <span className="font-display font-semibold text-[20px] tracking-[-0.5px] text-[var(--mint-900)]">
            Sysora
          </span>
        </Link>

        <div className="p-8 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_4px_rgba(0,80,50,0.04),0_20px_44px_rgba(0,80,50,0.07)]">
          <h1 className="mt-0 mb-1 text-[24px] font-extrabold tracking-[-0.5px] text-[var(--ink-900)]">
            Choose a password
          </h1>
          <p className="mt-0 mb-6 text-[14px] leading-[1.65] text-[var(--ink-300)]">
            Pick something only you know. You&apos;ll use it with your email from now on.
          </p>

          {valid ? (
            <SetPasswordForm token={token} />
          ) : (
            <div className="flex flex-col gap-4">
              <p className="m-0 px-4 py-3 rounded-[10px] bg-[var(--warning-bg)] border-[1.5px] border-[var(--warning-border)] text-[13.5px] leading-[1.6] text-[var(--warning)]">
                This link has expired or has already been used. Ask a super admin for a fresh one,
                or sign in if you already set a password.
              </p>
              <Button size="md" variant="ghost" fullWidth href="/admin/login">
                Go to sign in
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
