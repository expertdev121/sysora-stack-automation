"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Card, CardHeader, Table, Td, Th } from "@/components/ui";
import { formatMoney } from "@/lib/money";

/**
 * Money in and money out, over time.
 *
 * Two series on ONE axis. They are both money in the same units, so a
 * second y-scale would be inventing a relationship rather than showing
 * one — the most common way a chart lies.
 *
 * Colours are the validated series slots, not the brand mint. The
 * intuitive pick for this chart is green-in / red-out, and it measures
 * ΔE 7.9 under deuteranopia: the classic trap. Blue and orange measure
 * 24.7. See globals.css.
 */

export type TrendPoint = { day: string; revenue: number; spend: number };

const PAD = { top: 16, right: 76, bottom: 28, left: 56 };
const HEIGHT = 240;

/** Axis ticks want round numbers, not the data's own maximum. */
function niceCeiling(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) {
    const candidate = magnitude * step;
    if (candidate >= value) return candidate;
  }
  return magnitude * 10;
}

/** $1.2K on an axis; the full figure lives in the tooltip and table. */
function compact(minor: number): string {
  const major = minor / 100;
  if (major === 0) return "$0";
  if (Math.abs(major) >= 1_000_000) return `$${(major / 1_000_000).toFixed(1)}M`;
  if (Math.abs(major) >= 1_000) return `$${(major / 1_000).toFixed(major % 1000 === 0 ? 0 : 1)}K`;
  return `$${Math.round(major)}`;
}

function shortDay(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

/** Width from the element, so text stays at its real size rather than scaling with a viewBox. */
function useWidth() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // A subscription, not derived state: the browser tells us when it changes.
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

export function TrendChart({
  points,
  title,
  hint,
}: {
  points: TrendPoint[];
  title: string;
  hint?: string;
}) {
  const { ref, width: measured } = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const width = measured || 720;

  const { ceiling, ticks } = useMemo(() => {
    const max = points.reduce((m, p) => Math.max(m, p.revenue, p.spend), 0);
    const top = niceCeiling(max);
    return { ceiling: top, ticks: [0, top / 4, top / 2, (top * 3) / 4, top] };
  }, [points]);

  if (points.length === 0) {
    return (
      <Card>
        <CardHeader title={title} hint={hint} />
        <div className="px-6 py-16 text-center text-[15px] text-[var(--ink-300)]">
          Nothing recorded yet. The line starts the day money moves.
        </div>
      </Card>
    );
  }

  const plotWidth = Math.max(80, width - PAD.left - PAD.right);
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;

  const x = (i: number) =>
    PAD.left + (points.length === 1 ? plotWidth / 2 : (i / (points.length - 1)) * plotWidth);
  const y = (v: number) => PAD.top + plotHeight - (v / ceiling) * plotHeight;

  const path = (key: "revenue" | "spend") =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(" ");

  const last = points[points.length - 1];
  const active = hover !== null ? points[hover] : null;

  function onMove(event: React.MouseEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const offset = event.clientX - box.left - PAD.left;
    const ratio = plotWidth === 0 ? 0 : offset / plotWidth;
    const index = Math.round(ratio * (points.length - 1));
    setHover(Math.min(points.length - 1, Math.max(0, index)));
  }

  return (
    <Card>
      <CardHeader
        title={title}
        action={
          <div className="flex items-center gap-4">
            {/* Identity never rests on colour alone. */}
            <Legend />
            <button
              type="button"
              onClick={() => setShowTable((open) => !open)}
              className="text-[12px] font-semibold text-[var(--ink-300)] hover:text-[var(--accent-strong)] cursor-pointer bg-transparent border-0 p-0"
            >
              {showTable ? "Hide numbers" : "Show numbers"}
            </button>
          </div>
        }
      />

      <div className="px-4 pt-4 pb-2" ref={ref}>
        <div className="relative">
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`${title}. Revenue and spend per day.`}
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
            className="block"
          >
            {/* Gridlines: hairline, solid, one step off the surface. */}
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={PAD.left + plotWidth}
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke="var(--chart-grid)"
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 10}
                  y={y(tick) + 4}
                  textAnchor="end"
                  className="fill-[var(--chart-muted)] text-[10.5px] [font-variant-numeric:tabular-nums]"
                >
                  {compact(tick)}
                </text>
              </g>
            ))}

            {/* First and last day only — a label under every point is noise. */}
            <text
              x={PAD.left}
              y={HEIGHT - 8}
              textAnchor="start"
              className="fill-[var(--chart-muted)] text-[10.5px]"
            >
              {shortDay(points[0].day)}
            </text>
            <text
              x={PAD.left + plotWidth}
              y={HEIGHT - 8}
              textAnchor="end"
              className="fill-[var(--chart-muted)] text-[10.5px]"
            >
              {shortDay(last.day)}
            </text>

            {active && (
              <line
                x1={x(hover as number)}
                x2={x(hover as number)}
                y1={PAD.top}
                y2={PAD.top + plotHeight}
                stroke="var(--chart-axis)"
                strokeWidth="1"
              />
            )}

            <path
              d={path("spend")}
              fill="none"
              stroke="var(--series-spend)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d={path("revenue")}
              fill="none"
              stroke="var(--series-revenue)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* End markers carry a 2px surface ring so they stay legible
                where the two lines cross. */}
            <circle
              cx={x(points.length - 1)}
              cy={y(last.spend)}
              r="4.5"
              fill="var(--series-spend)"
              stroke="var(--surface-0)"
              strokeWidth="2"
            />
            <circle
              cx={x(points.length - 1)}
              cy={y(last.revenue)}
              r="4.5"
              fill="var(--series-revenue)"
              stroke="var(--surface-0)"
              strokeWidth="2"
            />

            {active && (
              <>
                <circle
                  cx={x(hover as number)}
                  cy={y(active.spend)}
                  r="4.5"
                  fill="var(--series-spend)"
                  stroke="var(--surface-0)"
                  strokeWidth="2"
                />
                <circle
                  cx={x(hover as number)}
                  cy={y(active.revenue)}
                  r="4.5"
                  fill="var(--series-revenue)"
                  stroke="var(--surface-0)"
                  strokeWidth="2"
                />
              </>
            )}

            {/* Direct labels at the endpoint only, and only when the two
                lines have separated enough to carry one each. Nudging
                colliding labels apart detaches them from their lines and
                reads as noise, so when they converge both are dropped and
                the legend and tooltip do the work. Text wears ink, never
                the series colour — the dot beside it carries identity. */}
            {Math.abs(y(last.revenue) - y(last.spend)) >= 14 && (
              <>
                <text
                  x={x(points.length - 1) + 10}
                  y={y(last.revenue) + 4}
                  className="fill-[var(--ink-700)] text-[11.5px] font-semibold"
                >
                  {compact(last.revenue)}
                </text>
                <text
                  x={x(points.length - 1) + 10}
                  y={y(last.spend) + 4}
                  className="fill-[var(--ink-400)] text-[11.5px] font-semibold"
                >
                  {compact(last.spend)}
                </text>
              </>
            )}
          </svg>

          {active && (
            <div
              className="pointer-events-none absolute z-10 rounded-[10px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-3 py-2 shadow-[0_8px_24px_rgba(0,80,50,0.12)]"
              style={{
                left: Math.min(Math.max(0, x(hover as number) - 70), Math.max(0, width - 150)),
                top: 4,
              }}
            >
              <p className="m-0 mb-1 text-[11.5px] font-semibold text-[var(--ink-800)]">
                {shortDay(active.day)}
              </p>
              <TooltipRow color="var(--series-revenue)" label="Revenue" value={active.revenue} />
              <TooltipRow color="var(--series-spend)" label="Spend" value={active.spend} />
            </div>
          )}
        </div>
      </div>

      {showTable && (
        <div className="border-t-[1.5px] border-[var(--border-faint)]">
          <div className="max-h-[280px] overflow-y-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Day</Th>
                  <Th>Revenue</Th>
                  <Th>Spend</Th>
                  <Th>Net</Th>
                </tr>
              </thead>
              <tbody>
                {[...points]
                  .reverse()
                  .filter((p) => p.revenue > 0 || p.spend > 0)
                  .map((p) => (
                    <tr key={p.day}>
                      <Td className="whitespace-nowrap">{shortDay(p.day)}</Td>
                      <Td className="[font-variant-numeric:tabular-nums]">
                        {formatMoney(p.revenue)}
                      </Td>
                      <Td className="[font-variant-numeric:tabular-nums]">
                        {formatMoney(p.spend)}
                      </Td>
                      <Td className="[font-variant-numeric:tabular-nums]">
                        {formatMoney(p.revenue - p.spend)}
                      </Td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>
        </div>
      )}
    </Card>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-4">
      <LegendKey color="var(--series-revenue)" label="Revenue" />
      <LegendKey color="var(--series-spend)" label="Spend" />
    </div>
  );
}

function LegendKey({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-[6px] text-[12px] text-[var(--ink-400)]">
      <span className="h-[3px] w-[14px] rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function TooltipRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <p className="m-0 flex items-center gap-2 text-[12px] text-[var(--ink-500)]">
      <span className="h-[3px] w-[12px] rounded-full" style={{ background: color }} />
      {label}
      <span className="ml-auto pl-3 font-semibold text-[var(--ink-800)] [font-variant-numeric:tabular-nums]">
        {formatMoney(value)}
      </span>
    </p>
  );
}
