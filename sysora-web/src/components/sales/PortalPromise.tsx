import { portalPromise } from "@/content/landing/sales";

/**
 * What the client portal gives you, stated on the sales page.
 *
 * Three cards, each with the mint rule across its top-left corner the
 * design uses to mark a card as one of a set. Icon paths are the
 * design's own rather than redrawn, so the stroke weight matches every
 * other icon on the page.
 */
const ICONS: Record<string, React.ReactNode> = {
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  send: (
    <>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
};

export function PortalPromise() {
  return (
    <section className="border-t-[1.5px] border-[var(--border-faint)] bg-[#FAFCFB] px-6 py-[120px] to-860:py-[80px]">
      <div className="mx-auto max-w-[1160px]">
        <p className="m-0 text-[11px] font-bold uppercase tracking-[2px] text-[var(--accent-strong)]">
          {portalPromise.eyebrow}
        </p>
        <h2 className="mt-3 max-w-[760px] font-display text-[clamp(30px,4vw,44px)] font-black leading-[1.1] tracking-[-1.2px] text-[var(--ink-900)]">
          {portalPromise.title}
        </h2>
        <p className="mt-[18px] max-w-[680px] text-[17px] leading-[1.75] text-[var(--ink-500)]">
          {portalPromise.lead}
        </p>

        <div className="mt-11 grid grid-cols-3 gap-5 to-980:grid-cols-1">
          {portalPromise.cards.map((card) => (
            <article
              key={card.title}
              className="relative overflow-hidden rounded-[18px] border-[1.5px] border-[var(--border-default)] bg-white p-[30px]"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-[4px] w-[60px] bg-[linear-gradient(90deg,#00C896,rgba(0,200,150,0))]"
              />
              <span
                aria-hidden="true"
                className="grid h-11 w-11 place-items-center rounded-[12px] border-[1.5px] border-[var(--border-default)] bg-[#F0FAF6]"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent-strong)"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {ICONS[card.icon]}
                </svg>
              </span>
              <h3 className="mt-5 text-[19px] font-bold text-[var(--ink-900)]">{card.title}</h3>
              <p className="mt-[10px] text-[15.5px] leading-[1.7] text-[var(--ink-600)]">
                {card.body}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-8 max-w-[820px] text-[16px] leading-[1.75] text-[var(--ink-600)]">
          {portalPromise.closing}
        </p>
      </div>
    </section>
  );
}
