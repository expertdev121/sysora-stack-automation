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

/** @deprecated Use WorkMetric — the catalogue moved to public.work_metrics. */
export type ActivityType = WorkMetric;

/** A row of sales.activity_progress. */
export type ActivityProgressRow = {
  /** What the number is measured in: count, connects. */
  unit: string;
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
  target_name: string | null;
  target_level: TargetLevel;
  unit: string;
  activity_type_id: string;
  slug: string;
  label: string;
  user_id: string;
  full_name: string | null;
  email: string;
  role: string;
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
  /** The profile that filed it — a person, not a login. */
  user_id: string;
  full_name: string | null;
  email: string;
  role: string;
  reported_on: string;
  notes: string | null;
  blockers: string | null;
  mood: number | null;
  source: string | null;
  submitted_at: string;
  updated_at: string;
  total_count: number;
  entry_count: number;
};

/* ---- The org: people and the work they report ---------------
 *
 * These live in the `public` schema, the EMS's home, and are read
 * across rather than copied. One person, one end-of-day report, one
 * catalogue of what is worth counting.
 */

export type ProfileRole = "owner" | "manager" | "employee" | "bde";

/**
 * A job title, not a dashboard permission.
 *
 * Capitalising the first letter turns "bde" into "Bde", which reads as a
 * name rather than an acronym — so the labels are written out.
 */
export const PROFILE_ROLE_LABELS: Record<ProfileRole, string> = {
  owner: "Owner",
  manager: "Manager",
  employee: "Employee",
  bde: "BDE",
};

export function profileRoleLabel(role: string): string {
  return PROFILE_ROLE_LABELS[role as ProfileRole] ?? role;
}

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

/* ---- Client acquisition ------------------------------------- */

/** A batch of connects bought, or a free membership grant. */
export type ConnectPurchase = {
  id: string;
  purchased_on: string;
  connects: number;
  /** Cents, before tax. Null for a free grant. */
  amount_usd: number | null;
  /** Cents. Kept apart from the amount because GST may be reclaimable. */
  tax_usd: number | null;
  /** Paise — what the card was actually charged, tax included. */
  amount_inr: number | null;
  is_free: boolean;
  note: string | null;
  created_at: string;
};

export type ProposalOutcome =
  | "sent"
  | "viewed"
  | "replied"
  | "interviewing"
  | "hired"
  | "declined"
  | "expired";

export const PROPOSAL_OUTCOME_LABELS: Record<ProposalOutcome, string> = {
  sent: "Sent",
  viewed: "Viewed",
  replied: "Replied",
  interviewing: "Interviewing",
  hired: "Won",
  declined: "Declined",
  expired: "Expired",
};

/** Mint only for a win. Everything else stays neutral — a decline is
 *  information, not an alarm, and two saturated hues in one table is noise. */
export const PROPOSAL_OUTCOME_TONE: Record<ProposalOutcome, "mint" | "amber" | "slate"> = {
  sent: "slate",
  viewed: "slate",
  replied: "slate",
  interviewing: "amber",
  hired: "mint",
  declined: "slate",
  expired: "slate",
};

/** One job bid on. The only place connect consumption is recorded. */
export type Proposal = {
  id: string;
  submitted_on: string;
  job_title: string;
  job_url: string | null;
  client_name: string | null;
  connects_spent: number;
  connects_refunded: number;
  outcome: ProposalOutcome;
  outcome_on: string | null;
  submitted_by: string | null;
  won_revenue_id: string | null;
  notes: string | null;
  created_at: string;
};

/** sales.connect_position — one row, always. */
export type ConnectPosition = {
  connects_acquired: number;
  connects_free: number;
  connects_bought: number;
  paid_inr: number;
  paid_usd: number;
  tax_usd: number;
  connects_spent: number;
  connects_refunded: number;
  proposals: number;
  connects_left: number;
  /** Paise per connect, blended across everything acquired. Null before any purchase. */
  rate_inr: number | null;
  rate_usd: number | null;
};

/** sales.acquisition_daily. */
export type AcquisitionDay = {
  day: string;
  proposals: number;
  connects_spent: number;
  connects_refunded: number;
  connects_cost_inr: number;
  won: number;
};

/** sales.acquisition_progress — budget against actual, per target window. */
export type AcquisitionProgress = {
  revenue_target_id: string;
  name: string | null;
  level: TargetLevel;
  starts_on: string;
  ends_on: string;
  currency: Currency;
  /** Paise. Always INR, whatever the revenue target is denominated in. */
  acquisition_budget: number | null;
  connects_cost_inr: number;
  connects_spent: number;
  proposals: number;
  proposals_won: number;
  other_acquisition_inr: number;
  other_rows_without_rupees: number;
  spent_inr: number;
  remaining_inr: number | null;
  percent_used: number | null;
  expected_by_today_inr: number | null;
  cost_per_win_inr: number | null;
  win_rate_percent: number | null;
};

/* ---- Recurring costs ---------------------------------------- */

export type BillingCadence = "monthly" | "quarterly" | "yearly";

export const CADENCE_LABELS: Record<BillingCadence, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

/** A standing commitment — a subscription, a retainer, anything that repeats. */
export type RecurringCost = {
  id: string;
  name: string;
  vendor: string | null;
  category_id: string | null;
  cadence: BillingCadence;
  /** Paise. What you expect to be charged. */
  amount_inr: number | null;
  /** Cents, for tools billed in dollars. Never converted into the rupees. */
  amount_usd: number | null;
  billing_day: number;
  started_on: string;
  /** Null while it is still running. */
  ended_on: string | null;
  notes: string | null;
  created_at: string;
};

/** One charge a recurring cost is due to make, in one month. */
export type RecurringCharge = {
  recurring_cost_id: string;
  name: string;
  vendor: string | null;
  category_id: string | null;
  cadence: BillingCadence;
  amount_inr: number | null;
  amount_usd: number | null;
  month: string;
  due_on: string;
};

/** sales.monthly_costs — committed against actually paid, per month. */
export type MonthlyCosts = {
  month: string;
  commitments_due: number;
  committed_inr: number;
  committed_usd: number;
  committed_without_rupees: number;
  commitments_paid: number;
  commitments_unpaid: number;
  expense_rows: number;
  spent_inr: number;
  spent_on_recurring_inr: number;
  spent_one_off_inr: number;
  spent_without_rupees: number;
};

/** sales.recurring_run_rate — one row, the smoothed monthly commitment. */
export type RunRate = {
  running: number;
  /** Paise a month, with yearly and quarterly plans spread rather than lumped. */
  monthly_inr: number;
  monthly_usd: number;
  without_rupees: number;
};
