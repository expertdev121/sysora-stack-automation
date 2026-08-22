import "server-only";

import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import type { StaffRole } from "./types";

export type StaffSession = {
  userId: string;
  email: string;
  role: StaffRole;
  fullName: string | null;
};

/**
 * The gate on every dashboard page.
 *
 * Auth is ours now, so this is the only thing standing between a request
 * and the data — the private tables have no RLS policy at all and are
 * reached with the service role. Every dashboard page must call it, and
 * must call it before reading anything.
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

/** For pages only super admins may open. */
export async function requireSuperAdmin(): Promise<StaffSession> {
  const session = await requireStaff();
  if (session.role !== "super_admin") redirect("/admin");
  return session;
}
