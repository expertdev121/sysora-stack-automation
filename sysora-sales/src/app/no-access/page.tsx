import type { Metadata } from "next";

import { SignOutButton } from "@/components/SignOutButton";
import { currentSession } from "@/lib/admin/auth";
import { ROLE_LABELS } from "@/lib/admin/types";

export const metadata: Metadata = { title: "No access" };

/**
 * This app is only about money, so there is no useful half-view for
 * someone without finance access — they'd get a set of empty rooms.
 * Better to say so than to render blanks.
 */
export default async function NoAccessPage() {
  const session = await currentSession();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[460px] p-8 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] text-center">
        <h1 className="mt-0 mb-3 text-[22px] font-extrabold tracking-[-0.5px] text-[var(--ink-900)]">
          This account can&apos;t see the numbers.
        </h1>
        <p className="mt-0 mb-6 text-[15px] leading-[1.75] text-[var(--ink-500)]">
          {session
            ? `You're signed in as ${ROLE_LABELS[session.role]}. Revenue is limited to managers and owners — ask an owner if you need it.`
            : "Revenue is limited to managers and owners."}
        </p>
        <SignOutButton />
      </div>
    </div>
  );
}
