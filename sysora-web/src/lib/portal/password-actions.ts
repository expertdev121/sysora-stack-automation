"use server";

import { revalidatePath } from "next/cache";

import { hashPassword, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { requireClient } from "@/lib/portal/auth";
import { salesDb } from "@/lib/supabase/admin";

export type ChangeResult = { ok: true } | { ok: false; error: string };

/**
 * Lets a client replace the code that was emailed to them.
 *
 * The code generated at checkout is six digits, below the site's own
 * minimum, so this is the route off it. The current password is still
 * required: a session left open on a shared machine should not be
 * enough to lock the owner out of their own account.
 */
export async function changePortalPassword(
  currentPassword: string,
  newPassword: string,
): Promise<ChangeResult> {
  const session = await requireClient();
  const db = salesDb();

  const { data: user } = await db
    .from("users")
    .select("password_hash")
    .eq("id", session.userId)
    .maybeSingle();

  if (!user || !(await verifyPassword(currentPassword, user.password_hash))) {
    return { ok: false, error: "That is not your current password." };
  }

  const problem = passwordProblem(newPassword);
  if (problem) return { ok: false, error: problem };

  if (await verifyPassword(newPassword, user.password_hash)) {
    return { ok: false, error: "That is the password you already have." };
  }

  const { error } = await db
    .from("users")
    .update({
      password_hash: await hashPassword(newPassword),
      must_change_password: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.userId);

  if (error) return { ok: false, error: "Could not save that. Try again." };

  revalidatePath("/portal", "layout");
  return { ok: true };
}
