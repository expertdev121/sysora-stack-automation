"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Field } from "@/components/survey/Field";
import { Button } from "@/components/ui/Button";
import { emptyValue, isVisible, validateSurvey, type AnswerMap } from "@/lib/sales/answers";
import type { SubmitResult, SurveyWithQuestions } from "@/lib/sales/types";
import { readTrackingContext } from "@/lib/sales/tracking-client";
import type { TrackingContext } from "@/lib/sales/actions";

/**
 * Renders a survey straight from the database and hands the answers to a
 * server action. Validation runs here for feedback and again on the
 * server, which is the one that counts.
 */
export function SurveyForm({
  survey,
  action,
}: {
  survey: SurveyWithQuestions;
  action: (answers: AnswerMap, context: TrackingContext) => Promise<SubmitResult>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [answers, setAnswers] = useState<AnswerMap>(() =>
    Object.fromEntries(survey.questions.map((q) => [q.question_key, emptyValue(q.type)])),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const visible = useMemo(
    () => survey.questions.filter((q) => isVisible(q, answers)),
    [survey.questions, answers],
  );

  function update(key: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const found = validateSurvey(visible, answers);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const firstKey = visible.find((q) => found[q.question_key])?.question_key;
      if (firstKey) {
        document.getElementById(`q-${firstKey}`)?.scrollIntoView({ block: "center" });
        document.getElementById(`q-${firstKey}`)?.focus();
      }
      return;
    }

    // Only send answers to questions the reader could actually see.
    const payload: AnswerMap = {};
    for (const q of visible) payload[q.question_key] = answers[q.question_key];

    startTransition(async () => {
      const result = await action(payload, readTrackingContext());
      if (result.ok) {
        router.push(result.redirectTo);
        return;
      }
      setFormError(result.error);
      if (result.fieldErrors) setErrors(result.fieldErrors);
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {survey.questions.length === 0 && (
        <p className="m-0 text-[15px] text-[var(--ink-500)]">
          This form has no questions yet.
        </p>
      )}

      {visible.map((question) => (
        <Field
          key={question.id}
          question={question}
          value={answers[question.question_key]}
          error={errors[question.question_key]}
          onChange={(value) => update(question.question_key, value)}
        />
      ))}

      {formError && (
        <p
          role="alert"
          className="m-0 px-4 py-3 rounded-[10px] bg-[var(--danger-bg)] border-[1.5px] border-[var(--danger-border)] text-[14px] text-[var(--danger-600)]"
        >
          {formError}
        </p>
      )}

      <div className="flex items-center gap-4 pt-2">
        <Button type="submit" size="lg" arrow disabled={pending}>
          {pending ? "Sending…" : survey.submit_label}
        </Button>
        {survey.outro && (
          <span className="text-[13px] text-[var(--ink-300)]">{survey.outro}</span>
        )}
      </div>
    </form>
  );
}
