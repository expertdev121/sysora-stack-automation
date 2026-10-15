"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { contact } from "@/content/landing/contact";
import { submitContact } from "@/lib/sales/contact";
import { cn } from "@/lib/cn";

const { form, sent: sentCopy } = contact;

const field =
  "w-full rounded-xl border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-4 py-[13px] text-[15px] text-[var(--ink-800)] outline-none transition-colors placeholder:text-[var(--ink-100)] focus:border-[var(--accent)]";

export function ContactForm() {
  const [topic, setTopic] = useState<string>(form.topics[0]);
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fullName = String(data.get("fullName") ?? "");
    const email = String(data.get("email") ?? "");

    setErrors({});
    setFormError(null);

    startTransition(async () => {
      const result = await submitContact({
        fullName,
        email,
        company: String(data.get("company") ?? ""),
        topic,
        message: String(data.get("message") ?? ""),
      });

      if (result.ok) {
        setSentTo({ name: fullName.trim(), email: email.trim() });
        setSent(true);
        return;
      }

      setErrors(result.fieldErrors ?? {});
      if (!result.fieldErrors) setFormError(result.error);
    });
  }

  if (sent) {
    const first = sentTo.name.split(" ")[0] || sentCopy.headingFallback;
    return (
      <div className="rounded-[20px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] p-[clamp(26px,4vw,40px)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.07)]">
        <span className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <h2 className="mt-5 font-display text-[clamp(24px,3vw,32px)] font-black tracking-[-0.8px] text-[var(--ink-900)]">
          {sentCopy.headingLead}
          {first}.
        </h2>
        <p className="mt-3 text-[15.5px] leading-[1.75] text-[var(--ink-600)]">
          {sentCopy.bodyLead}
          <strong className="font-semibold text-[var(--ink-900)]">{sentTo.email}</strong>
          {sentCopy.bodyTail}
          <a
            href={`mailto:${form.directEmail}`}
            className="font-medium text-[var(--accent-strong)] underline decoration-[var(--line-300)] underline-offset-[3px]"
          >
            {form.directEmail}
          </a>
          .
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button size="md" arrow href="/#packages">
            {sentCopy.packagesCta}
          </Button>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="rounded-xl border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-6 py-[13px] text-[15px] font-semibold text-[var(--ink-700)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
          >
            {sentCopy.againCta}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-[20px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] p-[clamp(26px,4vw,40px)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.07)]"
    >
      <div className="grid grid-cols-2 gap-5 to-640:grid-cols-1">
        <Field label={form.nameLabel} error={errors.fullName}>
          <input
            name="fullName"
            autoComplete="name"
            placeholder={form.namePlaceholder}
            className={cn(field, errors.fullName && "border-[var(--danger)]")}
          />
        </Field>
        <Field label={form.emailLabel} error={errors.email}>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder={form.emailPlaceholder}
            className={cn(field, errors.email && "border-[var(--danger)]")}
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field label={form.companyLabel}>
          <input
            name="company"
            autoComplete="organization"
            placeholder={form.companyPlaceholder}
            className={field}
          />
        </Field>
      </div>

      <fieldset className="mt-6 border-0 p-0">
        <legend className="mb-[10px] text-[13px] font-semibold text-[var(--ink-700)]">
          {form.topicLabel}
        </legend>
        <div className="flex flex-wrap gap-[10px]">
          {form.topics.map((label) => {
            const on = label === topic;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setTopic(label)}
                aria-pressed={on}
                className={cn(
                  "rounded-full border-[1.5px] px-[15px] py-[9px] text-[13.5px] font-medium transition-colors",
                  on
                    ? "border-[var(--accent)] bg-[var(--mint-50)] text-[var(--accent-strong)]"
                    : "border-[var(--border-default)] bg-[var(--surface-0)] text-[var(--ink-700)] hover:border-[var(--accent)]",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6">
        <Field label={form.messageLabel} error={errors.message}>
          <textarea
            name="message"
            rows={5}
            placeholder={form.messagePlaceholder}
            className={cn(field, "resize-y", errors.message && "border-[var(--danger)]")}
          />
        </Field>
      </div>

      {formError && (
        <p className="mt-4 rounded-xl border-[1.5px] border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-[14px] text-[var(--danger-600)]">
          {formError}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[12.5px] leading-[1.6] text-[var(--ink-500)]">{form.note}</p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-[10px] rounded-xl bg-[var(--accent)] px-7 py-[14px] text-[15px] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-70"
        >
          {pending ? form.working : form.submit}
          {!pending && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          )}
        </button>
      </div>

      <p className="mt-5 border-t-[1.5px] border-[var(--border-faint)] pt-4 text-[13px] text-[var(--ink-500)]">
        {form.directLead}{" "}
        <a
          href={`mailto:${form.directEmail}`}
          className="font-medium text-[var(--accent-strong)] underline decoration-[var(--line-300)] underline-offset-[3px]"
        >
          {form.directEmail}
        </a>
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-[7px] block text-[13px] font-semibold text-[var(--ink-700)]">
        {label}
      </span>
      {children}
      {error && <span className="mt-[6px] block text-[12.5px] text-[var(--danger-600)]">{error}</span>}
    </label>
  );
}
