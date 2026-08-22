import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeading } from "@/components/admin/ui";
import { TargetEditor } from "@/components/admin/TargetEditor";
import { TargetProgress } from "@/components/admin/TargetProgress";
import { requireSuperAdmin } from "@/lib/admin/auth";
import type { TargetRow } from "@/lib/admin/types";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Targets" };

export default async function TargetsPage() {
  const session = await requireSuperAdmin();
  const db = salesDb();

  const { data } = await db
    .from("target_progress")
    .select("*")
    .order("period_start", { ascending: false });

  const months = (data ?? []) as TargetRow[];
  const current = months[0];

  return (
    <AdminShell session={session}>
      <PageHeading eyebrow="Super admin only" title="Sales targets" />
      <p className="mt-[-16px] mb-8 max-w-[70ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
        Revenue is counted from payments that actually succeeded, so this tracks money in — not
        money hoped for. Admins never see any of it.
      </p>

      {current && (
        <div className="mb-8">
          <TargetProgress target={current} />
        </div>
      )}

      <TargetEditor months={months} />
    </AdminShell>
  );
}
