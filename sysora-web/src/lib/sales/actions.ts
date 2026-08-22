"use server";

import { headers } from "next/headers";

import { salesDb } from "@/lib/supabase/admin";
import { answerToText, validateSurvey, type AnswerMap } from "./answers";
import { getOffer, getSurveyForOffer } from "./queries";
import type { SubmitResult, SurveyKind, SurveyQuestion } from "./types";

/** Attribution the browser collected, passed through with a submission. */
export type TrackingContext = {
  sessionId?: string;
  path?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

async function requestMeta() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return {
    ip: forwarded?.split(",")[0]?.trim() || null,
    user_agent: h.get("user-agent"),
  };
}

/**
 * Records a behavioural event. Never throws: a tracking failure must not
 * take a submission down with it.
 */
export async function track(
  name: string,
  props: Record<string, unknown> = {},
  context: TrackingContext = {},
): Promise<void> {
  try {
    const meta = await requestMeta();
    await salesDb()
      .from("events")
      .insert({
        name,
        session_id: context.sessionId ?? null,
        path: context.path ?? null,
        referrer: context.referrer ?? null,
        utm_source: context.utm_source ?? null,
        utm_medium: context.utm_medium ?? null,
        utm_campaign: context.utm_campaign ?? null,
        utm_term: context.utm_term ?? null,
        utm_content: context.utm_content ?? null,
        ip: meta.ip,
        user_agent: meta.user_agent,
        properties: props,
        customer_id: (props.customer_id as string) ?? null,
        request_id: (props.request_id as string) ?? null,
      });
  } catch (error) {
    console.error("[track] dropped event", name, error);
  }
}

/** Finds an existing customer by email, or creates one. Never overwrites first-touch attribution. */
async function upsertCustomer(
  email: string,
  fields: Record<string, unknown>,
  context: TrackingContext,
): Promise<string> {
  const db = salesDb();
  const normalized = email.trim().toLowerCase();

  const { data: existing } = await db
    .from("customers")
    .select("id")
    .eq("email_normalized", normalized)
    .maybeSingle();

  const writable = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== null && v !== undefined && v !== ""),
  );

  if (existing) {
    // Fill in blanks only — never clobber what we already know.
    if (Object.keys(writable).length > 0) {
      await db.from("customers").update(writable).eq("id", existing.id);
    }
    return existing.id;
  }

  const { data, error } = await db
    .from("customers")
    .insert({
      email: email.trim(),
      ...writable,
      utm_source: context.utm_source ?? null,
      utm_medium: context.utm_medium ?? null,
      utm_campaign: context.utm_campaign ?? null,
      utm_term: context.utm_term ?? null,
      utm_content: context.utm_content ?? null,
      referrer: context.referrer ?? null,
      landing_path: context.path ?? null,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Could not save your details: ${error.message}`);
  return data.id;
}

/** Writes a completed response and its answers. Returns the response id. */
async function saveResponse(
  survey: { id: string; version: number },
  questions: SurveyQuestion[],
  answers: AnswerMap,
  customerId: string | null,
  context: TrackingContext,
): Promise<string> {
  const db = salesDb();
  const meta = await requestMeta();

  const { data: response, error } = await db
    .from("survey_responses")
    .insert({
      survey_id: survey.id,
      survey_version: survey.version,
      customer_id: customerId,
      status: "completed",
      completed_at: new Date().toISOString(),
      session_id: context.sessionId ?? null,
      ip: meta.ip,
      user_agent: meta.user_agent,
      metadata: { path: context.path ?? null },
    })
    .select("id")
    .single();

  if (error) throw new Error(`Could not save your answers: ${error.message}`);

  // Unanswered optional questions simply have no row — `value` is jsonb
  // NOT NULL, and an absent answer is better modelled by an absent row.
  const rows = questions
    .filter((q) => {
      const v = answers[q.question_key];
      return v !== undefined && v !== null && v !== "";
    })
    .map((q) => ({
      response_id: response.id,
      question_id: q.id,
      question_key: q.question_key,
      question_label: q.label,
      question_type: q.type,
      value: answers[q.question_key],
      value_text: answerToText(q.type, answers[q.question_key]),
    }));

  if (rows.length > 0) {
    const { error: answerError } = await db.from("survey_answers").insert(rows);
    if (answerError) throw new Error(`Could not save your answers: ${answerError.message}`);
  }

  return response.id;
}

/** Pulls the columns a question maps onto sales.customers. */
function customerFieldsFrom(questions: SurveyQuestion[], answers: AnswerMap) {
  const fields: Record<string, unknown> = {};
  for (const q of questions) {
    if (!q.maps_to) continue;
    const value = answers[q.question_key];
    if (value !== undefined && value !== null && value !== "") fields[q.maps_to] = value;
  }
  return fields;
}

function emailFrom(questions: SurveyQuestion[], answers: AnswerMap): string | null {
  const emailQuestion =
    questions.find((q) => q.maps_to === "email") ?? questions.find((q) => q.type === "email");
  const value = emailQuestion ? answers[emailQuestion.question_key] : null;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Handles the first survey on any offer.
 *
 * Free offers land as a submitted request. Paid offers land as a request
 * awaiting payment, and the caller is sent to checkout.
 */
export async function submitIntakeSurvey(input: {
  offerSlug: string;
  kind: Extract<SurveyKind, "pre_checkout" | "build_request">;
  answers: AnswerMap;
  context?: TrackingContext;
}): Promise<SubmitResult> {
  const context = input.context ?? {};

  try {
    const offer = await getOffer(input.offerSlug);
    if (!offer) return { ok: false, error: "That offer isn't available right now." };

    const survey = await getSurveyForOffer(offer.id, input.kind);
    if (!survey) return { ok: false, error: "This form isn't set up yet. Please get in touch." };

    const fieldErrors = validateSurvey(survey.questions, input.answers);
    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, error: "Some answers need another look.", fieldErrors };
    }

    const email = emailFrom(survey.questions, input.answers);
    if (!email) return { ok: false, error: "We need an email address to reach you." };

    const customerId = await upsertCustomer(
      email,
      customerFieldsFrom(survey.questions, input.answers),
      context,
    );

    const responseId = await saveResponse(survey, survey.questions, input.answers, customerId, context);

    const db = salesDb();
    const { data: request, error } = await db
      .from("requests")
      .insert({
        customer_id: customerId,
        offer_id: offer.id,
        kind: offer.kind,
        status: offer.requires_payment ? "awaiting_payment" : "submitted",
        amount: offer.price_amount,
        currency: offer.currency,
        pre_response_id: responseId,
        title: offer.name,
        utm_source: context.utm_source ?? null,
        utm_medium: context.utm_medium ?? null,
        utm_campaign: context.utm_campaign ?? null,
        referrer: context.referrer ?? null,
      })
      .select("id, reference")
      .single();

    if (error) throw new Error(`Could not create your request: ${error.message}`);

    await db.from("survey_responses").update({ request_id: request.id }).eq("id", responseId);

    await track(
      offer.requires_payment ? "checkout.started" : "request.submitted",
      { customer_id: customerId, request_id: request.id, offer: offer.slug },
      context,
    );

    return {
      ok: true,
      reference: request.reference,
      requiresPayment: offer.requires_payment,
      redirectTo: offer.requires_payment
        ? `/checkout/${request.reference}`
        : `/request/${request.reference}`,
    };
  } catch (error) {
    console.error("[submitIntakeSurvey]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
    };
  }
}

/** The longer intake survey, filled in after a successful payment. */
export async function submitPostPaymentSurvey(input: {
  reference: string;
  answers: AnswerMap;
  context?: TrackingContext;
}): Promise<SubmitResult> {
  const context = input.context ?? {};

  try {
    const db = salesDb();

    const { data: request } = await db
      .from("requests")
      .select("id, reference, customer_id, offer_id, status, post_response_id")
      .eq("reference", input.reference)
      .maybeSingle();

    if (!request) return { ok: false, error: "We couldn't find that request." };
    if (request.post_response_id) {
      return { ok: true, reference: request.reference, requiresPayment: false, redirectTo: `/request/${request.reference}` };
    }

    const survey = await getSurveyForOffer(request.offer_id, "post_payment");
    if (!survey) return { ok: false, error: "This form isn't set up yet." };

    const fieldErrors = validateSurvey(survey.questions, input.answers);
    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, error: "Some answers need another look.", fieldErrors };
    }

    const responseId = await saveResponse(
      survey,
      survey.questions,
      input.answers,
      request.customer_id,
      context,
    );

    await db.from("survey_responses").update({ request_id: request.id }).eq("id", responseId);

    const customerFields = customerFieldsFrom(survey.questions, input.answers);
    if (Object.keys(customerFields).length > 0) {
      await db.from("customers").update(customerFields).eq("id", request.customer_id);
    }

    await db
      .from("requests")
      .update({ post_response_id: responseId, status: "in_review" })
      .eq("id", request.id);

    await track(
      "intake.completed",
      { customer_id: request.customer_id, request_id: request.id },
      context,
    );

    return {
      ok: true,
      reference: request.reference,
      requiresPayment: false,
      redirectTo: `/request/${request.reference}`,
    };
  } catch (error) {
    console.error("[submitPostPaymentSurvey]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
    };
  }
}
