import type { StaffRole } from "./types";

/**
 * Four roles, in increasing order of reach:
 *
 *   bde      files a daily report and watches the activity he is
 *            assigned to. No pipeline, no money, nothing else.
 *   admin    the pipeline — requests, contacts, questions, settings.
 *            Sees no company finances at all.
 *   manager  everything an admin sees, plus revenue, payments,
 *            targets and everyone's activity.
 *   owner    everything, including pricing, the team, and which
 *            activities exist.
 *
 * Read these as capabilities rather than checking `role === …` at call
 * sites, so widening a permission later is one edit here.
 *
 * They live apart from `auth.ts` because that module is server-only —
 * the sidebar needs the same answers in the browser, and a capability
 * question is pure arithmetic over a role either way. These decide what
 * to *render*; `requireFinance` and friends decide what to *serve*.
 */

export function canSeeFinances(role: StaffRole): boolean {
  return role === "manager" || role === "owner";
}

export function canManageTargets(role: StaffRole): boolean {
  return canSeeFinances(role);
}

export function canManagePricing(role: StaffRole): boolean {
  return role === "owner";
}

export function canManageTeam(role: StaffRole): boolean {
  return role === "owner";
}

/** Deleting a target destroys history for everyone, so it stops at owner. */
export function canDeleteTarget(role: StaffRole): boolean {
  return role === "owner";
}

/**
 * Which activities exist at all is a structural decision, like pricing:
 * owner only. Setting a number against one for a given period is
 * running the business, which a manager does.
 */
export function canManageActivityTypes(role: StaffRole): boolean {
  return role === "owner";
}

/** Everyone's activity, not just your own. */
export function canSeeAllActivity(role: StaffRole): boolean {
  return canSeeFinances(role);
}

/**
 * Filing or correcting someone else's day.
 *
 * A person may fix their own report for today and yesterday — see
 * eod-actions.ts. Anything older, or anyone else's, needs this.
 */
export function canEditAnyEod(role: StaffRole): boolean {
  return canSeeFinances(role);
}

