import "server-only";

import { salesDb } from "@/lib/supabase/admin";

/**
 * Recording who changed what, and turning database errors into
 * sentences.
 *
 * Both started as private copies inside actions.ts and
 * revenue-actions.ts. A third copy was one file too many: the error
 * mapping in particular has to stay in step with the constraints, and
 * three places to update is three places to forget.
 */

/**
 * Records who changed what.
 *
 * Uses the service role because staff may read the audit log but must not
 * be able to write or doctor it — the only way a row appears is through
 * this function.
 *
 * A failure here is logged, never thrown: losing the audit row is bad,
 * but failing the operation the person actually asked for because we
 * couldn't write a note about it is worse.
 */
export async function audit(input: {
  actorId: string;
  actorEmail: string;
  action: string;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}) {
  try {
    await salesDb().from("audit_log").insert({
      actor_id: input.actorId,
      actor_email: input.actorEmail,
      action: input.action,
      entity: input.entity,
      entity_id: input.entityId,
      before: input.before ?? null,
      after: input.after ?? null,
    });
  } catch (error) {
    console.error("[audit] could not record", input.action, error);
  }
}

/** Turns a Postgres error into something worth showing a person. */
export function friendly(error: { code?: string; message: string }): string {
  if (error.code === "23P01") {
    return "That overlaps an existing target. Targets can't share dates.";
  }

  if (error.code === "23505") {
    if (error.message.includes("eod_reports_one_per_day")) {
      return "That day already has a report. Open it and edit instead of filing a second one.";
    }
    if (error.message.includes("activity_types_slug_key")) {
      return "Another activity already uses that key.";
    }
    return "That already exists.";
  }

  if (error.code === "23503") {
    return "That refers to something which no longer exists. Reload and try again.";
  }

  if (error.code === "23514") {
    if (error.message.includes("dates_ordered")) return "The end date must be on or after the start date.";
    if (error.message.includes("amount_positive")) return "The target must be more than zero.";
    if (error.message.includes("client_name")) return "The client needs a name.";
    if (error.message.includes("currency")) return "Only USD amounts are supported.";
    if (error.message.includes("target_count")) return "An activity target must be more than zero.";
    if (error.message.includes("eod_entries_count")) return "A count can't be negative.";
    if (error.message.includes("slug_format")) {
      return "The key must start with a letter and use only lowercase letters, numbers and underscores.";
    }
    if (error.message.includes("label_present")) return "Give the activity a name.";
    if (error.message.includes("question_present")) return "Write the question the daily form should ask.";
    return "That doesn't pass one of the data rules.";
  }

  return error.message;
}
