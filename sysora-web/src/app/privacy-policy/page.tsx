import type { Metadata } from "next";

import { LegalDocPage } from "@/components/legal/LegalDocPage";
import { privacy } from "@/content/legal/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Sysora Stack collects, uses, shares and protects personal information, including the data we process inside our customers’ systems.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: {
    title: "Privacy Policy — Sysora Stack",
    description:
      "How Sysora Stack collects, uses, shares and protects personal information.",
    url: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return <LegalDocPage doc={privacy} />;
}
