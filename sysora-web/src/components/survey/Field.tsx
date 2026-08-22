"use client";

import type { SurveyQuestion } from "@/lib/sales/types";
import { cn } from "@/lib/cn";

const control =
  "w-full px-[14px] py-[11px] rounded-[10px] border-[1.5px] bg-white text-[15px] text-[var(--ink-800)] " +
  "placeholder:text-[var(--ink-100)] outline-none transition-[border-color,box-shadow] duration-150 " +
  "focus:border-[var(--accent)] focus:shadow-[var(--focus-shadow)]";

const controlIdle = "border-[var(--border-default)]";
const controlError = "border-[var(--danger-border)] bg-[var(--danger-bg)]";

export function Field({
  question,
  value,
  error,
  onChange,
}: {
  question: SurveyQuestion;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}) {
  const id = `q-${question.question_key}`;
  const describedBy = [question.help_text ? `${id}-help` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  const box = cn(control, error ? controlError : controlIdle);

  return (
    <div className="flex flex-col gap-[6px]">
      <label htmlFor={id} className="text-[13px] font-semibold text-[var(--text-heading)]">
        {question.label}
        {question.is_required && <span className="text-[var(--accent-strong)]"> *</span>}
      </label>

      {question.help_text && (
        <p id={`${id}-help`} className="m-0 text-[12.5px] leading-[1.5] text-[var(--ink-300)]">
          {question.help_text}
        </p>
      )}

      {renderControl()}

      {error && (
        <p id={`${id}-error`} role="alert" className="m-0 text-[12.5px] text-[var(--danger-600)]">
          {error}
        </p>
      )}
    </div>
  );

  function renderControl() {
    switch (question.type) {
      case "long_text":
        return (
          <textarea
            id={id}
            rows={5}
            className={cn(box, "resize-y leading-[1.65]")}
            placeholder={question.placeholder ?? ""}
            value={String(value ?? "")}
            aria-describedby={describedBy || undefined}
            aria-invalid={!!error}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case "single_select":
        return (
          <div className="flex flex-col gap-2">
            {question.options.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex items-center gap-3 px-[14px] py-3 rounded-[10px] border-[1.5px] cursor-pointer transition-colors duration-150",
                  value === option.value
                    ? "border-[var(--accent)] bg-[var(--mint-50)]"
                    : "border-[var(--border-default)] hover:bg-[var(--surface-1)]",
                )}
              >
                <input
                  type="radio"
                  name={id}
                  className="accent-[var(--accent)]"
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                />
                <span className="text-[15px] text-[var(--ink-700)]">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case "multi_select": {
        const selected = Array.isArray(value) ? (value as string[]) : [];
        return (
          <div className="flex flex-wrap gap-2">
            {question.options.map((option) => {
              const on = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    onChange(
                      on
                        ? selected.filter((v) => v !== option.value)
                        : [...selected, option.value],
                    )
                  }
                  className={cn(
                    "px-[14px] py-[9px] rounded-full border-[1.5px] text-[14px] font-semibold leading-[normal] cursor-pointer transition-colors duration-150",
                    on
                      ? "border-[var(--accent)] bg-[var(--mint-50)] text-[var(--accent-strong)]"
                      : "border-[var(--border-default)] text-[var(--ink-500)] hover:bg-[var(--surface-1)]",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        );
      }

      case "boolean":
        return (
          <div className="flex gap-2">
            {[
              { label: "Yes", v: true },
              { label: "No", v: false },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                aria-pressed={value === option.v}
                onClick={() => onChange(option.v)}
                className={cn(
                  "px-6 py-[10px] rounded-[10px] border-[1.5px] text-[15px] font-semibold leading-[normal] cursor-pointer transition-colors duration-150",
                  value === option.v
                    ? "border-[var(--accent)] bg-[var(--mint-50)] text-[var(--accent-strong)]"
                    : "border-[var(--border-default)] text-[var(--ink-500)] hover:bg-[var(--surface-1)]",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        );

      case "scale": {
        const min = question.validation?.min ?? 1;
        const max = question.validation?.max ?? 10;
        const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        return (
          <div className="flex flex-wrap gap-[6px]">
            {steps.map((step) => (
              <button
                key={step}
                type="button"
                aria-pressed={Number(value) === step}
                onClick={() => onChange(step)}
                className={cn(
                  "w-10 h-10 rounded-[10px] border-[1.5px] font-mono text-[14px] cursor-pointer transition-colors duration-150",
                  Number(value) === step
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border-default)] text-[var(--ink-500)] hover:bg-[var(--mint-50)]",
                )}
              >
                {step}
              </button>
            ))}
          </div>
        );
      }

      case "number":
        return (
          <input
            id={id}
            type="number"
            inputMode="numeric"
            className={box}
            placeholder={question.placeholder ?? ""}
            value={String(value ?? "")}
            min={question.validation?.min}
            max={question.validation?.max}
            aria-describedby={describedBy || undefined}
            aria-invalid={!!error}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          />
        );

      case "date":
        return (
          <input
            id={id}
            type="date"
            className={box}
            value={String(value ?? "")}
            aria-describedby={describedBy || undefined}
            aria-invalid={!!error}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      default: {
        const inputType =
          question.type === "email"
            ? "email"
            : question.type === "phone"
              ? "tel"
              : question.type === "url"
                ? "url"
                : "text";
        return (
          <input
            id={id}
            type={inputType}
            className={box}
            placeholder={question.placeholder ?? ""}
            value={String(value ?? "")}
            autoComplete={
              question.maps_to === "email"
                ? "email"
                : question.maps_to === "full_name"
                  ? "name"
                  : question.maps_to === "company_name"
                    ? "organization"
                    : question.type === "phone"
                      ? "tel"
                      : undefined
            }
            aria-describedby={describedBy || undefined}
            aria-invalid={!!error}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      }
    }
  }
}
