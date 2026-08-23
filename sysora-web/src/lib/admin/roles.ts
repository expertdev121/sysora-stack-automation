import type { StaffRole } from "./types";

/**
 * Three roles, in increasing order of reach:
 *
 *   admin    the pipeline — requests, contacts, questions, settings.
 *            Sees no company finances at all.
 *   manager  everything an admin sees, plus revenue, payments and
 *            sales targets.
 *   owner    everything, including pricing and the team.
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
