import { CrossMutedIcon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { math } from "@/content/landing/math";
import { cn } from "@/lib/cn";

/** The three-column grid, collapsing to a single column below 860px. */
const mathGrid =
  "grid grid-cols-[minmax(180px,0.85fr)_minmax(220px,1.1fr)_minmax(220px,1.1fr)] to-860:grid-cols-1 to-860:gap-2";

function TickIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function MathSection() {
  return (
    <section className="px-6 py-[clamp(104px,13vh,152px)] bg-[linear-gradient(165deg,#153826,#194430)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[740px]">
          <Eyebrow>{math.eyebrow}</Eyebrow>
          <h2 className="mt-0 mb-[22px] text-[clamp(34px,4.4vw,54px)] font-extrabold leading-[1.2] tracking-[-0.8px] text-white">
            {math.headline}
          </h2>
        </div>

        <div className="mt-12 rounded-[22px] border-[1.5px] border-white/[0.12] bg-white/[0.03] overflow-hidden">
          <div
            className={cn(mathGrid, "gap-0 px-[30px] py-[22px] border-b-[1.5px] border-white/10")}
          >
            <span />
            <span className="font-mono text-[12px] tracking-[1px] uppercase text-white/45">
              {math.columns.hire}
            </span>
            <span className="font-mono text-[12px] tracking-[1px] uppercase text-[var(--accent)]">
              {math.columns.sysora}
            </span>
          </div>

          {math.rows.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                mathGrid,
                "gap-4 px-[30px] py-[22px] items-start",
                i < math.rows.length - 1 && "border-b-[1.5px] border-white/[0.07]",
              )}
            >
              <span className="text-[15px] font-semibold text-white/[0.92]">{row.label}</span>
              <span className="flex gap-[10px] text-[15px] leading-[1.65] text-white/55">
                <CrossMutedIcon />
                <span>{row.hire}</span>
              </span>
              <span className="flex gap-[10px] text-[15px] leading-[1.65] text-white/90">
                <TickIcon />
                <span>{row.sysora}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-[18px] mt-5 px-[30px] py-[26px] rounded-[18px] border-[1.5px] border-[rgba(0,200,150,0.34)] bg-[rgba(0,200,150,0.09)]">
          <span className="font-mono text-[34px] font-semibold tracking-[-1px] leading-none text-[var(--accent)]">
            {math.callout.price}
          </span>
          <span className="flex-1 min-w-[260px] text-[15px] leading-[1.75] text-white/[0.82]">
            {math.callout.body}
          </span>
        </div>
      </div>
    </section>
  );
}
