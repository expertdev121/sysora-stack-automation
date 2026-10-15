import Link from "next/link";

/**
 * The four shortcut tiles on the portal overview.
 *
 * Icon paths are lifted from the design rather than redrawn, so the
 * stroke weight and corner feel stay identical to the mock.
 */
const ICONS: Record<string, string> = {
  ticket: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z",
  build: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z",
  invoice: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4",
  card: "M3 6h18v12H3zM3 10h18M7 15h3",
};

export type QuickAction = {
  href: string;
  icon: keyof typeof ICONS;
  label: string;
  sub: string;
};

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid grid-cols-4 gap-4 to-980:grid-cols-2 to-560:grid-cols-1">
      {actions.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className="flex flex-col gap-[10px] rounded-[16px] border border-[var(--line-mint)] bg-white p-[18px] transition-colors hover:border-[var(--accent)]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-strong)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={ICONS[a.icon]} />
          </svg>
          <span className="mt-auto block text-[14.5px] font-semibold text-[var(--ink-900)]">
            {a.label}
          </span>
          <span className="block text-[12.5px] text-[var(--text-muted)]">{a.sub}</span>
        </Link>
      ))}
    </div>
  );
}
