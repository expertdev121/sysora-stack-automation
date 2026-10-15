import type { Metadata } from "next";

import { LegalDocPage } from "@/components/legal/LegalDocPage";
import { terms } from "@/content/legal/terms";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "The terms governing prepaid Sysora Stack hours: the published rate table, validity and reset, the unused-hours refund guarantee, and what is not included.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms and Conditions — Sysora Stack",
    description:
      "The terms governing prepaid Sysora Stack hours, including the rate table and the unused-hours refund guarantee.",
    url: "/terms",
  },
};

export default function TermsPage() {
  return <LegalDocPage doc={terms} />;
}
