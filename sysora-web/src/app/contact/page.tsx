import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/sales/ContactForm";
import { SalesFooter } from "@/components/sales/SalesFooter";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { contactNav } from "@/content/landing/sales";
import { contact } from "@/content/landing/contact";

export const metadata: Metadata = {
  title: contact.meta.title,
  description: contact.meta.description,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `${contact.meta.title} — Sysora Stack`,
    description: contact.meta.description,
    url: "/contact",
  },
};

/**
 * The contact page, from the Sysora Contact design.
 *
 * This replaced a placeholder that said the form "is being wired up" and
 * offered a mailto. The form now writes to sales.contact_messages and
 * links the sender to a customer row, so a message cannot be lost in
 * somebody's inbox.
 */
export default function ContactPage() {
  return (
    <div className="font-sans bg-[linear-gradient(180deg,var(--surface-0)_0,var(--surface-1)_420px)] text-[var(--ink-600)]">
      <SalesHeader anchorBase="/" items={contactNav} />

      <main className="mx-auto max-w-[1160px] px-6 pb-[88px] pt-[clamp(36px,6vh,64px)]">
        <header className="max-w-[720px]">
          <span className="text-[11px] font-bold uppercase tracking-[2px] text-[var(--accent-strong)]">
            {contact.eyebrow}
          </span>
          <h1 className="mt-[14px] font-display text-[clamp(32px,4.4vw,52px)] font-black leading-[1.08] tracking-[-1.2px] text-[var(--ink-900)]">
            {contact.title}
          </h1>
          <p className="mt-4 text-[17.5px] leading-[1.7] text-[var(--ink-600)]">{contact.lead}</p>
        </header>

        <div className="mt-10 grid grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] items-start gap-[clamp(28px,4vw,56px)] to-980:grid-cols-1">
          <ContactForm />

          <aside className="flex flex-col gap-5 to-980:mt-2">
            <div className="rounded-[18px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] p-7">
              <p className="text-[11px] font-bold uppercase tracking-[1.6px] text-[var(--ink-400)]">
                {contact.next.title}
              </p>
              <ol className="mt-4 flex flex-col gap-4">
                {contact.next.steps.map((step) => (
                  <li key={step.n} className="flex gap-3">
                    <span className="font-mono text-[12.5px] font-semibold text-[var(--accent-strong)]">
                      {step.n}
                    </span>
                    <span className="text-[14.5px] leading-[1.65] text-[var(--ink-600)]">
                      {step.text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {contact.cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex items-center justify-between gap-4 rounded-[18px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] px-6 py-5 transition-colors hover:border-[var(--accent)]"
              >
                <span className="font-display text-[20px] font-black tracking-[-0.5px] text-[var(--ink-900)]">
                  {card.badge}
                </span>
                <span className="text-[14px] font-semibold text-[var(--accent-strong)]">
                  {card.label}
                </span>
              </Link>
            ))}

            <ul className="flex flex-wrap gap-x-5 gap-y-2 px-1">
              {contact.badges.map((badge) => (
                <li
                  key={badge}
                  className="flex items-center gap-2 text-[13px] text-[var(--ink-500)]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {badge}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>

      <SalesFooter anchorBase="/" />
    </div>
  );
}
