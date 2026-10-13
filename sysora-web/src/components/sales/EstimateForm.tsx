"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { estimate } from "@/content/landing/estimate";
import { submitEstimate } from "@/lib/sales/estimate";
import { cn } from "@/lib/cn";

const { form, done } = estimate;

export function EstimateForm() {
  const [types, setTypes] = useState<string[]>([form.types[0]]);
  const [timing, setTiming] = useState<string>(form.timings[1]);
  const [audience, setAudience] = useState<string>(form.audiences[0]);
  const [description, setDescription] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggleType = (label: string) =>
    setTypes((current) =>
      current.includes(label) ? current.filter((t) => t !== label) : [...current, label],
    );

  const send = () => {
    setFormError(null);
    setErrors({});
    startTransition(async () => {
      const result = await submitEstimate({
        types,
        description,
        timing,
        fullName,
        email,
        company,
        audience,
      });

      if (result.ok) {
        setReference(result.reference);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setErrors(result.fieldErrors ?? {});
      setFormError(result.error);
    });
  };

  const reset = () => {
    setReference(null);
    setDescription("");
    setErrors({});
    setFormError(null);
  };

  if (reference) {
    return (
      <section className="sx-step-in p-[clamp(24px,3.5vw,40px)] rounded-[22px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_24px_54px_rgba(0,80,50,0.09)] text-center">
        <div className="pt-7 pb-3">
          <svg width="76" height="76" viewBox="0 0 64 64" fill="none" aria-hidden="true" className="block mx-auto">
            <circle className="sx-chk-ring" cx="32" cy="32" r="29" stroke="var(--accent)" strokeWidth="3" />
            <path className="sx-chk-tick" d="M20 33l8 8 16-17" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="mt-[22px] text-[clamp(28px,3.4vw,40px)] font-black tracking-[-1px] leading-[1.1] text-[var(--ink-900)]">
            {done.headline}
          </h2>
          <p className="mt-3 mb-0 mx-auto max-w-[460px] text-[15.5px] leading-[1.7] text-[var(--ink-500)]">
            {done.body}
          </p>
          <p className="mt-4 font-mono text-[12px] tracking-[1px] text-[var(--ink-300)]">
            {done.refLabel} {reference}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <Button size="lg" variant="ghost" onClick={reset}>
              {done.again}
            </Button>
            <Button size="lg" arrow href="/#packages">
              {done.browse}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="sx-step-in p-[clamp(24px,3.5vw,40px)] rounded-[22px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_24px_54px_rgba(0,80,50,0.09)]">
      <p className="sx-lbl mb-[10px]">{form.typesLabel}</p>
      <div className="flex flex-wrap gap-2">
        {form.types.map((label) => (
          <button
            key={label}
            type="button"
            className="sx-tool"
            data-on={types.includes(label) ? "1" : "0"}
            aria-pressed={types.includes(label)}
            onClick={() => toggleType(label)}
          >
            {label}
          </button>
        ))}
      </div>
      {errors.types && <p className="sx-err">{errors.types}</p>}

      <label className="block mt-6">
        <span className="sx-lbl">{form.descriptionLabel}</span>
        <textarea
          className="sx-fld resize-y leading-[1.6]"
          rows={6}
          placeholder={form.descriptionPlaceholder}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      {errors.description && <p className="sx-err">{errors.description}</p>}

      <p className="sx-lbl mt-[22px]">{form.timingLabel}</p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-[10px]">
        {form.timings.map((label) => (
          <button
            key={label}
            type="button"
            className="sx-opt"
            data-on={timing === label ? "1" : "0"}
            aria-pressed={timing === label}
            onClick={() => setTiming(label)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-[26px] pt-6 border-t-[1.5px] border-[var(--border-faint)] to-640:grid-cols-1">
        <label>
          <span className="sx-lbl">{form.nameLabel}</span>
          <input
            className="sx-fld"
            placeholder={form.namePlaceholder}
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          {errors.fullName && <p className="sx-err">{errors.fullName}</p>}
        </label>
        <label>
          <span className="sx-lbl">{form.emailLabel}</span>
          <input
            className="sx-fld"
            type="email"
            placeholder={form.emailPlaceholder}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="sx-err">{errors.email}</p>}
        </label>
        <label>
          <span className="sx-lbl">{form.companyLabel}</span>
          <input
            className="sx-fld"
            placeholder={form.companyPlaceholder}
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
        <label>
          <span className="sx-lbl">{form.audienceLabel}</span>
          <select
            className="sx-fld"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          >
            {form.audiences.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-[14px] mt-7">
        <p className="flex-1 min-w-[220px] text-[12.5px] leading-[1.6] text-[var(--ink-500)]">
          {form.terms}
        </p>
        {pending ? (
          <span className="inline-flex items-center gap-[10px] px-7 py-[15px] rounded-xl bg-[var(--accent-hover)] text-white text-[16px] font-semibold">
            <svg className="sx-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M12 3a9 9 0 1 0 9 9" />
            </svg>
            {form.sending}
          </span>
        ) : (
          <Button size="lg" arrow onClick={send}>
            {form.submit}
          </Button>
        )}
      </div>

      {formError && (
        <p className={cn("sx-err", "mt-4 text-[14px]")} role="alert">
          {formError}
        </p>
      )}
    </section>
  );
}
