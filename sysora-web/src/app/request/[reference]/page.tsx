import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { ConfigNotice } from "@/components/ui/ConfigNotice";
import { routes } from "@/config/site";
import { formatMoney } from "@/lib/money";
import { getPublicSettings, getRequestByReference } from "@/lib/sales/queries";
import { isDatabaseConfigured } from "@/lib/supabase/admin";
import type { RequestStatus } from "@/lib/sales/types";

export const metadata: Metadata = {
  title: "Your request",
  robots: { index: false, follow: false },
};

const statusCopy: Record<RequestStatus, { label: string; body: string }> = {
  draft: { label: "Draft", body: "This one hasn't been submitted yet." },
  submitted: {
    label: "Received",
    body: "We've got it. We read every request ourselves and come back with scope, timeline and investment.",
  },
  awaiting_payment: {
    label: "Awaiting payment",
    body: "Finish the payment step and we'll get started.",
  },
  paid: { label: "Paid", body: "Payment received. We're picking it up from here." },
  in_review: {
    label: "In review",
    body: "We're going through your answers now and will come back with what we'd fix first.",
  },
  scoped: { label: "Scoped", body: "We've mapped the work and are writing it up." },
  proposal_sent: { label: "Proposal sent", body: "Check your email — the proposal is with you." },
  accepted: { label: "Accepted", body: "Approved and queued. We'll be in touch with next steps." },
  declined: { label: "Closed", body: "This request was closed. Get in touch if that's not right." },
  cancelled: { label: "Cancelled", body: "This request was cancelled." },
  refunded: { label: "Refunded", body: "This payment was refunded." },
  completed: { label: "Completed", body: "This one is done. Thanks for working with us." },
};

export default async function RequestStatusPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;

  if (!isDatabaseConfigured()) {
    return (
      <PageShell eyebrow="Setup needed" title="Almost there.">
        <ConfigNotice missing="SUPABASE_SERVICE_ROLE_KEY" />
      </PageShell>
    );
  }

  const request = await getRequestByReference(reference);
  if (!request) notFound();

  const settings = await getPublicSettings();
  const bookingUrl =
    request.booking_url ?? (typeof settings.booking_url === "string" ? settings.booking_url : "");
  const contactEmail =
    typeof settings.contact_email === "string" ? settings.contact_email : "hello@sysora.com";

  const status = statusCopy[request.status] ?? statusCopy.submitted;

  return (
    <PageShell
      eyebrow={`Reference ${request.reference}`}
      title="Thanks — that's with us."
      lead={status.body}
    >
      <div className="rounded-[20px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-0)] overflow-hidden shadow-[0_2px_4px_rgba(0,80,50,0.04),0_20px_44px_rgba(0,80,50,0.07)]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-7 py-4 bg-[var(--surface-1)] border-b-[1.5px] border-[var(--border-faint)]">
          <span className="font-mono text-[10.5px] tracking-[1.2px] uppercase text-[var(--ink-200)]">
            {request.offer.name}
          </span>
          <span className="inline-flex items-center gap-[7px] text-[12.5px] font-semibold text-[var(--mint-700)]">
            <span className="w-[7px] h-[7px] rounded-full bg-[var(--accent)]" />
            {status.label}
          </span>
        </div>

        <dl className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-0 m-0">
          <Cell label="Reference" value={request.reference} mono />
          <Cell label="Submitted" value={new Date(request.submitted_at).toLocaleDateString()} />
          <Cell
            label="Amount"
            value={request.amount > 0 ? formatMoney(request.amount, request.currency) : "Free"}
            mono
          />
          <Cell label="Email" value={request.customer.email} />
        </dl>
      </div>

      <div className="flex flex-wrap gap-3 mt-8">
        {bookingUrl && (
          <Button size="lg" arrow href={bookingUrl}>
            Book a call
          </Button>
        )}
        <Button size="lg" variant="ghost" href={routes.home}>
          Back to home
        </Button>
      </div>

      <p className="mt-6 mb-0 text-[14px] text-[var(--ink-300)]">
        Questions? Reply to your confirmation email or write to{" "}
        <a href={`mailto:${contactEmail}`} className="font-semibold">
          {contactEmail}
        </a>
        .
      </p>
    </PageShell>
  );
}

function Cell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="px-7 py-5 border-r-[1.5px] border-b-[1.5px] border-[var(--border-faint)] last:border-r-0">
      <dt className="m-0 font-mono text-[10px] tracking-[1.4px] uppercase text-[var(--ink-200)]">
        {label}
      </dt>
      <dd
        className={`mt-[6px] mb-0 text-[15px] text-[var(--ink-800)] break-words ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
