"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { money, packs, type Billing } from "@/components/sales/SalesProvider";
import { startHourPackCheckout } from "@/lib/sales/hours";
import { cn } from "@/lib/cn";

const AUDIENCES = ["Marketing agency", "Local business", "SaaS or other"];
const GHL = ["Not set up yet", "Live, built in-house", "Inherited from someone else"];
const TOOLS = [
  "n8n",
  "Zapier",
  "Make",
  "Stripe",
  "Calendly",
  "WordPress",
  "HubSpot",
  "Twilio",
  "Custom API",
];

const STEPS = ["Hours", "Details", "Payment"];

/**
 * Confirm the pack, collect who we are working with, then hand off to
 * /checkout/[reference] for payment. The third step is Stripe's, not ours.
 */
export function HoursCheckout({
  initialHours,
  initialBilling,
}: {
  initialHours: number;
  initialBilling: Billing;
}) {
  const router = useRouter();

  const startIndex = Math.max(
    0,
    packs.findIndex((p) => p.hours === initialHours),
  );
  const [pick, setPick] = useState(startIndex === -1 ? 3 : startIndex);
  const [billing, setBilling] = useState<Billing>(initialBilling);
  const [step, setStep] = useState(0);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [ghl, setGhl] = useState(GHL[1]);
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
    setTools((current) =>
      current.includes(label) ? current.filter((t) => t !== label) : [...current, label],
    );

  const submit = () => {
    if (!agree) {
      setFormError("Please accept the terms before continuing.");
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
    <div className="max-w-[900px] mx-auto">
      {/* ---- Stepper ---- */}
      <div className="flex items-center gap-3 mb-9">
        {STEPS.map((label, i) => {
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
                  "text-[14px] font-semibold",
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
        {/* ---- Step 1: confirm the pack ---- */}
        {step === 0 && (
          <div className="sx-step-in">
            <h1 className="text-[clamp(26px,3.2vw,36px)] font-black tracking-[-1px] leading-[1.1] text-[var(--ink-900)]">
              Confirm your hours
            </h1>

            <div className="sx-seg inline-flex gap-1 p-1 mt-5 rounded-xl bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)]">
              <button type="button" data-on={monthly ? "0" : "1"} onClick={() => setBilling("once")}>
                One-time pack
              </button>
              <button
                type="button"
                data-on={monthly ? "1" : "0"}
                onClick={() => setBilling("monthly")}
              >
                Monthly plan
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mt-5 to-640:grid-cols-4">
              {packs.map((p, i) => (
                <button
                  key={p.hours}
                  type="button"
                  className="sx-chip"
                  data-on={i === pick ? "1" : "0"}
                  aria-pressed={i === pick}
                  onClick={() => setPick(i)}
                >
                  {p.hours}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-end justify-between gap-5 mt-7 pt-6 border-t-[1.5px] border-[var(--border-faint)]">
              <div>
                <p className="font-mono text-[10.5px] tracking-[1.1px] uppercase text-[var(--ink-300)]">
                  {monthly ? "Due today, then monthly" : "Due today"}
                </p>
                <p className="mt-2 font-mono text-[38px] font-semibold tracking-[-1.4px] leading-none text-[var(--ink-900)]">
                  {money(pack.price)}
                  {monthly && <span className="text-[18px]"> / mo</span>}
                </p>
                <p className="mt-2 text-[14px] text-[var(--ink-500)]">
                  {pack.hours} hours at ${pack.rate} / hr
                </p>
              </div>
              <Button size="lg" arrow onClick={() => go(1)}>
                Continue
              </Button>
            </div>

            <p className="mt-5 text-[13.5px] leading-[1.7] text-[var(--ink-500)]">
              {monthly
                ? "Monthly plan. Your balance resets each billing cycle and does not carry over. Cancel any time to stop future renewals."
                : "One-time pack. Your hours are valid for 60 days from purchase."}
            </p>
          </div>
        )}

        {/* ---- Step 2: who we are working with ---- */}
        {step === 1 && (
          <div className="sx-step-in">
            <h1 className="text-[clamp(26px,3.2vw,36px)] font-black tracking-[-1px] leading-[1.1] text-[var(--ink-900)]">
              Who are we working with?
            </h1>

            <div className="grid grid-cols-2 gap-4 mt-6 to-640:grid-cols-1">
              <label>
                <span className="sx-lbl">Full name</span>
                <input
                  className="sx-fld"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                {errors.fullName && <p className="sx-err">{errors.fullName}</p>}
              </label>
              <label>
                <span className="sx-lbl">Work email</span>
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
                <span className="sx-lbl">Company</span>
                <input
                  className="sx-fld"
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </label>
              <label>
                <span className="sx-lbl">You are a</span>
                <select
                  className="sx-fld"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                >
                  {AUDIENCES.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </label>
            </div>

            <p className="sx-lbl mt-6">Your GoHighLevel account</p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-[10px]">
              {GHL.map((label) => (
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

            <p className="sx-lbl mt-6">Other tools in play</p>
            <div className="flex flex-wrap gap-2">
              {TOOLS.map((label) => (
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
                Back
              </Button>
              <Button size="lg" arrow onClick={() => go(2)}>
                Continue to payment
              </Button>
            </div>
          </div>
        )}

        {/* ---- Step 3: confirm, then hand off to Stripe ---- */}
        {step === 2 && (
          <div className="sx-step-in">
            <h1 className="text-[clamp(26px,3.2vw,36px)] font-black tracking-[-1px] leading-[1.1] text-[var(--ink-900)]">
              Payment
            </h1>
            <p className="mt-3 text-[15.5px] leading-[1.7] text-[var(--ink-500)]">
              Card details are entered on the next screen, inside Stripe. They never
              touch our servers.
            </p>

            <div className="mt-6 rounded-[16px] border-[1.5px] border-[var(--border-default)] overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-5 py-4 bg-[var(--surface-1)] border-b-[1.5px] border-[var(--border-faint)]">
                <span className="text-[14.5px] font-semibold text-[var(--ink-900)]">
                  {pack.hours} prepaid hours
                </span>
                <span className="font-mono text-[14.5px] text-[var(--ink-600)]">
                  ${pack.rate} / hr
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <span className="text-[14.5px] font-semibold text-[var(--ink-900)]">
                  {monthly ? "Due today, then monthly" : "Due today"}
                </span>
                <span className="font-mono text-[22px] font-semibold tracking-[-0.8px] text-[var(--ink-900)]">
                  {money(pack.price)}
                  {monthly ? " / mo" : ""}
                </span>
              </div>
            </div>

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
                I understand hours already worked are not refundable, and that unused
                hours can be refunded under the published refund policy.
                {monthly && " I understand this plan renews monthly until I cancel."}
              </span>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t-[1.5px] border-[var(--border-faint)]">
              <Button variant="ghost" onClick={() => go(1)}>
                Back
              </Button>
              {pending ? (
                <span className="inline-flex items-center gap-[10px] px-7 py-[15px] rounded-xl bg-[var(--accent-hover)] text-white text-[16px] font-semibold">
                  <svg className="sx-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M12 3a9 9 0 1 0 9 9" />
                  </svg>
                  Starting
                </span>
              ) : (
                <Button size="lg" arrow onClick={submit}>
                  Continue to secure payment
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
  );
}
