"use client";

import { useState, useTransition } from "react";

import { signIn } from "@/lib/portal/session-actions";

const field =
  "mt-[6px] w-full rounded-xl border-[1.5px] border-[var(--border-default)] bg-white px-4 py-[12px] text-[15px] text-[var(--ink-800)] outline-none transition-colors focus:border-[var(--accent)]";

export function PortalLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="mt-7"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setError(null);
        start(async () => {
          // A successful sign-in redirects, so anything returned is a failure.
          const result = await signIn(form);
          if (result && !result.ok) setError(result.error);
        });
      }}
    >
      <label className="block">
        <span className="text-[13px] font-semibold text-[var(--ink-800)]">Email</span>
        <input name="email" type="email" autoComplete="email" required className={field} />
      </label>

      <label className="mt-4 block">
        <span className="text-[13px] font-semibold text-[var(--ink-800)]">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={field}
        />
      </label>

      {error && (
        <p className="mt-4 rounded-xl border-[1.5px] border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-[13.5px] text-[var(--danger-600)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-xl bg-[var(--accent)] px-6 py-[13px] text-[15px] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
