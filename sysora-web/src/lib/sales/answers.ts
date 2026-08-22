/**
 * Answer handling shared by the browser and the server.
 *
 * The client uses this for instant feedback; the server runs the exact
 * same checks before writing, because client-side validation is a
 * courtesy, not a control.
 */

import type { QuestionType, SurveyQuestion, VisibleIf } from "./types";

export type AnswerMap = Record<string, unknown>;

/** Whether a conditional question should be shown, given the answers so far. */
export function isVisible(question: SurveyQuestion, answers: AnswerMap): boolean {
  const rule = question.visible_if as VisibleIf | null;
  if (!rule?.question_key) return true;

  const actual = answers[rule.question_key];

  switch (rule.op) {
    case "answered":
      return !isEmpty(actual);
    case "eq":
      return actual === rule.value;
    case "neq":
      return actual !== rule.value;
    case "in":
      return Array.isArray(rule.value) && rule.value.includes(actual as never);
    case "not_in":
      return Array.isArray(rule.value) && !rule.value.includes(actual as never);
    default:
      return true;
  }
}

/** `false` and `0` count as answers; null, undefined, "" and [] do not. */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_LIKE = /^https?:\/\/\S+$/i;

/**
 * Validates one answer. Returns an error message, or null when it's fine.
 * Invisible questions are never required.
 */
export function validateAnswer(question: SurveyQuestion, value: unknown): string | null {
  const empty = isEmpty(value);

  if (question.is_required && empty) return "This one's required.";
  if (empty) return null;

  const v = question.validation ?? {};

  switch (question.type) {
    case "email":
      if (typeof value !== "string" || !EMAIL.test(value.trim())) {
        return "That doesn't look like an email address.";
      }
      break;

    case "url":
      if (typeof value !== "string" || !URL_LIKE.test(value.trim())) {
        return "Include the full address, starting with https://";
      }
      break;

    case "phone":
      if (typeof value !== "string" || value.replace(/\D/g, "").length < 7) {
        return "That doesn't look like a phone number.";
      }
      break;

    case "number":
    case "scale": {
      const n = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(n)) return "Numbers only.";
      if (v.min !== undefined && n < v.min) return `Must be at least ${v.min}.`;
      if (v.max !== undefined && n > v.max) return `Must be no more than ${v.max}.`;
      break;
    }

    case "single_select":
      if (!question.options.some((o) => o.value === value)) return "Pick one of the options.";
      break;

    case "multi_select": {
      if (!Array.isArray(value)) return "Pick from the options.";
      const allowed = new Set(question.options.map((o) => o.value));
      if (!value.every((item) => allowed.has(String(item)))) return "Pick from the options.";
      break;
    }

    case "date":
      if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
        return "That isn't a valid date.";
      }
      break;

    case "short_text":
    case "long_text": {
      const s = String(value);
      if (v.minLength !== undefined && s.length < v.minLength) {
        return `At least ${v.minLength} characters, please.`;
      }
      if (v.maxLength !== undefined && s.length > v.maxLength) {
        return `Keep it under ${v.maxLength} characters.`;
      }
      if (v.pattern) {
        try {
          if (!new RegExp(v.pattern).test(s)) return "That format isn't quite right.";
        } catch {
          // A malformed pattern in the database shouldn't block a submission.
        }
      }
      break;
    }

    default:
      break;
  }

  return null;
}

/** Validates a whole survey. Returns per-question messages, keyed by question_key. */
export function validateSurvey(
  questions: SurveyQuestion[],
  answers: AnswerMap,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const question of questions) {
    if (!isVisible(question, answers)) continue;
    const message = validateAnswer(question, answers[question.question_key]);
    if (message) errors[question.question_key] = message;
  }

  return errors;
}

/** Flattens an answer to searchable text for the dashboard and CSV exports. */
export function answerToText(type: QuestionType, value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (type === "date" && typeof value === "string") return value;
  return String(value);
}

/** Empty starting value for a question, so inputs stay controlled. */
export function emptyValue(type: QuestionType): unknown {
  switch (type) {
    case "multi_select":
      return [];
    case "boolean":
      return null;
    case "number":
    case "scale":
      return "";
    default:
      return "";
  }
}
