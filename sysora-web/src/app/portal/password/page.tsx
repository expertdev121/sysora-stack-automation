import type { Metadata } from "next";

import { PasswordForm } from "@/components/portal/PasswordForm";
import { PortalShell } from "@/components/portal/PortalShell";
import { requireClient } from "@/lib/portal/auth";
import { getChrome } from "@/lib/portal/queries";

export const metadata: Metadata = { title: "Password", robots: { index: false, follow: false } };

export default async function PortalPasswordPage() {
  const session = await requireClient();
  const chrome = await getChrome(session.customerId);

  return (
    <PortalShell
      eyebrow="Account"
      title="Change your password"
      openTickets={chrome.openTickets}
      remaining={chrome.remaining}
      purchased={chrome.purchased}
      userName={session.fullName}
      userEmail={session.email}
      company={chrome.company}
    >
      <p className="max-w-[640px] text-[14.5px] leading-[1.7] text-[var(--text-muted)]">
        The code we emailed you after your first order is six digits, which is short enough to read
        out and short enough to guess. Replace it with something only you know.
      </p>
      <PasswordForm />
    </PortalShell>
  );
}
