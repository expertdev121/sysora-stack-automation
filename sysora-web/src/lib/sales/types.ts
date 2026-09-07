/**
 * Types mirroring the `sales` schema in Supabase.
 * Kept hand-written and small: only the columns the site actually reads.
 */

export type OfferKind = "build_request" | "systems_review" | "systems_team";
export type BillingInterval = "one_time" | "month" | "year";
export type SurveyKind = "pre_checkout" | "post_payment" | "build_request" | "custom";
export type ResponseStatus = "in_progress" | "completed" | "abandoned";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "url"
  | "number"
  | "single_select"
  | "multi_select"
  | "boolean"
  | "scale"
  | "date"
  | "file";

export type RequestStatus =
  | "draft"
  | "submitted"
  | "awaiting_payment"
  | "paid"
  | "in_review"
  | "scoped"
  | "proposal_sent"
  | "accepted"
  | "declined"
  | "cancelled"
  | "refunded"
  | "completed";

export type PaymentStatus =
  | "requires_payment_method"
  | "requires_action"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export type Offer = {
  id: string;
  slug: string;
  kind: OfferKind;
  name: string;
  tagline: string | null;
  description: string | null;
  /** Minor units — 4900 is $49.00. */
  price_amount: number;
  currency: string;
  billing_interval: BillingInterval;
  price_note: string | null;
  requires_payment: boolean;
  features: string[];
  is_active: boolean;
  sort_order: number;
};

export type QuestionOption = { value: string; label: string };

export type QuestionValidation = {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
};

/** `{ question_key: "has_crm", op: "eq", value: true }` */
export type VisibleIf = {
  question_key: string;
  op: "eq" | "neq" | "in" | "not_in" | "answered";
  value?: unknown;
};

export type SurveyQuestion = {
  id: string;
  survey_id: string;
  question_key: string;
  type: QuestionType;
  label: string;
  help_text: string | null;
  placeholder: string | null;
  is_required: boolean;
  sort_order: number;
  options: QuestionOption[];
  validation: QuestionValidation;
  visible_if: VisibleIf | null;
  maps_to: string | null;
  is_active: boolean;
};

export type Survey = {
  id: string;
  slug: string;
  kind: SurveyKind;
  offer_id: string | null;
  title: string;
  intro: string | null;
  outro: string | null;
  submit_label: string;
  version: number;
  is_active: boolean;
};

export type SurveyWithQuestions = Survey & { questions: SurveyQuestion[] };

export type SalesRequest = {
  id: string;
  reference: string;
  customer_id: string;
  offer_id: string;
  kind: OfferKind;
  status: RequestStatus;
  amount: number;
  currency: string;
  pre_response_id: string | null;
  post_response_id: string | null;
  title: string | null;
  booking_url: string | null;
  submitted_at: string;
  paid_at: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  request_id: string | null;
  customer_id: string;
  provider: string;
  provider_intent_id: string | null;
  status: PaymentStatus;
  amount: number;
  currency: string;
  card_brand: string | null;
  card_last4: string | null;
  receipt_url: string | null;
  succeeded_at: string | null;
};

/** One answer as the browser submits it, before it reaches the database. */
export type AnswerInput = {
  question_key: string;
  value: unknown;
};

export type SubmitResult =
  | { ok: true; reference: string; requiresPayment: boolean; redirectTo: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/* ---- Services ---------------------------------------------- */

/**
 * One row is one public /services/<slug> page.
 *
 * Distinct from Offer: an offer is a checkout path with a survey and a
 * Stripe price behind it, a service is a page describing something we do.
 * A service can link to an offer later; it does not need one to exist.
 */
export type Service = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  summary: string | null;
  /** Paragraphs separated by blank lines. */
  body: string | null;
  /** Minor units. Null means "get a quote", not free. */
  price_amount: number | null;
  currency: string;
  price_note: string | null;
  highlights: string[];
  deliverables: string[];
  seo_title: string | null;
  seo_description: string | null;
  keywords: string[];
  is_active: boolean;
  sort_order: number;
};

export type ServiceFaq = {
  id: string;
  service_id: string;
  question: string;
  answer: string;
  sort_order: number;
};
