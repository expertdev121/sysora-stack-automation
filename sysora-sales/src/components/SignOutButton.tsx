"use client";

import { useTransition } from "react";

import { signOut } from "@/lib/auth/actions";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => signOut())}
      className="px-3 py-[7px] rounded-[8px] border-[1.5px] border-[var(--border-default)] bg-white text-[13px] font-semibold leading-[normal] text-[var(--ink-500)] cursor-pointer transition-colors duration-150 hover:bg-[var(--mint-50)] hover:text-[var(--accent-strong)]"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
