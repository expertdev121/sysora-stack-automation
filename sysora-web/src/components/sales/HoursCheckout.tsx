"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icon";
import { SysoraLogo } from "@/components/ui/Logo";
import { money, packs, type Billing } from "@/components/sales/SalesProvider";
import { checkout as copy } from "@/content/landing/sales";
import { startHourPackCheckout } from "@/lib/sales/hours";
import { cn } from "@/lib/cn";

/**
 * Confirm the pack, collect who we are working with, then hand off to
 * /checkout/[reference] for payment. The card form is Stripe's, not ours,
 * which is the one place this departs from the design.
 */
export function HoursCheckout({
  initialHours,
  initialBilling,
}: {
  initialHours: number;
  initialBilling: Billing;
}) {
  const router = useRouter();

  const found = packs.findIndex((p) => p.hours === initialHours);
  const [pick, setPick] = useState(found === -1 ? 3 : found);
  const [billing, setBilling] = useState<Billing>(initialBilling);
  const [step, setStep] = useState(0);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [timezone, setTimezone] = useState<string>(copy.details.timezones[0]);
  const [audience, setAudience] = useState<string>(copy.details.kinds[0]);
  const [ghl, setGhl] = useState<string>(copy.details.ghlOpts[1]);
  const [tools, setTools] = useState<string[]>(["n8n"]);
  const [agree, setAgree] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const pack = packs[pick];
  const monthly = billing === "monthly";

  const go = (next: number) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleTool = (label: string) =>
    setTools((cur) =>
      cur.includes(label) ? cur.filter((t) => t !== label) : [...cur, label],
    );

  const submit = () => {
    if (!agree) {
      setFormError(copy.pay.agreeError);
      return;
    }
    setFormError(null);
    setErrors({});

    startTransition(async () => {
      const result = await startHourPackCheckout({
        hours: pack.hours,
        billing,
        fullName,
        email,
        company,
        audience,
        ghl,
        tools,
        timezone,
      });

      if (result.ok) {
        router.push(result.redirectTo);
        return;
      }

      setErrors(result.fieldErrors ?? {});
      setFormError(result.error);
      if (result.fieldErrors) go(1);
    });
  };

  return (
    <div className="max-w-[1160px] mx-auto">
      {/* ---- Checkout chrome ---- */}
      <div className="flex items-center justify-between gap-5 pb-6 mb-8 border-b-[1.5px] border-[var(--border-faint)]">
        <Link href="/" className="flex items-center" aria-label="Sysora home">
          <SysoraLogo className="h-7 w-auto block" />
        </Link>
        <span className="flex items-center gap-4">
          <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-[var(--ink-600)]">
            <CheckIcon size={14} strokeWidth={2.4} className="text-[var(--accent)]" />
            {copy.chrome.title}
          </span>
          <Link href="/#packages" className="text-[13px] font-semibold text-[var(--ink-500)]">
            {copy.chrome.back}
          </Link>
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] gap-7 items-start to-900:grid-cols-1">
        <div>
          {/* ---- Stepper ---- */}
          <div className="flex items-center gap-3 mb-8">
            {copy.steps.map((label, i) => {
              const done = i < step;
              const current = i === step;
              const on = done || current;
              return (
                <div key={label} className={cn("flex items-center gap-3", i < 2 && "flex-1")}>
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-8 h-8 flex-none rounded-full border-[1.5px] font-mono text-[13px] font-semibold",
                      on
                        ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                        : "bg-[var(--surface-0)] border-[var(--border-default)] text-[var(--ink-300)]",
                    )}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-[14px] font-semibold to-640:hidden",
                      current
                        ? "text-[var(--ink-900)]"
                        : done
                          ? "text-[var(--ink-700)]"
                          : "text-[var(--ink-300)]",
                    )}
                  >
                    {label}
                  </span>
                  {i < 2 && (
                    <span
                      className={cn(
                        "flex-1 h-[1.5px] rounded",
                        done ? "bg-[var(--accent)]" : "bg-[var(--border-default)]",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-[clamp(24px,3.5vw,40px)] rounded-[22px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_24px_54px_rgba(0,80,50,0.09)]">
            {/* ---- Step 1 ---- */}
            {step === 0 && (
              <div className="sx-step-in">
                <p className="font-mono text-[10.5px] tracking-[1.2px] uppercase text-[var(--ink-300)]">
                  {copy.plan.step}
                </p>
                <h1 className="mt-3 text-[clamp(26px,3.2vw,36px)] font-black tracking-[-1px] leading-[1.1] text-[var(--ink-900)]">
                  {copy.plan.headline}
                </h1>
                <p className="mt-3 text-[15px] leading-[1.7] text-[var(--ink-500)]">
                  {copy.plan.lead}
                </p>

                <div className="sx-seg inline-flex gap-1 p-1 mt-5 rounded-xl bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
                  <button type="button" data-on={monthly ? "0" : "1"} onClick={() => setBilling("once")}>
                    One-time pack
                  </button>
                  <button type="button" data-on={monthly ? "1" : "0"} onClick={() => setBilling("monthly")}>
                    Monthly plan
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 mt-5 to-640:grid-cols-4">
                  {packs.map((p, i) => (
                    <button
                      key={p.hours}
                      type="button"
                      className="sx-chip flex flex-col gap-[2px] py-3"
                      data-on={i === pick ? "1" : "0"}
                      aria-pressed={i === pick}
                      onClick={() => setPick(i)}
                    >
                      <span className="text-[15px]">{p.hours}</span>
                      <span className="text-[10px] font-normal opacity-70">hrs</span>
                    </button>
                  ))}
                </div>

                <p className="mt-5 text-[13.5px] leading-[1.7] text-[var(--ink-500)]">
                  {monthly ? copy.plan.validityMonthly : copy.plan.validityOnce}
                </p>

                <div className="flex justify-end mt-7 pt-6 border-t-[1.5px] border-[var(--border-faint)]">
                  <Button size="lg" arrow onClick={() => go(1)}>
                    {copy.plan.next}
                  </Button>
                </div>
              </div>
            )}

            {/* ---- Step 2 ---- */}
            {step === 1 && (
              <div className="sx-step-in">
                <p className="font-mono text-[10.5px] tracking-[1.2px] uppercase text-[var(--ink-300)]">
                  {copy.details.step}
                </p>
                <h1 className="mt-3 text-[clamp(26px,3.2vw,36px)] font-black tracking-[-1px] leading-[1.1] text-[var(--ink-900)]">
                  {copy.details.headline}
                </h1>
                <p className="mt-3 text-[15px] leading-[1.7] text-[var(--ink-500)]">
                  {copy.details.lead}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-6 to-640:grid-cols-1">
                  <label>
                    <span className="sx-lbl">{copy.details.name}</span>
                    <input
                      className="sx-fld"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                    {errors.fullName && <p className="sx-err">{errors.fullName}</p>}
                  </label>
                  <label>
                    <span className="sx-lbl">{copy.details.email}</span>
                    <input
                      className="sx-fld"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <p className="sx-err">{errors.email}</p>}
                  </label>
                  <label>
                    <span className="sx-lbl">{copy.details.company}</span>
                    <input
                      className="sx-fld"
                      autoComplete="organization"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </label>
                  <label>
                    <span className="sx-lbl">{copy.details.timezone}</span>
                    <select
                      className="sx-fld"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      {copy.details.timezones.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <p className="sx-lbl mt-6">{copy.details.kind}</p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-[10px]">
                  {copy.details.kinds.map((label) => (
                    <button
                      key={label}
                      type="button"
                      className="sx-opt"
                      data-on={audience === label ? "1" : "0"}
                      onClick={() => setAudience(label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <p className="sx-lbl mt-6">{copy.details.ghl}</p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-[10px]">
                  {copy.details.ghlOpts.map((label) => (
                    <button
                      key={label}
                      type="button"
                      className="sx-opt"
                      data-on={ghl === label ? "1" : "0"}
                      onClick={() => setGhl(label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <p className="sx-lbl mt-6">{copy.details.tools}</p>
                <div className="flex flex-wrap gap-2">
                  {copy.details.toolOpts.map((label) => (
                    <button
                      key={label}
                      type="button"
                      className="sx-tool"
                      data-on={tools.includes(label) ? "1" : "0"}
                      onClick={() => toggleTool(label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t-[1.5px] border-[var(--border-faint)]">
                  <Button variant="ghost" onClick={() => go(0)}>
                    {copy.details.back}
                  </Button>
                  <Button size="lg" arrow onClick={() => go(2)}>
                    {copy.details.next}
                  </Button>
                </div>
              </div>
            )}

            {/* ---- Step 3 ---- */}
            {step === 2 && (
              <div className="sx-step-in">
                <p className="font-mono text-[10.5px] tracking-[1.2px] uppercase text-[var(--ink-300)]">
                  {copy.pay.step}
                </p>
                <h1 className="mt-3 text-[clamp(26px,3.2vw,36px)] font-black tracking-[-1px] leading-[1.1] text-[var(--ink-900)]">
                  {copy.pay.headline}
                </h1>
                <p className="mt-3 text-[15px] leading-[1.7] text-[var(--ink-500)]">
                  {copy.pay.lead}
                </p>
                <p className="mt-3 text-[15px] leading-[1.7] text-[var(--ink-500)]">
                  {copy.pay.handoff}
                </p>

                <label className="flex items-start gap-3 mt-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={() => {
                      setAgree((v) => !v);
                      setFormError(null);
                    }}
                    className="mt-1 w-[18px] h-[18px] accent-[var(--accent)]"
                  />
                  <span className="text-[14px] leading-[1.65] text-[var(--ink-600)]">
                    {copy.pay.agree}
                    {monthly && copy.pay.agreeMonthly}
                  </span>
                </label>

                <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t-[1.5px] border-[var(--border-faint)]">
                  <Button variant="ghost" onClick={() => go(1)}>
                    {copy.pay.back}
                  </Button>
                  {pending ? (
                    <span className="inline-flex items-center gap-[10px] px-7 py-[15px] rounded-xl bg-[var(--accent-hover)] text-white text-[16px] font-semibold">
                      <svg className="sx-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M12 3a9 9 0 1 0 9 9" />
                      </svg>
                      {copy.pay.working}
                    </span>
                  ) : (
                    <Button size="lg" arrow onClick={submit}>
                      {copy.pay.submit}
                    </Button>
                  )}
                </div>

                {formError && (
                  <p className="sx-err mt-4 text-[14px]" role="alert">
                    {formError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ---- Order summary ---- */}
        <aside className="sticky top-[104px] to-900:static p-7 rounded-[22px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.07)]">
          <p className="font-mono text-[10.5px] tracking-[1.2px] uppercase text-[var(--ink-300)]">
            {copy.summary.title}
          </p>

          <div className="flex items-center gap-3 mt-4">
            <span className="inline-flex items-center justify-center min-w-[46px] h-[38px] px-2 rounded-xl bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] font-mono text-[15px] font-semibold text-[var(--accent-strong)]">
              {pack.hours}h
            </span>
            <span className="flex flex-col">
              <span className="text-[14.5px] font-bold text-[var(--ink-900)]">
                {pack.hours}-hour {monthly ? "monthly plan" : "one-time pack"}
              </span>
              <span className="text-[12.5px] text-[var(--ink-500)]">
                ${pack.rate} / hr effective rate
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t-[1.5px] border-[var(--border-faint)] text-[14px]">
            <span className="text-[var(--ink-500)]">
              {pack.hours} hours × ${pack.rate}
            </span>
            <span className="font-mono text-[var(--ink-900)]">{money(pack.price)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 mt-3 text-[14px]">
            <span className="text-[var(--ink-500)]">{copy.summary.included}</span>
            <span className="font-semibold text-[var(--accent-strong)]">
              {copy.summary.includedValue}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 mt-3 text-[14px]">
            <span className="text-[var(--ink-500)]">{monthly ? "Resets" : "Valid for"}</span>
            <span className="text-[var(--ink-700)]">
              {monthly ? "Each billing cycle" : "60 days"}
            </span>
          </div>

          <div className="flex items-end justify-between gap-3 mt-5 pt-4 border-t-[1.5px] border-[var(--border-faint)]">
            <span className="text-[13.5px] font-semibold text-[var(--ink-700)]">
              {monthly ? "Due today, then monthly" : "Due today"}
            </span>
            <span className="font-mono text-[24px] font-semibold tracking-[-0.8px] text-[var(--ink-900)]">
              {money(pack.price)}
              {monthly ? "/mo" : ""}
            </span>
          </div>

          <div className="mt-5 p-4 rounded-[14px] bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
            <p className="text-[13px] font-bold text-[var(--ink-900)]">
              {copy.summary.refundTitle}
            </p>
            <p className="mt-[6px] text-[12.5px] leading-[1.6] text-[var(--ink-600)]">
              {copy.summary.refundBody}
            </p>
          </div>

          <ul className="list-none m-0 mt-5 p-0 flex flex-col gap-[10px]">
            {copy.summary.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex gap-[10px] text-[13px] leading-[1.6] text-[var(--ink-600)]"
              >
                <CheckIcon
                  size={14}
                  strokeWidth={2.4}
                  className="flex-none mt-[3px] text-[var(--accent)]"
                />
                {bullet}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
