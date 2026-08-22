import type { Metadata } from "next";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { routes } from "@/config/site";
import { founderNote } from "@/content/landing/proof";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sysora is a new company. The work it was built on is not — 1,220 hours inside other people's businesses, nineteen projects, every one rated 5.0.",
};

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About Sysora"
      title="Why Sysora exists."
      lead="Sysora is a new company. The work it was built on is not."
    >
      <div className="flex flex-col gap-5 text-[17px] leading-[1.75] text-[var(--ink-600)]">
        {founderNote.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="m-0">
            {paragraph}
          </p>
        ))}
        <p className="m-0 px-[30px] py-[26px] rounded-[18px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] text-[19px] font-semibold leading-[1.5] text-[var(--ink-900)]">
          {founderNote.highlight}
        </p>
        <p className="m-0">{founderNote.closing}</p>
      </div>
      <div className="flex flex-wrap gap-3 mt-8">
        <Button size="lg" arrow href={routes.systemsReview}>
          Get your Business Systems Review, $49
        </Button>
        <Button size="lg" variant="ghost" href={routes.contact}>
          Talk to our team
        </Button>
      </div>
    </PageShell>
  );
}
