import "server-only";

import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import { canSeeFinances } from "./roles";
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
  canManageTargets,
  canManageTeam,
  canSeeAllActivity,
  canSeeFinances,
} from "./roles";

/**
 * The gate on every page in this app.
 *
 * This whole application is about money, so unlike the marketing site's
 * dashboard there is no useful half-view for someone without finance
 * access: an admin here would see a set of empty rooms. Rather than
 * render blanks, they're told plainly and sent nowhere.
 *
 * Auth is ours, and the tables have no RLS policy — they're reached with
 * the service role. This check is therefore the only thing between a
 * request and the data, so every page must call it before reading
 * anything.
 */
export async function requireFinance(): Promise<StaffSession> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const session: StaffSession = {
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  };

  if (!canSeeFinances(session.role)) redirect("/no-access");
  return session;
}

/** Owner-only: the team, and which activities exist. */
export async function requireOwner(): Promise<StaffSession> {
  const session = await requireFinance();
  if (session.role !== "owner") redirect("/");
  return session;
}

/** Signed in, whoever they are — for the no-access page itself. */
export async function currentSession(): Promise<StaffSession | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  };
}
