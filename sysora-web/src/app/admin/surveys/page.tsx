import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeading } from "@/components/admin/ui";
import { QuestionEditor } from "@/components/admin/QuestionEditor";
import { requirePipeline } from "@/lib/admin/auth";
import type { Survey, SurveyQuestion } from "@/lib/sales/types";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Questions" };

const KIND_LABELS: Record<string, string> = {
  build_request: "Build request form",
  pre_checkout: "Before checkout",
  post_payment: "After payment",
  custom: "Custom",
};

export default async function SurveysPage() {
  const session = await requirePipeline();
  const db = salesDb();

  const [{ data: surveys }, { data: questions }, { data: offers }] = await Promise.all([
    db.from("surveys").select("*").order("kind"),
    db.from("survey_questions").select("*").order("sort_order"),
    db.from("offers").select("id, name, slug"),
  ]);

  const allQuestions = (questions ?? []) as SurveyQuestion[];
  const offerNames = new Map(
    ((offers ?? []) as { id: string; name: string }[]).map((o) => [o.id, o.name]),
  );

  return (
    <AdminShell session={session}>
      <PageHeading eyebrow="What we ask" title="Questions" />
      <p className="mt-[-16px] mb-8 max-w-[70ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
        These are the live forms. Editing a label changes it on the next page load. Answers already
        submitted keep the wording they were given, so nothing you change here rewrites history.
      </p>

      <div className="flex flex-col gap-8">
        {((surveys ?? []) as Survey[]).map((survey) => (
          <QuestionEditor
            key={survey.id}
            survey={survey}
            offerName={survey.offer_id ? offerNames.get(survey.offer_id) ?? null : null}
            kindLabel={KIND_LABELS[survey.kind] ?? survey.kind}
            questions={allQuestions.filter((q) => q.survey_id === survey.id)}
          />
        ))}
      </div>
    </AdminShell>
  );
}
