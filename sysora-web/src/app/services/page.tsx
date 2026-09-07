import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";
import { listPublishedServices, priceLabel } from "@/lib/sales/services";

// Services are edited in the dashboard, so this is never baked.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description:
    "The things we do, one page each: what is involved, what it costs, and what happens if it does not work. Starting with A2P 10DLC verification for GoHighLevel.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const services = await listPublishedServices();

  return (
    <PageShell
      eyebrow="Services"
      title="What we do, one page at a time."
      lead="Each of these is a job with a defined start and end. Every page says what is involved, what it costs, and what happens if it does not work out."
    >
      {services.length === 0 ? (
        <p className="m-0 text-[17px] leading-[1.75] text-[var(--ink-600)]">
          Nothing is listed yet. If you know what you need,{" "}
          <Link href="/contact" className="font-semibold text-[var(--accent-strong)]">
            tell us
          </Link>{" "}
          and we will say whether it is something we do.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group flex flex-col rounded-[18px] border-[1.5px] border-[var(--border-default)] bg-white p-7 no-underline transition-colors duration-150 hover:border-[var(--accent)]"
            >
              <h2 className="m-0 text-[21px] font-extrabold leading-[1.3] tracking-[-0.4px] text-[var(--ink-900)]">
                {service.name}
              </h2>
              {service.tagline && (
                <p className="mt-2 mb-0 text-[15px] font-semibold leading-[1.55] text-[var(--accent-strong)]">
                  {service.tagline}
                </p>
              )}
              {service.summary && (
                <p className="mt-3 mb-0 text-[15px] leading-[1.7] text-[var(--ink-600)]">
                  {service.summary}
                </p>
              )}

              {service.highlights.length > 0 && (
                <ul className="mt-5 mb-0 flex list-none flex-wrap gap-2 p-0">
                  {service.highlights.slice(0, 3).map((h) => (
                    <li
                      key={h}
                      className="rounded-full border-[1.5px] border-[var(--border-default)] bg-[var(--mint-50)] px-3 py-[5px] text-[12px] font-semibold text-[var(--ink-700)]"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-6 mb-0 flex items-baseline gap-2 text-[15px] font-bold text-[var(--ink-900)]">
                {priceLabel(service)}
                <span className="text-[14px] font-semibold text-[var(--accent-strong)] group-hover:underline">
                  Read more →
                </span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
