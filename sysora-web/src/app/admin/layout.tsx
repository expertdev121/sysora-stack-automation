import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s — Sysora Dashboard" },
  robots: { index: false, follow: false },
};

/** The dashboard is always live data — never serve a cached request list. */
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans min-h-screen bg-[var(--surface-1)] text-[var(--ink-600)]">
      {children}
    </div>
  );
}
