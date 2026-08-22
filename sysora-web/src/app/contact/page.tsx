import type { Metadata } from "next";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { routes, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to the Sysora team about your systems, automation, and AI workflows.",
};

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Talk to our team"
      title="Tell us what's eating your week."
      lead="A straight answer about what's worth doing, and what isn't. No pitch deck, no discovery-call funnel."
    >
      <p className="m-0 text-[17px] leading-[1.75] text-[var(--ink-500)]">
        The contact form is being wired up. Until then, email us at{" "}
        <a href={`mailto:${siteConfig.email}`} className="font-semibold">
          {siteConfig.email}
        </a>
        .
      </p>
      <div className="flex flex-wrap gap-3 mt-8">
        <Button size="lg" arrow href={routes.systemsReview}>
          Get your Business Systems Review, $49
        </Button>
        <Button size="lg" variant="ghost" href={routes.home}>
          Back to home
        </Button>
      </div>
    </PageShell>
  );
}
