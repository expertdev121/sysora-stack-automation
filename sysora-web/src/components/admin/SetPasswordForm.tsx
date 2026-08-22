"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { inputClass, labelClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { setPasswordWithToken } from "@/lib/auth/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";

/** Reached from a one-time link. The token is checked server-side on submit. */
export function SetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await setPasswordWithToken(token, password, confirm);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-[6px]">
        <label htmlFor="password" className={labelClass}>
          New password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="m-0 text-[12px] text-[var(--ink-300)]">
          At least {MIN_PASSWORD_LENGTH} characters.
        </p>
      </div>

      <div className="flex flex-col gap-[6px]">
        <label htmlFor="confirm" className={labelClass}>
          Again, to be sure
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          className={inputClass}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="m-0 px-4 py-3 rounded-[10px] bg-[var(--danger-bg)] border-[1.5px] border-[var(--danger-border)] text-[13.5px] text-[var(--danger-600)]"
        >
          {error}
        </p>
      )}

      <Button type="submit" size="md" fullWidth arrow disabled={pending} className="mt-2">
        {pending ? "Saving…" : "Save and open the dashboard"}
      </Button>
    </form>
  );
}
