import type { Metadata } from "next";

import { LegalPage } from "@/components/layout/LegalPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "How prepaid hours work at Sysora Stack: what an hour covers, how the refund guarantee works, and what we each commit to.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms — Sysora Stack",
    description:
      "How prepaid hours work: what an hour covers, how the refund guarantee works, and what we each commit to.",
    url: "/terms",
  },
};

/**
 * Placeholder, like the privacy policy, and says so. The terms that are
 * stated on the homepage — the rate card, no contract, unused hours
 * refundable — are repeated here so the two pages cannot drift into
 * contradicting each other, which is the failure mode that matters.
 */
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      updated="15 October 2026"
      note="This is a plain-language summary, not a lawyer-reviewed contract. Where it differs from something we agreed with you in writing, the written agreement wins."
    >
      <h2>What you are buying</h2>
      <p>
        A block of prepaid hours of GoHighLevel, automation and development
        work. Hours are billed against the rate for the pack you bought, from
        $19 an hour down to $13 at volume. There is no contract and no
        subscription: when the hours run out, you decide whether to buy more.
      </p>

      <h2>What counts as an hour</h2>
      <p>
        Time spent on your work — building, fixing, testing, and the
        back-and-forth needed to understand what you want. We log time against
        your account as we go and you can ask for the breakdown at any point.
        We do not bill you for our own mistakes or for rework caused by them.
      </p>

      <h2>Unused hours</h2>
      <p>
        Refundable. If you have hours left and decide you don&rsquo;t want them,
        ask and we refund the unused balance at the rate you paid. We do not
        apply an expiry date to hours you have already bought.
      </p>

      <h2>What we need from you</h2>
      <p>
        Access to the systems the work touches, and someone who can answer a
        question when the work is blocked on a decision only you can make.
        Hours are not consumed while we are waiting on you.
      </p>

      <h2>Your data and your accounts</h2>
      <p>
        Credentials you share with us are used only for your work and only for
        as long as that work needs them. What we build for you is yours. See
        the <a href="/privacy-policy">privacy policy</a> for how we handle your
        personal data.
      </p>

      <h2>Limits</h2>
      <p>
        We do not guarantee a specific business outcome from a specific number
        of hours, and nothing on this site is a quote for a fixed-price
        project. Where work needs a firm scope and price, ask for an{" "}
        <a href="/request-estimate">estimate</a> instead.
      </p>

      <h2>Questions</h2>
      <p>
        Email <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
      </p>
    </LegalPage>
  );
}
