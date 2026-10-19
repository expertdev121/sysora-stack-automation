import type { Metadata } from "next";

import { PlanPicker } from "@/components/portal/PlanPicker";
import { PortalShell } from "@/components/portal/PortalShell";
import { requireClient } from "@/lib/portal/auth";
import { getBalance, getTickets, getChrome } from "@/lib/portal/queries";
import { packs } from "@/content/landing/sales";

export const metadata: Metadata = {
  title: "Plans and hours",
  robots: { index: false, follow: false },
};

/**
 * Buying more hours without leaving the dashboard.
 *
 * A signed-in client never sees the public checkout: we already know
 * who they are, so the details step would be asking them to retype what
 * is on their account. They pick a pack and pay.
 */
export default async function PlansPage() {
  const session = await requireClient();
  const chrome = await getChrome(session.customerId);
  const [balance, tickets] = await Promise.all([
    getBalance(session.customerId),
    getTickets(session.customerId),
  ]);

  const open = tickets.filter((t) => t.status !== "resolved").length;

  // The pack closest to what they already hold, so the page can mark it.
  const current = packs.reduce<number | null>(
    (best, p) => (balance.purchased >= p.hours ? p.hours : best),
    null,
  );

  return (
    <PortalShell eyebrow="Plans" title="Hours and plans" openTickets={chrome.openTickets}
      remaining={chrome.remaining}
      purchased={chrome.purchased}
      userName={session.fullName}
      userEmail={session.email}
      company={chrome.company}
      mustChangePassword={chrome.mustChangePassword}>
      <p className="max-w-[640px] text-[14.5px] leading-[1.7] text-[var(--text-muted)]">
        Same seven packages as the public rate card, billed to the details already on your
        account. Move up or down whenever you like — each order is priced at the tier you pick,
        and nothing carries over from a previous order.
      </p>

      <PlanPicker
        packs={packs.map((p) => ({ ...p }))}
        currentHours={current}
        remaining={balance.remaining}
      />
    </PortalShell>
  );
}
