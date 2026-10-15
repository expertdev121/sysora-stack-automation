import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { STATUS_LABELS, STATUS_TONE } from "@/lib/admin/types";
import type { RequestStatus } from "@/lib/sales/types";

export function PageHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <p className="mt-0 mb-2 font-mono text-[10px] tracking-[1.6px] uppercase text-[var(--ink-200)]">
            {eyebrow}
          </p>
        )}
        <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.6px] text-[var(--ink-900)]">
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[16px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_4px_rgba(0,80,50,0.04),0_12px_28px_rgba(0,80,50,0.05)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b-[1.5px] border-[var(--border-faint)] bg-[var(--surface-1)] rounded-t-[15px]">
      <span className="font-mono text-[10.5px] tracking-[1.2px] uppercase text-[var(--ink-200)]">
        {title}
      </span>
      {hint && <span className="text-[12.5px] text-[var(--ink-300)]">{hint}</span>}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <Card className="px-6 py-5">
      <p className="m-0 font-mono text-[10px] tracking-[1.4px] uppercase text-[var(--ink-200)]">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 mb-0 font-mono text-[28px] font-semibold tracking-[-1px] leading-none",
          accent ? "text-[var(--accent-strong)]" : "text-[var(--ink-900)]",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-2 mb-0 text-[12.5px] text-[var(--ink-300)]">{sub}</p>}
    </Card>
  );
}

const toneClass = {
  mint: "bg-[var(--mint-50)] border-[var(--border-default)] text-[var(--mint-700)]",
  amber: "bg-[var(--warning-bg)] border-[var(--warning-border)] text-[var(--warning)]",
  slate: "bg-[var(--surface-2)] border-[var(--line-mint)] text-[var(--ink-300)]",
  red: "bg-[var(--danger-bg)] border-[var(--danger-border)] text-[var(--danger-600)]",
} as const;

export function Pill({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: keyof typeof toneClass;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full border-[1.5px] text-[11.5px] font-semibold whitespace-nowrap",
        toneClass[tone],
      )}
    >
      {children}
    </span>
  );
}

export function StatusPill({ status }: { status: RequestStatus }) {
  return <Pill tone={STATUS_TONE[status]}>{STATUS_LABELS[status]}</Pill>;
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[14px]">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "text-left font-mono text-[10px] tracking-[1.2px] uppercase text-[var(--ink-200)] font-semibold px-6 py-3 border-b-[1.5px] border-[var(--border-faint)] whitespace-nowrap",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td
      className={cn(
        "px-6 py-4 border-b-[1.5px] border-[var(--border-faint)] align-top text-[var(--ink-700)]",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="px-6 py-12 text-center text-[15px] text-[var(--ink-300)]">{children}</div>
  );
}

/** Shared input styling, so admin forms match the public ones. */
export const inputClass =
  "w-full px-[12px] py-[9px] rounded-[10px] border-[1.5px] border-[var(--border-default)] bg-white " +
  "text-[14px] text-[var(--ink-800)] outline-none transition-[border-color,box-shadow] duration-150 " +
  "focus:border-[var(--accent)] focus:shadow-[var(--focus-shadow)]";

export const labelClass = "text-[12.5px] font-semibold text-[var(--ink-900)]";
