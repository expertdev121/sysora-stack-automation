import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeading } from "@/components/admin/ui";
import { TeamManager } from "@/components/admin/TeamManager";
import { requireOwner } from "@/lib/admin/auth";
import type { Staff } from "@/lib/admin/types";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Team" };

export default async function StaffPage() {
  const session = await requireOwner();
  const db = salesDb();

  const { data } = await db.from("users").select("*").order("created_at");

  return (
    <AdminShell session={session}>
      <PageHeading eyebrow="Who can get in" title="Team" />
      <p className="mt-[-16px] mb-8 max-w-[70ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
        Inviting someone emails them a link to set their own password — nobody, including you, ever
        types a teammate&apos;s password. Admins run the pipeline; super admins also manage this page.
      </p>
      <TeamManager staff={(data ?? []) as Staff[]} currentUserId={session.userId} />
    </AdminShell>
  );
}
