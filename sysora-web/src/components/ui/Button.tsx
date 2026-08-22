import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Sysora Button.
 * Variants: primary (mint + glow), ghost (hairline → mint on hover),
 * white (on tinted bands), outlineWhite (on dark bands), dark (the
 * forest CTA). Sizes sm | md | lg. Optional trailing arrow.
 */

export type ButtonVariant = "primary" | "ghost" | "white" | "outlineWhite" | "dark";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-sans font-bold leading-[normal] tracking-[-0.1px] no-underline whitespace-nowrap cursor-pointer " +
  "transition-[background-color,transform,box-shadow,border-color,color] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]";

const sizes: Record<ButtonSize, string> = {
  sm: "px-[18px] py-[9px] text-[14px] rounded-[10px]",
  md: "px-[24px] py-[12px] text-[15px] rounded-[12px]",
  lg: "px-[32px] py-[15px] text-[16px] rounded-[12px]",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-white border-[1.5px] border-transparent shadow-[var(--glow-btn)] " +
    "hover:bg-[var(--accent-hover)] hover:-translate-y-px hover:shadow-[var(--glow-btn-hover)] hover:text-white",
  ghost:
    "bg-transparent text-[var(--text-body)] border-[1.5px] border-[var(--border-default)] " +
    "hover:bg-[var(--mint-50)] hover:text-[var(--accent-strong)] hover:border-[var(--accent)]",
  white:
    "bg-white text-[var(--text-heading)] border-[1.5px] border-transparent shadow-[var(--shadow-xs)] " +
    "hover:-translate-y-px hover:shadow-[var(--shadow-card)] hover:text-[var(--text-heading)]",
  outlineWhite:
    "bg-transparent text-white/85 border-[1.5px] border-white/25 " +
    "hover:text-white hover:border-white/60",
  dark:
    "bg-[var(--forest-cta)] text-white border-[1.5px] border-transparent " +
    "hover:bg-[var(--forest-hero)] hover:text-white",
};

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  icon = null,
  fullWidth = false,
  className,
  ...rest
}: ButtonProps) {
  const classes = cn(
    base,
    sizes[size],
    variants[variant],
    fullWidth && "w-full",
    "disabled:opacity-55 disabled:cursor-not-allowed",
    className,
  );

  const content = (
    <>
      {icon}
      {children}
      {arrow && <ArrowIcon />}
    </>
  );

  if (typeof rest.href === "string") {
    const { href, ...anchorProps } = rest as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {content}
      </Link>
    );
  }

  const buttonProps = rest as ButtonAsButton;
  return (
    <button type="button" className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
