import type { Metadata } from "next";
import Script from "next/script";

import { SalesFooter } from "@/components/sales/SalesFooter";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { booking } from "@/content/landing/booking";
import { contactNav } from "@/content/landing/sales";

export const metadata: Metadata = {
  title: booking.meta.title,
  description: booking.meta.description,
  alternates: { canonical: "/book-a-call" },
  openGraph: {
    title: `${booking.meta.title} | Sysora Stack`,
    description: booking.meta.description,
    url: "/book-a-call",
  },
  twitter: {
    card: "summary_large_image",
    title: `${booking.meta.title} | Sysora Stack`,
    description: booking.meta.description,
  },
};

/**
 * The Book a call page, from the "Sysora Book a Call" design.
 *
 * The right-hand column is GoHighLevel's own booking widget rather than
 * a form of ours: the calendar, the free/busy and the confirmation mail
 * all live in GHL, so anything rebuilt here would be a second source of
 * truth for the same appointment.
 *
 * The widget is an iframe whose height changes as the visitor moves from
 * picking a day to picking a time. form_embed.js is GHL's resizer and
 * finds the frame by the id below, so the id and the script have to stay
 * together.
 */
export default function BookACallPage() {
  return (
    <div className="font-sans bg-[linear-gradient(180deg,var(--surface-0)_0,var(--mint-50)_100%)] text-[var(--ink-600)]">
      <SalesHeader anchorBase="/" items={contactNav} />

      <main className="mx-auto grid max-w-[1160px] grid-cols-[minmax(0,438px)_minmax(0,609px)] items-start gap-16 px-6 pb-[clamp(64px,9vh,96px)] pt-[clamp(36px,6vh,64px)] to-980:grid-cols-1 to-980:gap-10">
        <div className="flex flex-col gap-7">
          <div>
            <span className="inline-flex items-center gap-[9px] rounded-full border-[1.5px] border-[var(--border-default)] bg-white px-[14px] py-[7px] text-[12.5px] font-semibold text-[var(--text-body)]">
              <span className="h-[7px] w-[7px] rounded-full bg-[var(--accent)]" aria-hidden="true" />
              {booking.eyebrow}
            </span>

            <h1 className="mt-[18px] font-display text-[clamp(34px,4.6vw,56px)] font-black leading-[1.05] tracking-[-1.5px] text-[var(--ink-900)]">
              {booking.title}
            </h1>

            <p className="mt-[18px] max-w-[440px] text-[17px] leading-[1.75] text-[var(--ink-500)]">
              {booking.lead}
            </p>
          </div>

          <section className="rounded-[18px] border-[1.5px] border-[var(--border-default)] bg-white p-6 shadow-[0_18px_44px_rgba(0,80,50,0.08)]">
            <h2 className="text-[10.5px] font-semibold uppercase tracking-[1.4px] text-[var(--accent-strong)]">
              {booking.stepsLabel}
            </h2>

            <ol className="mt-4 flex flex-col gap-[14px]">
              {booking.steps.map((step) => (
                <li key={step.n} className="grid grid-cols-[auto_1fr] gap-[14px]">
                  <span className="text-[12px] font-semibold text-[var(--accent-strong)]">
                    {step.n}
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-[var(--ink-900)]">
                      {step.title}
                    </span>
                    <span className="mt-[2px] block text-[14px] leading-[1.6] text-[var(--ink-500)]">
                      {step.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <ul className="flex flex-wrap gap-[10px]">
            {booking.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border-[1.5px] border-[var(--border-faint)] bg-white px-[13px] py-[7px] text-[13px] text-[var(--ink-600)]"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <section className="overflow-hidden rounded-[22px] border-[1.5px] border-[var(--border-default)] bg-white shadow-[0_30px_70px_rgba(0,80,50,0.12)]">
          <header className="flex items-center gap-3 bg-[#FAFCFB] px-6 py-[18px]">
            <span
              className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[11px] border-[1.5px] border-[var(--border-default)] bg-[#F0FAF6]"
              aria-hidden="true"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-strong)"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </span>
            <span>
              <span className="block text-[15px] font-semibold text-[var(--ink-900)]">
                {booking.calendar.title}
              </span>
              <span className="block text-[13px] text-[var(--text-muted)]">
                {booking.calendar.meta}
              </span>
            </span>
          </header>

          {/* form_embed.js parks the frame at opacity:0, left:-9999px and
              only reveals it once the widget posts back that it is ready.
              That message never arrives for this calendar, so the booking
              UI loads and stays invisible. These rules win over the
              script's inline styles; it still sets height, so the frame
              keeps resizing between the month and time steps. */}
          <style>{`
            .ghl-booking iframe {
              position: static !important;
              left: auto !important;
              opacity: 1 !important;
              visibility: visible !important;
              pointer-events: auto !important;
            }
          `}</style>

          <div className="ghl-booking">
            <iframe
              src={booking.calendar.src}
              id={booking.calendar.embedId}
              title={booking.calendar.title}
              scrolling="no"
              className="block w-full min-h-[720px] border-0"
            />
          </div>
        </section>
      </main>

      {/* GoHighLevel's resizer. afterInteractive, not beforeInteractive:
          it looks for the iframe by id, so it has to run after paint. */}
      <Script src={booking.calendar.script} strategy="afterInteractive" />

      <SalesFooter anchorBase="/" />
    </div>
  );
}
