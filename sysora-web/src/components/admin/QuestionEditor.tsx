"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Card, CardHeader, EmptyState, inputClass, labelClass, Pill } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { saveQuestion } from "@/lib/admin/actions";
import type { Survey, SurveyQuestion } from "@/lib/sales/types";

const TYPE_LABELS: Record<string, string> = {
  short_text: "Short text",
  long_text: "Long text",
  email: "Email",
  phone: "Phone",
  url: "URL",
  number: "Number",
  single_select: "Pick one",
  multi_select: "Pick many",
  boolean: "Yes / no",
  scale: "1–10 scale",
  date: "Date",
  file: "File",
};

export function QuestionEditor({
  survey,
  offerName,
  kindLabel,
  questions,
}: {
  survey: Survey;
  offerName: string | null;
  kindLabel: string;
  questions: SurveyQuestion[];
}) {
  return (
    <Card>
      <CardHeader
        title={`${offerName ?? survey.slug} · ${kindLabel}`}
        hint={`${questions.length} question${questions.length === 1 ? "" : "s"}`}
      />
      {questions.length === 0 ? (
        <EmptyState>No questions on this form yet.</EmptyState>
      ) : (
        <div>
          {questions.map((question) => (
            <QuestionRow key={question.id} question={question} />
          ))}
        </div>
      )}
    </Card>
  );
}

function QuestionRow({ question }: { question: SurveyQuestion }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(question.label);
  const [helpText, setHelpText] = useState(question.help_text ?? "");
  const [placeholder, setPlaceholder] = useState(question.placeholder ?? "");
  const [required, setRequired] = useState(question.is_required);
  const [active, setActive] = useState(question.is_active);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty =
    label !== question.label ||
    helpText !== (question.help_text ?? "") ||
    placeholder !== (question.placeholder ?? "") ||
    required !== question.is_required ||
    active !== question.is_active;

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveQuestion(question.id, {
        label: label.trim(),
        help_text: helpText.trim() || null,
        placeholder: placeholder.trim() || null,
        is_required: required,
        is_active: active,
      });
      if (result.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="border-b-[1.5px] border-[var(--border-faint)] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex flex-wrap items-center gap-3 px-6 py-4 text-left bg-transparent border-0 cursor-pointer hover:bg-[var(--surface-1)] transition-colors duration-150"
      >
        <span className="font-mono text-[11px] text-[var(--ink-100)] w-6">
          {question.sort_order}
        </span>
        <span className="flex-1 min-w-[200px] text-[15px] font-semibold text-[var(--ink-800)]">
          {question.label}
        </span>
        <Pill tone="slate">{TYPE_LABELS[question.type] ?? question.type}</Pill>
        {question.is_required && <Pill tone="mint">Required</Pill>}
        {!question.is_active && <Pill tone="amber">Hidden</Pill>}
        <span className="font-mono text-[11px] text-[var(--ink-200)]">{question.question_key}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-4 px-6 pb-6 pt-1 bg-[var(--surface-1)]">
          <div className="flex flex-col gap-[6px]">
            <label className={labelClass}>Question</label>
            <input
              className={inputClass}
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 to-700:grid-cols-1">
            <div className="flex flex-col gap-[6px]">
              <label className={labelClass}>Helper text</label>
              <input
                className={inputClass}
                value={helpText}
                onChange={(e) => {
                  setHelpText(e.target.value);
                  setSaved(false);
                }}
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className={labelClass}>Placeholder</label>
              <input
                className={inputClass}
                value={placeholder}
                onChange={(e) => {
                  setPlaceholder(e.target.value);
                  setSaved(false);
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-[10px] text-[13.5px] text-[var(--ink-600)] cursor-pointer">
              <input
                type="checkbox"
                className="accent-[var(--accent)] w-4 h-4"
                checked={required}
                onChange={(e) => {
                  setRequired(e.target.checked);
                  setSaved(false);
                }}
              />
              Required
            </label>
            <label className="flex items-center gap-[10px] text-[13.5px] text-[var(--ink-600)] cursor-pointer">
              <input
                type="checkbox"
                className="accent-[var(--accent)] w-4 h-4"
                checked={active}
                onChange={(e) => {
                  setActive(e.target.checked);
                  setSaved(false);
                }}
              />
              Show on the form
            </label>
          </div>

          {question.options.length > 0 && (
            <div className="flex flex-col gap-[6px]">
              <span className={labelClass}>Options</span>
              <div className="flex flex-wrap gap-2">
                {question.options.map((option) => (
                  <Pill key={option.value} tone="slate">
                    {option.label}
                  </Pill>
                ))}
              </div>
              <p className="m-0 text-[12px] text-[var(--ink-300)]">
                Editing choices isn&apos;t wired up yet — ask me and I&apos;ll add it.
              </p>
            </div>
          )}

          {error && (
            <p role="alert" className="m-0 text-[13px] text-[var(--danger-600)]">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" disabled={pending || !dirty} onClick={save}>
              {pending ? "Saving…" : "Save question"}
            </Button>
            {saved && <Pill tone="mint">Saved</Pill>}
          </div>
        </div>
      )}
    </div>
  );
}
