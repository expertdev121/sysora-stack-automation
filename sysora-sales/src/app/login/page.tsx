import type { Metadata } from "next";

import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-[linear-gradient(180deg,var(--surface-0)_0%,var(--mint-50)_100%)]">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-3 mb-8">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[var(--accent)] text-[15px] font-extrabold text-white">
            S
          </span>
          <span className="text-[20px] font-extrabold tracking-[-0.5px] text-[var(--mint-900)]">
            Sysora
          </span>
        </div>

        <div className="p-8 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_4px_rgba(0,80,50,0.04),0_20px_44px_rgba(0,80,50,0.07)]">
          <h1 className="mt-0 mb-1 text-[24px] font-extrabold tracking-[-0.5px] text-[var(--ink-900)]">
            Sales
          </h1>
          <p className="mt-0 mb-6 text-[14px] leading-[1.65] text-[var(--ink-300)]">
            Revenue, targets and what it costs to win the work. Same account as the dashboard.
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
