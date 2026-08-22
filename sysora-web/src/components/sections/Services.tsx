import { ChartIcon, GearIcon, LedgerIcon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { services } from "@/content/landing/services";

const iconFor = {
  gear: GearIcon,
  ledger: LedgerIcon,
  chart: ChartIcon,
} as const;

function ListCheck() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function Services() {
  return (
    <section className="px-6 py-[clamp(104px,13vh,152px)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[740px]">
          <Eyebrow>{services.eyebrow}</Eyebrow>
          <h2 className="mt-0 mb-[22px] text-[clamp(34px,4.4vw,54px)] font-extrabold leading-[1.2] tracking-[-0.8px] text-[var(--ink-900)]">
            {services.headline}
          </h2>
          <p className="m-0 text-[19px] leading-[1.75] text-[var(--ink-600)]">{services.lead}</p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 mt-12 items-stretch">
          {services.groups.map((group) => {
            const GroupIcon = iconFor[group.icon];
            return (
              <div
                key={group.title}
                className="p-card flex flex-col p-8 rounded-[20px] bg-[var(--surface-0)] border-[1.5px] border-[var(--border-default)] shadow-[0_2px_4px_rgba(0,80,50,0.04),0_20px_44px_rgba(0,80,50,0.07)]"
              >
                <div className="flex items-center gap-[14px] pb-[22px] mb-[22px] border-b-[1.5px] border-[var(--border-faint)]">
                  <span className="inline-flex items-center justify-center w-[42px] h-[42px] flex-none rounded-xl bg-[var(--mint-50)] border-[1.5px] border-[var(--border-default)] text-[var(--accent-strong)]">
                    <GroupIcon size={20} />
                  </span>
                  <h3 className="m-0 text-[17px] font-bold tracking-[-0.3px] text-[var(--ink-900)]">
                    {group.title}
                  </h3>
                </div>
                <div className="flex flex-col gap-4">
                  {group.items.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="flex-none mt-[2px] text-[var(--accent-strong)]">
                        <ListCheck />
                      </span>
                      <span className="text-[15px] leading-[1.65] text-[var(--ink-600)]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
