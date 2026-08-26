import type { Currency } from "@/lib/money";

/**
 * Shapes this app reads out of the `sales` schema.
 *
 * A trimmed relative of the marketing site's copy: the request
 * pipeline, contacts and survey types are deliberately absent, because
 * this app is about money and the work that produces it. Anything the
 * two apps genuinely share lives in the database, not in a type.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

export type StaffRole = "bde" | "admin" | "manager" | "owner";

export const ROLE_LABELS: Record<StaffRole, string> = {
  bde: "BDE",
  admin: "Admin",
  manager: "Manager",
  owner: "Owner",
};

export const ROLE_HINTS: Record<StaffRole, string> = {
  bde: "Files a daily report. Sees only their own activity targets.",
  admin: "Runs the pipeline on the website. No revenue.",
  manager: "Revenue, targets, spend and the whole team's activity.",
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

/* ---- Targets ------------------------------------------------ */

export type TargetLevel = "annual" | "sprint";

/** A row of sales.target_progress. Amounts are in `currency`, never converted. */
export type TargetRow = {
  id: string;
  name: string | null;
  level: TargetLevel;
  starts_on: string;
  ends_on: string;
  revenue_target: number;
  requests_target: number | null;
  currency: Currency;
  notes: string | null;
  is_locked: boolean;
  /** Rows inside the window with no figure in this target's currency. */
  unconverted_rows: number;
  /** What those rows are worth in the currency they do have. */
  unconverted_usd: number;
  revenue_stripe: number;
  revenue_manual: number;
  revenue_achieved: number;
  revenue_remaining: number;
  percent_complete: number;
  days_total: number;
  days_elapsed: number;
  days_left: number | null;
  days_remaining: number;
  status: "upcoming" | "active" | "closed";
  manual_entries: number;
  requests_actual: number;
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

/* ---- Revenue ------------------------------------------------ */

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
  /** Cents. Null when the money was never in dollars. */
  amount_usd: number | null;
  /** Paise. What actually landed — this is what an INR target counts. */
  amount_inr: number | null;
  currency: string;
  earned_on: string;
  created_by: string | null;
  created_at: string;
};

/** A row of sales.revenue_ledger — every payment, whichever door it came through. */
export type RevenueLedgerRow = {
  id: string;
  stream: "checkout" | "manual";
  source_key: string;
  source_label: string;
  client: string | null;
  amount_usd: number | null;
  amount_inr: number | null;
  settled_on: string | null;
  earned_on: string;
  created_at: string;
};

export type UnattributedRevenue = {
  revenue_stripe: number;
  revenue_manual: number;
};

/* ---- Spend -------------------------------------------------- */

export type SpendCategory = {
  id: string;
  slug: string;
  label: string;
  is_acquisition: boolean;
  sort_order: number;
  is_active: boolean;
};

/** A row of sales.expense_ledger. */
export type ExpenseRow = {
  id: string;
  spent_on: string;
  amount_usd: number | null;
  amount_inr: number | null;
  description: string | null;
  /** Who was paid. Used for salaries, so one hire is one line. */
  paid_to: string | null;
  category_key: string;
  category_label: string;
  is_acquisition: boolean;
  activity_type_id: string | null;
  activity_label: string | null;
  created_by: string | null;
  created_at: string;
};

/** A row of sales.target_economics — revenue against what it cost. */
export type TargetEconomics = {
  revenue_target_id: string;
  name: string | null;
  level: TargetLevel;
  starts_on: string;
  ends_on: string;
  status: "upcoming" | "active" | "closed";
  currency: Currency;
  revenue_target: number;
  revenue_achieved: number;
  percent_complete: number;
  spend_total: number;
  spend_acquisition: number;
  spend_unconverted_rows: number;
  net: number;
  /** Null when nothing was spent — "4x" and "we spent nothing" differ. */
  return_multiple: number | null;
  paying_clients: number;
  cost_per_client: number | null;
  new_contacts: number;
  cost_per_contact: number | null;
};

/** A row of sales.activity_economics — cost per bid, in other words. */
export type ActivityEconomics = {
  revenue_target_id: string;
  activity_type_id: string;
  label: string;
  target_count: number;
  achieved: number;
  spend_inr: number;
  spend_usd: number;
  cost_per_unit_inr: number | null;
};

/** A row of sales.daily_money — the trend line. */
export type DailyMoney = {
  day: string;
  revenue_checkout: number;
  revenue_manual: number;
  revenue: number;
  spend: number;
};

/* ---- Lead measures ------------------------------------------ */

export type ActivityType = {
  id: string;
  slug: string;
  label: string;
  question: string;
  sort_order: number;
  is_active: boolean;
};

/** A row of sales.activity_progress. */
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
  days_remaining: number;
  status: "upcoming" | "active" | "closed";
  remaining: number;
  percent_complete: number;
  expected_by_today: number;
  required_per_day: number;
  pace: Pace;
};

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
