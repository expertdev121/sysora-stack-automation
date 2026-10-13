import { CheckIcon } from "@/components/ui/Icon";
import { support } from "@/content/landing/sales";

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-300)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="flex-none mt-[2px]" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function Support() {
  return (
    <section
      className="px-6 py-[clamp(78px,10vh,120px)] bg-[var(--mint-50)] border-y-[1.5px] border-[var(--border-faint)]"
    >
      <div className="max-w-[1160px] mx-auto">
        <div className="max-w-[760px]">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--accent-strong)]">
            {support.eyebrow}
          </span>
          <h2 className="mt-[14px] text-[clamp(30px,3.6vw,44px)] font-black tracking-[-1.1px] leading-[1.1] text-[var(--ink-900)]">
            {support.headline}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-11 items-stretch to-860:grid-cols-1">
          <div className="p-8 rounded-[18px] bg-[var(--surface-0)] border-[1.5px] border-[var(--mint-300)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,200,150,0.10)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[19px] font-bold text-[var(--ink-900)]">
                {support.included.title}
              </h3>
              <span className="px-[11px] py-[5px] rounded-full bg-[var(--accent)] font-mono text-[11px] font-semibold text-white">
                {support.included.badge}
              </span>
            </div>
            <p className="mt-2 text-[14px] text-[var(--ink-500)]">{support.included.lead}</p>
            <ul className="list-none mt-[22px] p-0 flex flex-col gap-[14px]">
              {support.included.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[15.5px] leading-[1.6] text-[var(--ink-700)]"
                >
                  <CheckIcon
                    size={18}
                    strokeWidth={2.4}
                    className="flex-none mt-[2px] text-[var(--accent)]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8 rounded-[18px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_6px_rgba(0,80,50,0.05),0_18px_40px_rgba(0,80,50,0.07)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[19px] font-bold text-[var(--ink-900)]">
                {support.billed.title}
              </h3>
              <span className="px-[11px] py-[5px] rounded-full bg-[var(--surface-2)] border-[1.5px] border-[var(--line-slate)] font-mono text-[11px] font-semibold text-[var(--ink-600)]">
                {support.billed.badge}
              </span>
            </div>
            <p className="mt-2 text-[14px] text-[var(--ink-500)]">{support.billed.lead}</p>
            <ul className="list-none mt-[22px] p-0 flex flex-col gap-[14px]">
              {support.billed.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[15.5px] leading-[1.6] text-[var(--ink-700)]"
                >
                  <ClockIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 mt-5">
          <p className="px-[22px] py-[18px] rounded-[14px] bg-[var(--surface-0)] border-[1.5px] border-dashed border-[var(--line-slate)] text-[14.5px] leading-[1.65] text-[var(--ink-600)]">
            <strong className="text-[var(--ink-900)]">{support.notPromisedTitle}</strong>
            {support.notPromisedBody}
          </p>
          <p className="px-[22px] py-[18px] rounded-[14px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-faint)] text-[14.5px] leading-[1.65] text-[var(--ink-600)]">
            {support.teamNote}
          </p>
        </div>
      </div>
    </section>
  );
}
