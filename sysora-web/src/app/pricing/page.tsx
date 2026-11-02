import { ContentShell, FaqList, PageCta, RelatedLinks } from "@/components/content/ContentShell";
import { Inline } from "@/components/content/Inline";
import { Button } from "@/components/ui/Button";
import { PAGES_UPDATED, pricingPage as page } from "@/content/pages";
import { faq, packs } from "@/content/landing/sales";
import { pageGraph, pricingExtra } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const PATH = "/pricing";

export const metadata = pageMetadata({
  title: page.meta.title,
  description: page.meta.description,
  path: PATH,
});

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

const H2 =
  "mt-11 font-display text-[clamp(22px,2.6vw,28px)] font-bold tracking-[-0.6px] text-[var(--ink-900)]";

/** The questions from the homepage FAQ that are about price and hours. */
const PRICE_QUESTIONS = [
  "Why is the rate so much lower at 150 hours?",
  "How is time rounded?",
  "Do my hours roll over?",
  "What if my project is too big for a package?",
];

export default function PricingPage() {
  const crumbs = [{ name: "Pricing", path: PATH }];
  const items = faq.items.filter((item) => PRICE_QUESTIONS.includes(item.q));

  return (
    <ContentShell
      graph={pageGraph({
        path: PATH,
        name: `${page.meta.title} | Sysora Stack`,
        description: page.meta.description,
        crumbs,
        faq: items,
        extra: pricingExtra(),
      })}
      trail={crumbs}
      eyebrow={page.eyebrow}
      title={page.title}
      answer={page.answer}
      updated={PAGES_UPDATED}
    >
      <div className="relative mt-9 overflow-x-auto rounded-[14px] border-[1.5px] border-[var(--border-default)]">
        <table className="w-full min-w-[440px] border-collapse bg-white text-left text-[15px]">
          <caption className="sr-only">{page.tableCaption}</caption>
          <thead>
            <tr className="bg-[var(--mint-50)]">
              {["Hours", "Price", "Rate per hour", ""].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="border-b-[1.5px] border-[var(--border-default)] px-4 py-3 font-semibold text-[var(--ink-900)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {packs.map((pack) => (
              <tr key={pack.hours} className="border-t-[1.5px] border-[var(--border-faint)]">
                <td className="px-4 py-3 font-semibold text-[var(--ink-900)]">{pack.hours}</td>
                <td className="px-4 py-3 text-[var(--ink-700)]">{money(pack.price)}</td>
                <td className="px-4 py-3 text-[var(--ink-700)]">${pack.rate}</td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/checkout/hours?hours=${pack.hours}&billing=once`}
                    className="text-[14px] font-semibold text-[var(--accent-strong)] underline underline-offset-[3px]"
                  >
                    Buy<span className="sr-only"> {pack.hours} hours</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/#calculator" variant="ghost">
          {page.calculatorCta}
        </Button>
        <Button href="/request-estimate" variant="ghost">
          {page.estimateCta}
        </Button>
      </div>

      <h2 className={H2}>{page.rulesTitle}</h2>
      <ul className="mt-4 flex flex-col gap-[10px]">
        {page.rules.map((rule) => (
          <li key={rule} className="relative pl-5 text-[16px] leading-[1.7]">
            <span
              aria-hidden="true"
              className="absolute left-0 top-[11px] h-[6px] w-[6px] rounded-full bg-[var(--accent)]"
            />
            {rule}
          </li>
        ))}
      </ul>

      <h2 className={H2}>{page.refundTitle}</h2>
      <p className="mt-4 text-[16px] leading-[1.75]">
        <Inline text={page.refundBody} />
      </p>

      <h2 className={H2}>{page.cancelTitle}</h2>
      <p className="mt-4 text-[16px] leading-[1.75]">{page.cancelBody}</p>

      <h2 className={H2}>{page.costsTitle}</h2>
      <p className="mt-4 text-[16px] leading-[1.75]">
        <Inline text={page.costsBody} />
      </p>

      <FaqList items={items} />
      <RelatedLinks
        paths={["/guides/gohighlevel-setup-cost", "/guides/gohighlevel-vs-in-house-hire", "/services"]}
      />
      <PageCta />
    </ContentShell>
  );
}
