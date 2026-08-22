/**
 * The icon set used on the landing page — each one a verbatim copy of the
 * SVG in the source design, including size, stroke width and cap style.
 */

export function CheckIcon({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function CrossIcon({ size = 9 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

/** The muted cross used in the "today, manually" column on dark bands. */
export function CrossMutedIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.38)"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent-strong)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function PlusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function StarIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3 6.5 7 .9-5 4.8 1.2 7-6.2-3.4L5.8 21 7 14.2 2 9.4l7-.9z" />
    </svg>
  );
}

/** The rounder star used on the founder profile card. */
export function StarSoftIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3l2.6 5.7 6.2.8-4.5 4.3 1.1 6.2-5.4-3-5.4 3 1.1-6.2L3.2 9.5l6.2-.8z" />
    </svg>
  );
}

/** Crown — the Top Rated badge. */
export function CrownIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 8l4 3 4-6 4 6 4-3v9H4z" />
    </svg>
  );
}

/* ---- Section card icons (21px, 1.75 stroke) ---- */

function LineIcon({ size = 21, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Arrows breaking away from a centre node — "your people are the integration". */
export function HandoffIcon({ size }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M16 3h5v5" />
      <path d="M8 21H3v-5" />
      <path d="M21 3l-7.5 7.5" />
      <path d="M3 21l7.5-7.5" />
      <circle cx="12" cy="12" r="2.5" />
    </LineIcon>
  );
}

/** Unattended gear — "nobody owns the automations you have". */
export function GearIcon({ size }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M4.5 7.5l2.1 2.1" />
      <path d="M17.4 14.4l2.1 2.1" />
      <path d="M3 12h3" />
      <path d="M18 12h3" />
      <circle cx="12" cy="12" r="3.5" />
    </LineIcon>
  );
}

/** Bar chart — "your data can't answer basic questions". */
export function ChartIcon({ size }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M3 20V10" />
      <path d="M9 20V4" />
      <path d="M15 20v-7" />
      <path d="M21 20V8" />
    </LineIcon>
  );
}

/** Ledger / comparison table. */
export function LedgerIcon({ size = 20 }: { size?: number }) {
  return (
    <LineIcon size={size}>
      <path d="M3 5h18" />
      <path d="M6 5v14" />
      <path d="M18 5v14" />
      <path d="M6 12h12" />
      <path d="M3 19h18" />
    </LineIcon>
  );
}
