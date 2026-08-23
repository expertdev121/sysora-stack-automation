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
  canManagePricing,
  canManageTargets,
  canManageTeam,
  canSeeFinances,
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

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  };
}

/** Pages and actions that touch money: targets, revenue, payments. */
export async function requireFinance(): Promise<StaffSession> {
  const session = await requireStaff();
  if (!canSeeFinances(session.role)) redirect("/admin");
  return session;
}

/** Owner-only: pricing and the team. */
export async function requireOwner(): Promise<StaffSession> {
  const session = await requireStaff();
  if (session.role !== "owner") redirect("/admin");
  return session;
}
