import { CheckIcon } from "@/components/ui/Icon";
import { commandCenter } from "@/content/landing/command-center";
import { heroStats } from "@/content/landing/hero";
import { cn } from "@/lib/cn";

const cc = commandCenter;

const monoLabel =
  "font-mono text-[9.5px] tracking-[1.2px] uppercase text-white/[0.42]";

const panel =
  "px-[18px] py-4 rounded-[14px] bg-white/[0.04] border border-white/10 backdrop-blur-[8px]";

const toneColor = {
  running: "text-[var(--accent)]",
  completed: "text-white/55",
  monitoring: "text-[var(--mint-400)]",
} as const;

const toneDot = {
  running: "bg-[var(--accent)]",
  completed: "bg-white/55",
  monitoring: "bg-[var(--mint-400)]",
} as const;

function FlowCard({
  node,
  dotClass,
  delay,
}: {
  node: { name: string; event: string };
  dotClass: string;
  delay: string;
}) {
  return (
    <div className="flex flex-col gap-[3px] px-[11px] py-[9px] rounded-[10px] bg-white/[0.045] border border-white/[0.11]">
      <div className="flex items-center gap-[6px]">
        <span
          className={cn("cc-blink w-[5px] h-[5px] flex-none rounded-full", dotClass)}
          style={{ animationDelay: delay }}
        />
        <span className="text-[11px] font-bold text-white/[0.92]">{node.name}</span>
      </div>
      <span className="font-mono text-[8.5px] tracking-[0.2px] text-white/40">
        {node.event}
      </span>
    </div>
  );
}

function WorkflowChain({ label, steps }: { label: string; steps: readonly string[] }) {
  return (
    <div className="flex flex-col gap-[10px] min-w-0">
      <span className="font-mono text-[9.5px] tracking-[1.2px] uppercase text-white/40">
        {label}
      </span>
      <div className="flex items-center flex-wrap gap-2">
        {steps.map((step, i) => (
          <span key={step} className="inline-flex items-center gap-2 flex-none">
            <span className="px-3 py-[7px] rounded-lg bg-white/5 border border-white/[0.11] text-[11.5px] font-semibold text-white/[0.86]">
              {step}
            </span>
            {i < steps.length - 1 && (
              <span className="relative inline-block w-[30px] h-[1.5px] bg-white/[0.16] overflow-hidden">
                <span className="cc-sweep absolute top-0 bottom-0 left-0 right-auto w-[55%] bg-[linear-gradient(90deg,transparent,var(--accent))]" />
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CommandCenter() {
  return (
    <div className="hero-frame relative z-[2] max-w-[1208px] mx-auto mt-[-120px] to-700:mt-[-72px] px-6">
      <div className="relative rounded-[22px] border-[1.5px] border-[rgba(0,200,150,0.18)] bg-[linear-gradient(155deg,#07180F_0%,#0A2116_55%,#07180F_100%)] shadow-[0_34px_80px_rgba(0,40,25,0.45)] overflow-hidden">
        <div
          aria-hidden="true"
          className="rail-anim pointer-events-none absolute -top-[30%] -right-[10%] bottom-auto -left-[10%] h-[70%] bg-[radial-gradient(ellipse_40%_100%_at_50%_0%,rgba(0,200,150,0.16),transparent_70%)] animate-[heroDriftB_24s_ease_infinite_alternate]"
        />

        {/* Chrome */}
        <div className="relative flex items-center justify-between gap-4 px-5 py-[14px] border-b border-white/[0.08] bg-white/[0.02]">
          <span className="inline-flex items-center gap-[10px] font-mono text-[10.5px] tracking-[1.4px] uppercase text-white/60">
            <span className="text-[var(--accent)] font-semibold">{cc.chrome.brand}</span>{" "}
            {cc.chrome.label}
          </span>
          <span className="inline-flex items-center gap-2 px-[11px] py-[5px] rounded-full bg-[rgba(0,200,150,0.10)] border border-[rgba(0,200,150,0.28)] font-mono text-[10px] tracking-[1.2px] uppercase text-[var(--accent)]">
            <span className="cc-blink w-[6px] h-[6px] rounded-full bg-[var(--accent)]" />
            {cc.chrome.status}
          </span>
        </div>

        {/* Body */}
        <div className="relative grid gap-[14px] px-5 pt-[18px] pb-5 grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)_minmax(0,0.9fr)] to-980:grid-cols-2 to-640:grid-cols-1">
          {/* Left column */}
          <div className="flex flex-col gap-[14px] min-w-0">
            <div className={panel}>
              <p className={cn("m-0 mb-[10px]", monoLabel)}>{cc.health.label}</p>
              <p className="m-0 flex items-baseline gap-[7px]">
                <span className="font-mono text-[30px] font-semibold tracking-[-1px] leading-none text-white">
                  {cc.health.value}
                  <span className="text-[16px]">{cc.health.unit}</span>
                </span>
                <span className="text-[11px] text-[var(--accent)]">{cc.health.state}</span>
              </p>
              <p className="mt-[10px] mb-0 text-[11.5px] text-white/55">{cc.health.caption}</p>
              <div className="relative h-[4px] mt-[14px] rounded-[4px] bg-white/[0.09] overflow-hidden">
                <span
                  className="absolute top-0 bottom-0 left-0 right-auto rounded-[4px] bg-[linear-gradient(90deg,var(--mint-700),var(--accent))]"
                  style={{ width: cc.health.barWidth }}
                />
              </div>
              <div className="flex items-end justify-between gap-[3px] h-[34px] mt-[14px]">
                {cc.healthBars.map((h, i) => (
                  <span
                    key={i}
                    className="cc-bar flex-1 rounded-[2px] bg-[linear-gradient(180deg,var(--accent),rgba(0,200,150,0.25))]"
                    style={{ height: `${h}%`, animationDelay: `${(i * 0.16).toFixed(2)}s` }}
                  />
                ))}
              </div>
              <p className="mt-2 mb-0 flex items-center justify-between font-mono text-[9.5px] tracking-[0.6px] text-white/[0.38]">
                <span>{cc.health.eventsLabel}</span>
                <span className="text-[var(--accent)]">{cc.health.eventsValue}</span>
              </p>
            </div>

            <div className={panel}>
              <p className={cn("m-0 mb-[6px]", monoLabel)}>{cc.automationsLabel}</p>
              {cc.automations.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-[10px] py-[9px] border-b border-white/[0.06]"
                >
                  <span className="text-[12px] text-white/[0.82]">{row.label}</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-[6px] font-mono text-[9.5px] tracking-[0.6px] uppercase",
                      toneColor[row.tone],
                    )}
                  >
                    <span className={cn("w-[5px] h-[5px] rounded-full", toneDot[row.tone])} />
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Middle column */}
          <div className="relative flex flex-col min-w-0 p-4 rounded-[14px] bg-white/[0.025] border border-white/[0.09] to-980:col-span-full to-980:-order-1">
            <div className="flex items-center justify-between gap-[10px] mb-[14px]">
              <p className={cn("m-0", monoLabel)}>{cc.flow.label}</p>
              <span className="inline-flex items-center gap-[7px] font-mono text-[9px] tracking-[0.8px] uppercase text-[var(--accent)]">
                <span className="cc-blink w-[5px] h-[5px] rounded-full bg-[var(--accent)]" />
                {cc.flow.rate}
              </span>
            </div>

            <div className="relative min-h-[250px]">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute inset-0 w-full h-full"
              >
                <g stroke="rgba(255,255,255,0.13)" strokeWidth="0.3" fill="none">
                  <path d="M33.5 11 C38 11, 39 50, 43 50" />
                  <path d="M33.5 36.3 C38 36.3, 39 50, 43 50" />
                  <path d="M33.5 61.6 C38 61.6, 39 50, 43 50" />
                  <path d="M33.5 86.8 C38 86.8, 39 50, 43 50" />
                  <path d="M57 50 C61 50, 62 11, 66.5 11" />
                  <path d="M57 50 C61 50, 62 36.3, 66.5 36.3" />
                  <path d="M57 50 C61 50, 62 61.6, 66.5 61.6" />
                  <path d="M57 50 C61 50, 62 86.8, 66.5 86.8" />
                </g>
                <g
                  stroke="var(--accent)"
                  strokeWidth="0.7"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="2.5 26"
                >
                  <path className="cc-in" style={{ animationDelay: "0s" }} d="M33.5 11 C38 11, 39 50, 43 50" />
                  <path className="cc-in" style={{ animationDelay: "0.35s" }} d="M33.5 36.3 C38 36.3, 39 50, 43 50" />
                  <path className="cc-in" style={{ animationDelay: "0.7s" }} d="M33.5 61.6 C38 61.6, 39 50, 43 50" />
                  <path className="cc-in" style={{ animationDelay: "1.05s" }} d="M33.5 86.8 C38 86.8, 39 50, 43 50" />
                  <path className="cc-out" style={{ animationDelay: "0.2s" }} d="M57 50 C61 50, 62 11, 66.5 11" />
                  <path className="cc-out" style={{ animationDelay: "0.55s" }} d="M57 50 C61 50, 62 36.3, 66.5 36.3" />
                  <path className="cc-out" style={{ animationDelay: "0.9s" }} d="M57 50 C61 50, 62 61.6, 66.5 61.6" />
                  <path className="cc-out" style={{ animationDelay: "1.25s" }} d="M57 50 C61 50, 62 86.8, 66.5 86.8" />
                </g>
              </svg>

              <div className="relative grid gap-[10px] items-center grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)_minmax(0,1fr)] to-640:grid-cols-1">
                <div className="flex flex-col gap-2">
                  {cc.flow.inputs.map((node, i) => (
                    <FlowCard
                      key={node.name}
                      node={node}
                      dotClass="bg-[var(--mint-400)]"
                      delay={`${(i * 0.3).toFixed(2)}s`}
                    />
                  ))}
                </div>

                <div className="relative flex flex-col items-center justify-center gap-1 px-3 py-[18px] rounded-[14px] bg-[rgba(0,200,150,0.12)] border-[1.5px] border-[rgba(0,200,150,0.45)] shadow-[0_0_0_6px_rgba(0,200,150,0.06)] overflow-hidden">
                  <span
                    aria-hidden="true"
                    className="cc-orbit absolute w-[135%] aspect-square rounded-full border border-dashed border-[rgba(0,200,150,0.28)]"
                  />
                  <span className="cc-core w-[9px] h-[9px] rounded-full bg-[var(--accent)]" />
                  <span className="text-[11px] font-extrabold text-center leading-[1.2] text-white">
                    {cc.flow.core.title}
                    <br />
                    {cc.flow.core.subtitle}
                  </span>
                  <span className="font-mono text-[8.5px] tracking-[0.5px] text-[var(--accent)]">
                    {cc.flow.core.caption}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {cc.flow.outputs.map((node, i) => (
                    <FlowCard
                      key={node.name}
                      node={node}
                      dotClass="bg-[var(--accent)]"
                      delay={`${(i * 0.3).toFixed(2)}s`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2 mt-4">
              {cc.platforms.map((p) => (
                <div
                  key={p.name}
                  className="px-[11px] py-[9px] rounded-[10px] bg-white/[0.04] border border-white/10"
                >
                  <p className="m-0 text-[10.5px] font-bold text-white/[0.88]">{p.name}</p>
                  <p className="mt-[2px] mb-0 font-mono text-[8.5px] text-white/40">{p.detail}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-[14px] pt-3 border-t border-white/[0.08] overflow-hidden">
              <span className="flex-none font-mono text-[8.5px] tracking-[1px] uppercase text-white/[0.32]">
                {cc.ticker.label}
              </span>
              <div className="flex-1 flex gap-2 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
                <div className="cc-ticker flex gap-2 flex-none">
                  {[...cc.ticker.items, ...cc.ticker.items].map((item, i) => (
                    <span
                      key={i}
                      className="flex-none px-[10px] py-[5px] rounded-[6px] bg-white/[0.045] border border-white/10 font-mono text-[9px] text-white/60"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-[14px] min-w-0">
            <div className={panel}>
              <p className="m-0 mb-1 flex items-center justify-between gap-2">
                <span className={monoLabel}>{cc.activity.label}</span>
                <span className="cc-blink w-[6px] h-[6px] rounded-full bg-[var(--accent)]" />
              </p>
              {cc.activity.rows.map((row) => (
                <div key={row.label} className="flex items-start gap-[9px] py-2">
                  <span className="flex-none mt-[3px] text-[var(--accent)]">
                    <CheckIcon />
                  </span>
                  <span className="flex-1 text-[11.5px] leading-[1.45] text-white/[0.74]">
                    {row.label}
                  </span>
                  <span className="flex-none font-mono text-[9.5px] text-white/[0.34]">
                    {row.time}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-[9px] mt-[6px] px-[11px] py-[9px] rounded-[9px] bg-[rgba(0,200,150,0.08)] border border-[rgba(0,200,150,0.22)]">
                <span className="inline-flex gap-[3px]">
                  <span className="cc-dot3 w-[4px] h-[4px] rounded-full bg-[var(--accent)]" />
                  <span
                    className="cc-dot3 w-[4px] h-[4px] rounded-full bg-[var(--accent)]"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="cc-dot3 w-[4px] h-[4px] rounded-full bg-[var(--accent)]"
                    style={{ animationDelay: "0.4s" }}
                  />
                </span>
                <span className="flex-1 text-[11.5px] text-white/[0.78]">{cc.activity.queued}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[10px]">
              {cc.metrics.map((m) => (
                <div
                  key={m.label}
                  className="px-4 py-[14px] rounded-[14px] bg-white/[0.04] border border-white/10"
                >
                  <p className="m-0 font-mono text-[9.5px] tracking-[1px] uppercase text-white/[0.42]">
                    {m.label}
                  </p>
                  <p
                    className={cn(
                      "mt-2 mb-0 font-mono text-[20px] font-semibold",
                      m.accent ? "text-[var(--accent)]" : "text-white",
                    )}
                  >
                    {m.value}
                    <span className="text-[11px] text-white/45">{m.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Workflow footer */}
        <div className="relative flex flex-wrap gap-x-[28px] gap-y-[14px] px-5 pt-4 pb-5 border-t border-white/[0.08] bg-white/[0.02]">
          {cc.workflows.map((w) => (
            <WorkflowChain key={w.label} label={w.label} steps={w.steps} />
          ))}
        </div>
      </div>

      {/* Headline stats strip */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-0 mt-[44px] border-t-[1.5px] border-b-[1.5px] border-[var(--border-faint)]">
        {heroStats.map((stat, i) => (
          <div
            key={stat.label}
            className={cn(
              "px-[26px] py-6",
              i < heroStats.length - 1 && "border-r-[1.5px] border-[var(--border-faint)]",
            )}
          >
            <p
              className={cn(
                "m-0 font-mono text-[26px] font-semibold tracking-[-0.8px]",
                stat.accent ? "text-[var(--accent-strong)]" : "text-[var(--ink-900)]",
              )}
            >
              {stat.value}
            </p>
            <p className="mt-[6px] mb-0 text-[13px] text-[var(--text-muted)]">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
