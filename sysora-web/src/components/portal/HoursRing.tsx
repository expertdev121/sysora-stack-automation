/**
 * The hours-remaining ring from the portal design.
 *
 * Pure SVG with no client JavaScript: it is a number and an arc, and
 * both are known on the server. The arc turns amber under 20% left,
 * which is the same threshold the console uses to call an account "Low
 * balance", so the client and the team see the same warning at the same
 * moment.
 *
 * Geometry is the design's: a 150 box, r=62, 14-wide stroke.
 */
const RADIUS = 62;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function HoursRing({ remaining, purchased }: { remaining: number; purchased: number }) {
  const ratio = purchased > 0 ? Math.max(0, Math.min(1, remaining / purchased)) : 0;
  const low = purchased > 0 && ratio < 0.2;
  const colour = low ? "#C2410C" : "var(--accent)";

  return (
    <div className="flex flex-col items-center">
      <svg width="150" height="150" viewBox="0 0 150 150" role="img"
           aria-label={`${remaining} of ${purchased} hours remaining`}>
        <circle cx="75" cy="75" r={RADIUS} fill="none" stroke="var(--line-mint-2)" strokeWidth="14" />
        <circle
          cx="75"
          cy="75"
          r={RADIUS}
          fill="none"
          stroke={colour}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(CIRCUMFERENCE * ratio).toFixed(1)} ${CIRCUMFERENCE.toFixed(1)}`}
          transform="rotate(-90 75 75)"
        />
        <text
          x="75"
          y="74"
          textAnchor="middle"
          className="fill-[var(--ink-900)]"
          style={{ fontSize: 30, fontWeight: 600 }}
        >
          {Math.round(remaining * 10) / 10}
        </text>
        <text x="75" y="94" textAnchor="middle" className="fill-[var(--text-muted)]" style={{ fontSize: 12 }}>
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
