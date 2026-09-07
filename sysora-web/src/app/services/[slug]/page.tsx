import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { routes } from "@/config/site";
import {
  getPublishedService,
  paragraphs,
  priceLabel,
} from "@/lib/sales/services";

export const dynamic = "force-dynamic";

/**
 * One service, written to be read by a person and parsed by a machine.
 *
 * The structured data is not decoration. A page like this gets found
 * three ways — a search result, an AI answer quoting the FAQ, and a
 * direct link — and only the first cares about the prose alone. So the
 * questions are emitted as FAQPage nodes and the service as a Service
 * node, both built from the same rows the page renders. There is no
 * second copy of the content to drift out of sync.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = await getPublishedService(slug);
  if (!found) return { title: "Not found" };

  const { service } = found;
  const description = service.seo_description ?? service.summary ?? undefined;

  return {
    title: service.seo_title ?? service.name,
    description,
    keywords: service.keywords.length > 0 ? service.keywords : undefined,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: service.seo_title ?? service.name,
      description,
      type: "website",
      url: `/services/${service.slug}`,
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = await getPublishedService(slug);
  if (!found) notFound();

  const { service, faqs } = found;
  const body = paragraphs(service.body);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.name,
        description: service.summary ?? undefined,
        serviceType: service.name,
        provider: { "@type": "Organization", name: "Sysora", url: "https://sysora.com" },
        url: `https://sysora.com/services/${service.slug}`,
        ...(service.price_amount !== null
          ? {
              offers: {
                "@type": "Offer",
                price: (service.price_amount / 100).toFixed(2),
                priceCurrency: service.currency || "USD",
                availability: "https://schema.org/InStock",
              },
            }
          : {}),
      },
      ...(faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            },
          ]
        : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Services", item: "https://sysora.com/services" },
          {
            "@type": "ListItem",
            position: 2,
            name: service.name,
            item: `https://sysora.com/services/${service.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Built from the same rows the page renders, so it cannot drift.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageShell
        eyebrow="Services"
        title={service.name}
        lead={service.tagline ?? service.summary ?? undefined}
      >
        {service.highlights.length > 0 && (
          <ul className="mt-0 mb-9 flex list-none flex-wrap gap-2.5 p-0">
            {service.highlights.map((h) => (
              <li
                key={h}
                className="rounded-full border-[1.5px] border-[var(--border-default)] bg-[var(--mint-50)] px-4 py-2 text-[13.5px] font-semibold text-[var(--ink-700)]"
              >
                {h}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-5 text-[17px] leading-[1.75] text-[var(--ink-600)]">
          {body.map((p) => (
            <p key={p.slice(0, 40)} className="m-0">
              {p}
            </p>
          ))}
        </div>

        {service.deliverables.length > 0 && (
          <section className="mt-11">
            <h2 className="m-0 mb-5 text-[26px] font-extrabold tracking-[-0.5px] text-[var(--ink-900)]">
              What you get
            </h2>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {service.deliverables.map((d) => (
                <li key={d} className="flex gap-3 text-[16px] leading-[1.7] text-[var(--ink-600)]">
                  <span aria-hidden="true" className="mt-[9px] size-2 flex-none rounded-full bg-[var(--accent)]" />
                  {d}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-11 rounded-[18px] border-[1.5px] border-[var(--border-default)] bg-[var(--mint-50)] px-[30px] py-[26px]">
          <p className="m-0 text-[13px] font-mono uppercase tracking-[1.4px] text-[var(--ink-400)]">
            Price
          </p>
          <p className="mt-2 mb-0 text-[30px] font-extrabold tracking-[-0.8px] text-[var(--ink-900)]">
            {priceLabel(service)}
          </p>
          {service.price_note && (
            <p className="mt-2 mb-0 text-[14.5px] leading-[1.65] text-[var(--ink-600)]">
              {service.price_note}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" arrow href={routes.contact}>
              Start this service
            </Button>
            <Button size="lg" variant="ghost" href="/services">
              All services
            </Button>
          </div>
        </section>

        {faqs.length > 0 && (
          <section className="mt-12">
            <h2 className="m-0 mb-6 text-[26px] font-extrabold tracking-[-0.5px] text-[var(--ink-900)]">
              Questions
            </h2>
            <div className="flex flex-col gap-3">
              {faqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group rounded-[14px] border-[1.5px] border-[var(--border-default)] bg-white px-6 py-5"
                >
                  <summary className="cursor-pointer list-none text-[16.5px] font-bold leading-[1.5] text-[var(--ink-900)] marker:content-none">
                    {faq.question}
                  </summary>
                  <p className="mt-3 mb-0 text-[15.5px] leading-[1.75] text-[var(--ink-600)]">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        <p className="mt-10 mb-0 text-[15px] leading-[1.7] text-[var(--ink-500)]">
          Not quite what you need?{" "}
          <Link href={routes.contact} className="font-semibold text-[var(--accent-strong)]">
            Tell us what you are trying to fix
          </Link>{" "}
          and we will say honestly whether it is something we do.
        </p>
      </PageShell>
    </>
  );
}
