import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { RequestControls } from "@/components/admin/RequestControls";
import { Card, CardHeader, EmptyState, Pill, StatusPill } from "@/components/admin/ui";
import { canSeeFinances, requirePipeline } from "@/lib/admin/auth";
import { KIND_LABELS, type AnswerRow, type RequestRow, type Staff } from "@/lib/admin/types";
import { formatMoney } from "@/lib/money";
import { salesDb } from "@/lib/supabase/admin";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reference: string }>;
}): Promise<Metadata> {
  const { reference } = await params;
  return { title: reference };
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const session = await requirePipeline();
  const seesFinances = canSeeFinances(session.role);
  const { reference } = await params;
  const db = salesDb();

  const { data: overview } = await db
    .from("request_overview")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();

  if (!overview) notFound();
  const request = overview as RequestRow;

  const [{ data: detail }, { data: staff }, { data: payments }] = await Promise.all([
    db
      .from("requests")
      .select("id, internal_notes, pre_response_id, post_response_id, booking_url, metadata")
      .eq("reference", reference)
      .maybeSingle(),
    db.from("users").select("id, full_name, email, role, is_active").eq("is_active", true),
    // Not fetched at all for an admin: finance data shouldn't reach a page
    // that isn't allowed to show it.
    seesFinances
      ? db
          .from("payments")
          .select("status, amount, currency, card_brand, card_last4, receipt_url, succeeded_at, provider")
          .eq("request_id", request.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const responseIds = [detail?.pre_response_id, detail?.post_response_id].filter(
    Boolean,
  ) as string[];

  const { data: answers } = responseIds.length
    ? await db
        .from("survey_answers")
        .select("response_id, question_key, question_label, question_type, value, value_text, answered_at")
        .in("response_id", responseIds)
        .order("answered_at")
    : { data: [] };

  const all = (answers ?? []) as (AnswerRow & { response_id: string })[];
  const preAnswers = all.filter((a) => a.response_id === detail?.pre_response_id);
  const postAnswers = all.filter((a) => a.response_id === detail?.post_response_id);

  const team = (staff ?? []) as Staff[];
  const paymentRows = (payments ?? []) as {
    status: string;
    amount: number;
    currency: string;
    card_brand: string | null;
    card_last4: string | null;
    receipt_url: string | null;
    succeeded_at: string | null;
    provider: string;
  }[];

  return (
    <AdminShell session={session}>
      <div className="mb-6">
        <Link href="/admin/requests" className="text-[13px] font-semibold text-[var(--ink-300)]">
          ← All requests
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="mt-0 mb-2 font-mono text-[11px] tracking-[1.6px] uppercase text-[var(--ink-200)]">
            {request.reference} · {KIND_LABELS[request.kind]}
          </p>
          <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.6px] text-[var(--ink-900)]">
            {request.customer_name ?? request.customer_email}
          </h1>
          <p className="mt-2 mb-0 text-[14px] text-[var(--ink-400)]">
            {request.customer_company ? `${request.customer_company} · ` : ""}
            <a href={`mailto:${request.customer_email}`}>{request.customer_email}</a>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={request.status} />
          {seesFinances && (
            <Pill tone={request.amount > 0 ? "mint" : "slate"}>
              {request.amount > 0 ? formatMoney(request.amount, request.currency) : "Free"}
            </Pill>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)] gap-6 items-start to-980:grid-cols-1">
        <div className="flex flex-col gap-6">
          <AnswerCard
            title="Before checkout"
            hint={request.pre_survey_status ?? "not started"}
            answers={preAnswers}
          />
          <AnswerCard
            title="After payment"
            hint={request.post_survey_status ?? "not started"}
            answers={postAnswers}
          />

          {seesFinances && (
          <Card>
            <CardHeader title="Payments" hint={`${paymentRows.length} attempt${paymentRows.length === 1 ? "" : "s"}`} />
            {paymentRows.length === 0 ? (
              <EmptyState>No payment attempts.</EmptyState>
            ) : (
              <ul className="m-0 p-0 list-none">
                {paymentRows.map((payment, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b-[1.5px] border-[var(--border-faint)] last:border-b-0"
                  >
                    <span className="flex items-center gap-3">
                      <Pill tone={payment.status === "succeeded" ? "mint" : payment.status === "cancelled" ? "slate" : "amber"}>
                        {payment.status.replace(/_/g, " ")}
                      </Pill>
                      <span className="font-mono text-[14px] text-[var(--ink-800)]">
                        {formatMoney(payment.amount, payment.currency)}
                      </span>
                      {payment.card_brand && (
                        <span className="text-[13px] text-[var(--ink-300)]">
                          {payment.card_brand} ····{payment.card_last4}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-4 text-[12.5px] text-[var(--ink-300)]">
                      {payment.succeeded_at && new Date(payment.succeeded_at).toLocaleString()}
                      {payment.receipt_url && (
                        <a href={payment.receipt_url} target="_blank" rel="noreferrer" className="font-semibold">
                          Receipt
                        </a>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          )}
        </div>

        <RequestControls
          reference={request.reference}
          status={request.status}
          assignedTo={request.assigned_to}
          notes={detail?.internal_notes ?? ""}
          team={team.map((member) => ({
            userId: member.id,
            name: member.full_name ?? member.email ?? "Someone",
          }))}
        />
      </div>
    </AdminShell>
  );
}

function AnswerCard({
  title,
  hint,
  answers,
}: {
  title: string;
  hint: string;
  answers: AnswerRow[];
}) {
  return (
    <Card>
      <CardHeader title={title} hint={hint} />
      {answers.length === 0 ? (
        <EmptyState>Not answered yet.</EmptyState>
      ) : (
        <dl className="m-0 p-0">
          {answers.map((answer) => (
            <div
              key={answer.question_key}
              className="px-6 py-4 border-b-[1.5px] border-[var(--border-faint)] last:border-b-0"
            >
              <dt className="m-0 text-[12.5px] font-semibold text-[var(--ink-300)]">
                {answer.question_label}
              </dt>
              <dd className="mt-[6px] mb-0 text-[15px] leading-[1.65] text-[var(--ink-700)] whitespace-pre-wrap">
                {formatAnswer(answer)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}

function formatAnswer(answer: AnswerRow): string {
  if (answer.value_text) return answer.value_text;
  if (Array.isArray(answer.value)) return answer.value.map(String).join(", ");
  if (typeof answer.value === "boolean") return answer.value ? "Yes" : "No";
  return String(answer.value ?? "—");
}
