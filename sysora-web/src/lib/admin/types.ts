import type { OfferKind, PaymentStatus, RequestStatus, ResponseStatus } from "@/lib/sales/types";

export type StaffRole = "bde" | "admin" | "manager" | "owner";

export const ROLE_LABELS: Record<StaffRole, string> = {
  bde: "BDE",
  admin: "Admin",
  manager: "Manager",
  owner: "Owner",
};

/** Shown under the role name when someone is choosing one. */
export const ROLE_HINTS: Record<StaffRole, string> = {
  bde: "Files a daily report. Sees only their own activity targets.",
  admin: "Runs the pipeline. Sees no revenue.",
  manager: "Adds revenue, targets and the whole team's activity.",
  owner: "Everything, including pricing, the team and activity types.",
};

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

/* ---- Money and lead measures live in the sales app ----------
 *
 * Targets, revenue, spend, activity and the end-of-day report used to
 * have shapes here too. Two apps holding two definitions of "achieved"
 * is how two screens end up disagreeing, so this one gave them up: the
 * sales app owns those, the EMS owns the daily report, and this app
 * owns the pipeline.
 */

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

/* ---- The org: people and the work they report ---------------
 *
 * These live in the `public` schema, the EMS's home, and are read
 * across rather than copied. One person, one end-of-day report, one
 * catalogue of what is worth counting.
 */

export type ProfileRole = "owner" | "manager" | "employee" | "bde";

export type Profile = {
  id: string;
  org_id: string;
  full_name: string | null;
  email: string;
  role: ProfileRole;
  manager_id: string | null;
  is_active: boolean;
};

/** A row of public.work_metrics — a thing worth counting at day's end. */
export type WorkMetric = {
  id: string;
  slug: string;
  label: string;
  question: string;
  /** "count", "connects" — what the number is measured in. */
  unit: string;
  sort_order: number;
  is_active: boolean;
  /** Whether hitting this number moves a sales target. */
  feeds_sales: boolean;
};

/** One report, one metric, one number. */
export type EodMetric = {
  metric_id: string;
  quantity: number;
};
