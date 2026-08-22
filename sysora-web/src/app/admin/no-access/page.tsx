import type { Metadata } from "next";

import { SignOutButton } from "@/components/admin/SignOutButton";

export const metadata: Metadata = { title: "No access" };

export default function NoAccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[460px] p-8 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] text-center">
        <h1 className="mt-0 mb-3 text-[22px] font-extrabold tracking-[-0.5px] text-[var(--ink-900)]">
          This account has no dashboard access.
        </h1>
        <p className="mt-0 mb-6 text-[15px] leading-[1.75] text-[var(--ink-500)]">
          You&apos;re signed in, but the account isn&apos;t on the staff list. Ask a super admin to
          add you under Team.
        </p>
        <SignOutButton />
      </div>
    </div>
  );
}
