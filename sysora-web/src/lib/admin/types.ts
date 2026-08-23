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

/** A row of sales.target_progress — one target with its achieved figures. */
export type TargetRow = {
  id: string;
  name: string | null;
  starts_on: string;
  ends_on: string;
  revenue_target: number;
  requests_target: number | null;
  currency: string;
  notes: string | null;
  /** Money taken through the checkout inside the window. */
  revenue_stripe: number;
  /** Money recorded by hand inside the window. */
  revenue_manual: number;
  /** The two above, added. Cannot double-count: different tables. */
  revenue_achieved: number;
  revenue_remaining: number;
  percent_complete: number;
  days_total: number;
  days_elapsed: number;
  days_left: number | null;
  /** Days still available, today included. Never below 1 while open. */
  days_remaining: number;
  status: "upcoming" | "active" | "closed";
  manual_entries: number;
  requests_actual: number;
  /** Where a straight line would have us today, in minor units. */
  expected_by_today: number;
  /** Minor units per day needed to finish. */
  required_per_day: number;
  pace: Pace;
};

export type RevenueSource = "upwork" | "off_source" | "other";

export const SOURCE_LABELS: Record<RevenueSource, string> = {
  upwork: "Upwork",
  off_source: "Off source",
  other: "Other",
};

export type ManualRevenueRow = {
  id: string;
  client_name: string;
  source: RevenueSource;
  description: string | null;
  amount: number;
  currency: string;
  earned_on: string;
  created_by: string | null;
  created_at: string;
};

/** Revenue that falls outside every target window. */
export type UnattributedRevenue = {
  revenue_stripe: number;
  revenue_manual: number;
};

/* ---- Lead measures ------------------------------------------
 *
 * Revenue is the lag measure: by the time it moves, the week that
 * produced it is over. These are the things somebody can change on a
 * Tuesday morning, which is why they get their own scoreboard.
 */

export type ActivityType = {
  id: string;
  slug: string;
  label: string;
  question: string;
  sort_order: number;
  is_active: boolean;
};

/** A row of sales.activity_progress — one lead measure on one target. */
export type ActivityProgressRow = {
  activity_target_id: string;
  revenue_target_id: string;
  target_name: string | null;
  starts_on: string;
  ends_on: string;
  activity_type_id: string;
  slug: string;
  label: string;
  question: string;
  sort_order: number;
  type_is_active: boolean;
  target_count: number;
  achieved: number;
  contributors: number;
  days_total: number;
  days_elapsed: number;
  days_left: number | null;
  /** Days still available to work in, today included. Never below 1 while open. */
  days_remaining: number;
  status: "upcoming" | "active" | "closed";
  remaining: number;
  percent_complete: number;
  /** Where a team holding a straight line would be today. */
  expected_by_today: number;
  required_per_day: number;
  pace: Pace;
};

export type Pace = "done" | "on_track" | "at_risk" | "behind" | "upcoming" | "missed";

export const PACE_LABELS: Record<Pace, string> = {
  done: "Target met",
  on_track: "On track",
  at_risk: "At risk",
  behind: "Behind",
  upcoming: "Not started",
  missed: "Ended short",
};

export const PACE_TONE: Record<Pace, "mint" | "amber" | "slate" | "red"> = {
  done: "mint",
  on_track: "mint",
  at_risk: "amber",
  behind: "red",
  upcoming: "slate",
  missed: "slate",
};

/** One person's share of one lead measure. */
export type ActivityByUserRow = {
  revenue_target_id: string;
  activity_type_id: string;
  slug: string;
  label: string;
  user_id: string;
  full_name: string | null;
  email: string;
  role: StaffRole;
  achieved: number;
  days_reported: number;
  last_reported_on: string;
};

/** Activity on days no target covers. */
export type UnattributedActivity = {
  activity_type_id: string;
  slug: string;
  label: string;
  achieved: number;
  entries: number;
};

export type EodReportRow = {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  role: StaffRole;
  reported_on: string;
  notes: string | null;
  submitted_at: string;
  updated_at: string;
  total_count: number;
  entry_count: number;
};

/** What one report actually said, type by type. */
export type EodEntry = {
  activity_type_id: string;
  count: number;
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
