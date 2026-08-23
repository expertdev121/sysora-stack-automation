import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeading } from "@/components/admin/ui";
import { PlanEditor } from "@/components/admin/PlanEditor";
import { canManagePricing, requireStaff } from "@/lib/admin/auth";
import type { Offer } from "@/lib/sales/types";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Plans" };

export default async function PlansPage() {
  const session = await requireStaff();
  const canEdit = canManagePricing(session.role);
  const db = salesDb();

  const { data } = await db.from("offers").select("*").order("sort_order");
  const offers = (data ?? []) as Offer[];

  return (
    <AdminShell session={session}>
      <PageHeading
        eyebrow="What we sell"
        title="Plans"
      />
      <p className="mt-[-16px] mb-8 max-w-[70ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
        {canEdit
          ? "Prices here drive the landing page and the checkout. Changing one takes effect on the next page load — existing requests keep the price they were quoted."
          : "These are the live prices on the site. Only a super admin can change them."}
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-5 items-start">
        {offers.map((offer) => (
          <PlanEditor key={offer.id} offer={offer} canEdit={canEdit} />
        ))}
      </div>
    </AdminShell>
  );
}
