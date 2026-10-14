import type { Metadata } from "next";

import { LegalPage } from "@/components/layout/LegalPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What Sysora Stack collects when you buy hours or request an estimate, why, who it is shared with, and how to have it deleted.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: {
    title: "Privacy Policy — Sysora Stack",
    description:
      "What Sysora Stack collects, why, who it is shared with, and how to have it deleted.",
    url: "/privacy-policy",
  },
};

/**
 * Placeholder, and marked as one in the copy rather than pretending to be
 * reviewed policy. It is published now because two things need it to
 * exist at a stable URL: the checkout's consent line, and A2P campaign
 * registration, which rejects a brand whose privacy policy 404s.
 *
 * The sections below describe what the code in this repo actually does —
 * the fields the forms collect, Stripe and Supabase as the two
 * processors — so it is accurate even while it is unreviewed.
 */
export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="15 October 2026"
      note="This is a plain-language summary, not a lawyer-reviewed policy. It describes what we actually do with your data today."
    >
      <h2>What we collect</h2>
      <p>
        When you buy hours we ask for your name, email address, company name and
        timezone, and we record which package you chose and what you told us
        about your setup — your audience, whether you already run GoHighLevel,
        and which tools you use. When you request an estimate we collect the
        same contact details and your description of the work.
      </p>
      <p>
        We never see or store your card number. Card details are entered
        directly into Stripe&rsquo;s payment form, which runs in a frame Stripe
        controls. What reaches us is the card brand, the last four digits and
        whether the payment succeeded.
      </p>

      <h2>Why we collect it</h2>
      <p>
        To deliver the hours you bought, to send you receipts and updates about
        your work, and to reply to your enquiry. If you start a checkout and
        don&rsquo;t finish it, we may email you once about the unfinished order.
      </p>

      <h2>Messaging consent</h2>
      <p>
        If you give us a phone number we use it to contact you about your own
        work with us. We do not sell phone numbers, we do not share them with
        third parties for marketing, and we do not add you to a marketing list
        you did not ask for. Reply STOP to any message to stop receiving them;
        reply HELP for help. Message and data rates may apply.
      </p>

      <h2>Who else handles it</h2>
      <ul>
        <li>
          <strong>Stripe</strong> — payments. They receive your name, email and
          card details.
        </li>
        <li>
          <strong>Supabase</strong> — the database holding your order and
          contact details.
        </li>
        <li>
          <strong>Vercel</strong> — hosting, which processes standard server
          request logs.
        </li>
      </ul>
      <p>We do not sell your data to anyone, for any purpose.</p>

      <h2>How long we keep it</h2>
      <p>
        Order records are kept while we have a working relationship and for as
        long afterwards as tax and accounting rules require. Enquiries that
        don&rsquo;t turn into work are deleted on request.
      </p>

      <h2>Your choices</h2>
      <p>
        Email <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> and
        ask for a copy of what we hold about you, a correction, or deletion.
        We&rsquo;ll action it, and we&rsquo;ll tell you if there is anything we
        are required to keep and why.
      </p>
    </LegalPage>
  );
}
