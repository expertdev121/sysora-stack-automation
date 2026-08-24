import type { Metadata } from "next";
import Link from "next/link";

import { SetPasswordForm } from "@/components/SetPasswordForm";
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
        <div className="p-8 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)]">
          <h1 className="mt-0 mb-1 text-[24px] font-extrabold tracking-[-0.5px] text-[var(--ink-900)]">
            Choose a password
          </h1>
          <p className="mt-0 mb-6 text-[14px] leading-[1.65] text-[var(--ink-300)]">
            Pick something only you know. You&apos;ll use it with your email from now on.
          </p>

          {valid ? (
            <SetPasswordForm token={token} />
          ) : (
            <p className="m-0 text-[14px] leading-[1.7] text-[var(--ink-500)]">
              That link has expired or has already been used.{" "}
              <Link href="/login" className="font-semibold text-[var(--accent-strong)]">
                Sign in
              </Link>{" "}
              if you already have a password, or ask an owner for a new link.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
