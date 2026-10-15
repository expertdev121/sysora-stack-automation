/**
 * The hours-remaining ring from the portal design.
 *
 * Pure SVG with no client JavaScript: it is a number and an arc, and
 * both are known on the server. The arc turns amber under 20% left,
 * which is the same threshold the console uses to call an account "Low
 * balance", so the client and the team see the same warning at the same
 * moment.
 */
const RADIUS = 62;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function HoursRing({ remaining, purchased }: { remaining: number; purchased: number }) {
  const ratio = purchased > 0 ? Math.max(0, Math.min(1, remaining / purchased)) : 0;
  const low = purchased > 0 && ratio < 0.2;
  const colour = low ? "#C2410C" : "var(--accent)";

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="160" viewBox="0 0 160 160" role="img"
           aria-label={`${remaining} of ${purchased} hours remaining`}>
        <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="var(--line-slate-2)" strokeWidth="13" />
        <circle
          cx="80"
          cy="80"
          r={RADIUS}
          fill="none"
          stroke={colour}
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={`${(CIRCUMFERENCE * ratio).toFixed(1)} ${CIRCUMFERENCE.toFixed(1)}`}
          transform="rotate(-90 80 80)"
        />
        <text
          x="80"
          y="74"
          textAnchor="middle"
          className="fill-[var(--text-heading)] font-display"
          style={{ fontSize: 34, fontWeight: 900 }}
        >
          {Math.round(remaining * 10) / 10}
        </text>
        <text x="80" y="96" textAnchor="middle" className="fill-[var(--text-muted)]" style={{ fontSize: 12.5 }}>
          hours left
        </text>
      </svg>
      {purchased === 0 && (
        <p className="mt-2 text-center text-[12.5px] text-[var(--text-muted)]">
          No hours on the account yet.
        </p>
      )}
    </div>
  );
}
