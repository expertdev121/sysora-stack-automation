"use client";

import { useState, useTransition } from "react";

import { changePortalPassword, type ChangeResult } from "@/lib/portal/password-actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";

const field =
  "w-full rounded-[12px] border-[1.5px] border-[var(--line-mint)] bg-white px-4 py-[11px] text-[15px] text-[var(--ink-900)] outline-none focus:border-[var(--accent)]";

export function PasswordForm() {
  const [pending, start] = useTransition();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [result, setResult] = useState<ChangeResult | null>(null);

  return (
    <form
      className="mt-6 flex max-w-[420px] flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await changePortalPassword(current, next);
          setResult(r);
          if (r.ok) {
            setCurrent("");
            setNext("");
          }
        });
      }}
    >
      <label className="flex flex-col gap-[6px]">
        <span className="text-[13px] font-semibold text-[var(--ink-900)]">Current password</span>
        <input
          className={field}
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => {
            setCurrent(e.target.value);
            setResult(null);
          }}
          required
        />
      </label>

      <label className="flex flex-col gap-[6px]">
        <span className="text-[13px] font-semibold text-[var(--ink-900)]">New password</span>
        <input
          className={field}
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => {
            setNext(e.target.value);
            setResult(null);
          }}
          required
        />
        <span className="text-[12.5px] text-[var(--text-muted)]">
          At least {MIN_PASSWORD_LENGTH} characters, and not digits alone.
        </span>
      </label>

      {result?.ok === false && (
        <p role="alert" className="m-0 text-[13.5px] text-[#C2410C]">
          {result.error}
        </p>
      )}
      {result?.ok === true && (
        <p role="status" className="m-0 text-[13.5px] text-[var(--accent-strong)]">
          Saved. Use the new password next time you sign in.
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !current || !next}
        className="self-start rounded-xl bg-[var(--accent)] px-5 py-[11px] text-[14px] font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
