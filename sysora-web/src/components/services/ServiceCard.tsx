import Link from "next/link";

import { priceLabel } from "@/lib/sales/services";
import type { Service } from "@/lib/sales/types";

/**
 * The image slot, and what stands in for it before there is an image.
 *
 * Every service is designed to carry a screenshot and none of them have one
 * yet. A blank grey box would read as a broken image; naming what belongs
 * there turns the gap into a to-do that is obvious to whoever fills it, and
 * the same string becomes the alt text once a file is set.
 */
export function ServiceMedia({
  src,
  alt,
  className = "",
}: {
  src?: string | null;
  alt?: string | null;
  className?: string;
}) {
  if (src) {
    // Plain img: these are arbitrary uploads, not build-time assets, and
    // next/image would need every future host allow-listed in config.
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt ?? ""}
        className={`block w-full rounded-[12px] object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="presentation"
      className={`flex flex-col items-center justify-center gap-2 border-[1.5px] border-dashed border-[var(--border-default)] bg-[var(--surface-1)] p-6 text-center text-[var(--ink-300)] ${className}`}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5" />
      </svg>
      {alt && <span className="text-[11.5px] leading-[1.5]">{alt}</span>}
    </div>
  );
}

/** One service in the grid. The whole card is the link. */
export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col overflow-hidden rounded-[16px] border-[1.5px] border-[var(--border-default)] bg-white no-underline transition-colors duration-150 hover:border-[var(--accent)]"
    >
      <div className="relative bg-[var(--mint-50)] p-4">
        {service.category && (
          <span className="absolute top-3 left-3 z-10 rounded-full border-[1.5px] border-[var(--border-default)] bg-white px-2.5 py-[3px] font-mono text-[9px] font-bold uppercase tracking-[1.1px] text-[var(--ink-400)]">
            {service.category}
          </span>
        )}
        <ServiceMedia
          alt={service.image_alt}
          src={service.image_url}
          className="aspect-[16/10] rounded-[10px]"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="m-0 text-[17px] font-extrabold leading-[1.35] tracking-[-0.3px] text-[var(--ink-900)]">
          {service.name}
        </h3>
        {service.tagline && (
          <p className="mt-2 mb-0 text-[13.5px] font-semibold leading-[1.5] text-[var(--accent-strong)]">
            {service.tagline}
          </p>
        )}
        {service.summary && (
          <p className="mt-3 mb-0 text-[13.5px] leading-[1.65] text-[var(--ink-600)]">
            {service.summary}
          </p>
        )}

        {service.highlights.length > 0 && (
          <ul className="mt-4 mb-0 flex list-none flex-wrap gap-1.5 p-0">
            {service.highlights.slice(0, 3).map((h) => (
              <li
                key={h}
                className="rounded-full border-[1.5px] border-[var(--border-faint)] px-2.5 py-[3px] text-[11px] text-[var(--ink-500)]"
              >
                {h}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-6">
          <div>
            <p className="m-0 font-mono text-[9px] uppercase tracking-[1.2px] text-[var(--ink-300)]">
              {service.price_label}
            </p>
            <p className="mt-1 mb-0 font-mono text-[19px] font-bold tracking-[-0.6px] text-[var(--ink-900)]">
              {priceLabel(service)}
            </p>
          </div>
          <span className="text-[13px] font-semibold text-[var(--accent-strong)] group-hover:underline">
            Get a quote →
          </span>
        </div>
      </div>
    </Link>
  );
}
