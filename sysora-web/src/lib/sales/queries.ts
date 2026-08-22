import "server-only";

import { salesDb } from "@/lib/supabase/admin";
import type {
  Offer,
  Payment,
  SalesRequest,
  SurveyKind,
  SurveyQuestion,
  SurveyWithQuestions,
} from "./types";

/** The offer behind a slug — 'systems-review', 'build-request', 'systems-team'. */
export async function getOffer(slug: string): Promise<Offer | null> {
  const { data, error } = await salesDb()
    .from("offers")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Could not load offer "${slug}": ${error.message}`);
  return data as Offer | null;
}

export async function listOffers(): Promise<Offer[]> {
  const { data, error } = await salesDb()
    .from("offers")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw new Error(`Could not load offers: ${error.message}`);
  return (data ?? []) as Offer[];
}

/**
 * The active survey for an offer at a given stage, with its questions in
 * order. Returns null when no survey is configured — callers should treat
 * that as "skip this step", not as an error.
 */
export async function getSurveyForOffer(
  offerId: string,
  kind: SurveyKind,
): Promise<SurveyWithQuestions | null> {
  const db = salesDb();

  const { data: survey, error } = await db
    .from("surveys")
    .select("*")
    .eq("offer_id", offerId)
    .eq("kind", kind)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Could not load ${kind} survey: ${error.message}`);
  if (!survey) return null;

  const { data: questions, error: qError } = await db
    .from("survey_questions")
    .select("*")
    .eq("survey_id", survey.id)
    .eq("is_active", true)
    .order("sort_order");

  if (qError) throw new Error(`Could not load survey questions: ${qError.message}`);

  return { ...(survey as SurveyWithQuestions), questions: (questions ?? []) as SurveyQuestion[] };
}

export async function getSurveyBySlug(slug: string): Promise<SurveyWithQuestions | null> {
  const db = salesDb();

  const { data: survey, error } = await db
    .from("surveys")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Could not load survey "${slug}": ${error.message}`);
  if (!survey) return null;

  const { data: questions, error: qError } = await db
    .from("survey_questions")
    .select("*")
    .eq("survey_id", survey.id)
    .eq("is_active", true)
    .order("sort_order");

  if (qError) throw new Error(`Could not load survey questions: ${qError.message}`);

  return { ...(survey as SurveyWithQuestions), questions: (questions ?? []) as SurveyQuestion[] };
}

/** A request by its human reference, e.g. SYS-000042. */
export async function getRequestByReference(reference: string): Promise<
  | (SalesRequest & {
      offer: Offer;
      customer: { id: string; email: string; full_name: string | null };
      payment: Payment | null;
    })
  | null
> {
  const db = salesDb();

  const { data, error } = await db
    .from("requests")
    .select(
      "*, offer:offers(*), customer:customers(id, email, full_name), payment:payments(*)",
    )
    .eq("reference", reference)
    .maybeSingle();

  if (error) throw new Error(`Could not load request ${reference}: ${error.message}`);
  if (!data) return null;

  const payments = (data.payment ?? []) as Payment[];
  // Prefer a successful payment; otherwise the most recent attempt.
  const payment =
    payments.find((p) => p.status === "succeeded") ??
    payments.sort((a, b) => (a.succeeded_at ?? "") < (b.succeeded_at ?? "") ? 1 : -1)[0] ??
    null;

  return { ...data, payment } as SalesRequest & {
    offer: Offer;
    customer: { id: string; email: string; full_name: string | null };
    payment: Payment | null;
  };
}

/** Public site settings — booking link, contact email, checkout copy. */
export async function getPublicSettings(): Promise<Record<string, unknown>> {
  const { data, error } = await salesDb()
    .from("settings")
    .select("key, value")
    .eq("is_public", true);

  if (error) throw new Error(`Could not load settings: ${error.message}`);

  return Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
}
