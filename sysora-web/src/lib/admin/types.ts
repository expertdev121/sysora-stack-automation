import type { OfferKind, PaymentStatus, RequestStatus, ResponseStatus } from "@/lib/sales/types";

export type StaffRole = "admin" | "super_admin";

export type Staff = {
  id: string;
  role: StaffRole;
  full_name: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
};

/** A row of sales.request_overview — the dashboard's request list. */
export type RequestRow = {
  id: string;
  reference: string;
  kind: OfferKind;
  status: RequestStatus;
  amount: number;
  currency: string;
  title: string | null;
  submitted_at: string;
  paid_at: string | null;
  scheduled_call_at: string | null;
  assigned_to: string | null;
  created_at: string;
  customer_id: string;
  customer_email: string;
  customer_name: string | null;
  customer_company: string | null;
  offer_slug: string;
  offer_name: string;
  payment_status: PaymentStatus | null;
  payment_succeeded_at: string | null;
  pre_survey_status: ResponseStatus | null;
  post_survey_status: ResponseStatus | null;
};

export type ContactRow = {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  company_size: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string;
};

/** A row of sales.target_progress — target versus actual for one month. */
export type TargetRow = {
  period_start: string;
  revenue_target: number;
  requests_target: number | null;
  notes: string | null;
  revenue_actual: number;
  requests_actual: number;
  payments_actual: number;
};

export type AnswerRow = {
  question_key: string;
  question_label: string;
  question_type: string;
  value: unknown;
  value_text: string | null;
};

/** Every status a request can be moved to, in the order work actually flows. */
export const REQUEST_STATUSES: RequestStatus[] = [
  "submitted",
  "awaiting_payment",
  "paid",
  "in_review",
  "scoped",
  "proposal_sent",
  "accepted",
  "completed",
  "declined",
  "cancelled",
  "refunded",
];

export const STATUS_LABELS: Record<RequestStatus, string> = {
  draft: "Draft",
  submitted: "New",
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  in_review: "In review",
  scoped: "Scoped",
  proposal_sent: "Proposal sent",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
  refunded: "Refunded",
  completed: "Completed",
};

/** mint = good, amber = waiting on someone, slate = closed. */
export const STATUS_TONE: Record<RequestStatus, "mint" | "amber" | "slate" | "red"> = {
  draft: "slate",
  submitted: "amber",
  awaiting_payment: "amber",
  paid: "mint",
  in_review: "mint",
  scoped: "mint",
  proposal_sent: "amber",
  accepted: "mint",
  declined: "slate",
  cancelled: "slate",
  refunded: "red",
  completed: "mint",
};

export const KIND_LABELS: Record<OfferKind, string> = {
  build_request: "Build request",
  systems_review: "Systems review",
  systems_team: "Systems team",
};
