"use server";

import { redirect } from "next/navigation";

import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { salesDb } from "@/lib/supabase/admin";

/**
 * Portal sign-in and sign-out.
 *
 * Separate from the staff login because the two send people to
 * different places and should say different things when the credentials
 * are wrong — but it reuses the same hashing, the same session table
 * and the same lockout counters, so there is one auth implementation in
 * this codebase rather than two.
 */

const LOCK_AFTER = 8;
const LOCK_MINUTES = 15;

export type LoginResult = { ok: false; error: string };

export async function signIn(form: FormData): Promise<LoginResult> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!email || !password) return { ok: false, error: "Enter your email and password." };

  const db = salesDb();

  const { data: user } = await db
    .from("users")
    .select("id, password_hash, role, is_active, failed_attempts, locked_until, customer_id")
    .eq("email_normalized", email)
    .maybeSingle();

  // The same message whatever went wrong, so this cannot be used to
  // discover which email addresses have accounts.
  const generic: LoginResult = { ok: false, error: "That email and password do not match." };

  if (!user || !user.is_active) return generic;
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return { ok: false, error: "Too many attempts. Try again in a few minutes." };
  }

  const valid = await verifyPassword(password, user.password_hash);

  if (!valid) {
    const attempts = (user.failed_attempts ?? 0) + 1;
    await db
      .from("users")
      .update({
        failed_attempts: attempts,
        locked_until:
          attempts >= LOCK_AFTER
            ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString()
            : null,
      })
      .eq("id", user.id);
    return generic;
  }

  if (user.role !== "client" || !user.customer_id) {
    return { ok: false, error: "That account signs in through the staff console." };
  }

  await db
    .from("users")
    .update({ failed_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() })
    .eq("id", user.id);

  await createSession(user.id);
  redirect("/portal");
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/portal/login");
}
