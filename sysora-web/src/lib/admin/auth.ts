import "server-only";

import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import { canSeeAllActivity, canSeeFinances, canSeePipeline, homePathFor } from "./roles";
import type { StaffRole } from "./types";

export type StaffSession = {
  userId: string;
  email: string;
  role: StaffRole;
  fullName: string | null;
};

/**
 * Capability predicates live in ./roles so client components can ask the
 * same questions; re-exported here because the guards below are their
 * natural neighbours.
 */
export {
  canDeleteTarget,
  canEditAnyEod,
  canManageActivityTypes,
  canManagePricing,
  canManageTargets,
  canManageTeam,
  canSeeAllActivity,
  canSeeFinances,
  canSeePipeline,
  homePathFor,
} from "./roles";

/**
 * The gate on every dashboard page.
 *
 * Auth is ours, so this is the only thing standing between a request and
 * the data — the private tables have no RLS policy and are reached with
 * the service role. Every dashboard page must call it, and must call it
 * before reading anything.
 */
export async function requireStaff(): Promise<StaffSession> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  /**
   * A client has a session in the same table as staff, so "is signed in"
   * no longer means "works here". Without this line a portal login would
   * satisfy every capability predicate written as `role !== "bde"` and
   * reach the pipeline pages.
   */
  if (user.role === "client") redirect("/portal");

  return {
    userId: user.id,
    email: user.email,
    // Narrowed by the redirect above: everything past this point is staff.
    role: user.role,
    fullName: user.fullName,
  };
}

/**
 * The pipeline pages: requests, contacts, questions, settings, plans.
 *
 * Until there was a BDE, a session was all these pages asked for. It
 * isn't any more — a field role has a session and no business here —
 * so every one of them calls this instead of requireStaff().
 */
export async function requirePipeline(): Promise<StaffSession> {
  const session = await requireStaff();
  if (!canSeePipeline(session.role)) redirect(homePathFor(session.role));
  return session;
}

/** Pages and actions that touch money: targets, revenue, payments. */
export async function requireFinance(): Promise<StaffSession> {
  const session = await requireStaff();
  if (!canSeeFinances(session.role)) redirect(homePathFor(session.role));
  return session;
}

/** The whole team's activity, rather than your own. */
export async function requireActivityView(): Promise<StaffSession> {
  const session = await requireStaff();
  if (!canSeeAllActivity(session.role)) redirect(homePathFor(session.role));
  return session;
}

/** Owner-only: pricing, the team, and which activities exist. */
export async function requireOwner(): Promise<StaffSession> {
  const session = await requireStaff();
  if (session.role !== "owner") redirect(homePathFor(session.role));
  return session;
}
