"use server";

import { redirect } from "next/navigation";

import { hashPassword, passwordProblem, verifyPassword } from "./password";
import {
  consumePasswordToken,
  createSession,
  destroySession,
  peekPasswordToken,
  revokeAllSessions,
} from "./session";
import { salesDb } from "@/lib/supabase/admin";

export type AuthResult = { ok: true } | { ok: false; error: string };

const MAX_ATTEMPTS = 8;
const LOCK_MINUTES = 15;

/**
 * Signs in with email and password.
 *
 * Always answers with the same message whether the address is unknown or
 * the password is wrong, so the form can't be used to discover who has an
 * account. Repeated failures lock the account for a while.
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const generic = { ok: false as const, error: "That email and password don't match." };
  const address = email.trim().toLowerCase();

  if (!address || !password) return generic;

  const db = salesDb();
  const { data: user } = await db
    .from("users")
    .select("id, password_hash, is_active, failed_attempts, locked_until")
    .eq("email_normalized", address)
    .maybeSingle();

  // Hash anyway when there's no such user, so a missing account doesn't
  // answer measurably faster than a wrong password.
  if (!user) {
    await verifyPassword(password, null);
    return generic;
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return {
      ok: false,
      error: `Too many attempts. Try again in ${LOCK_MINUTES} minutes.`,
    };
  }

  if (!user.is_active) return generic;

  const valid = await verifyPassword(password, user.password_hash);

  if (!valid) {
    const attempts = (user.failed_attempts ?? 0) + 1;
    await db
      .from("users")
      .update({
        failed_attempts: attempts,
        locked_until:
          attempts >= MAX_ATTEMPTS
            ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString()
            : null,
      })
      .eq("id", user.id);

    return generic;
  }

  await db
    .from("users")
    .update({ failed_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() })
    .eq("id", user.id);

  await createSession(user.id);
  return { ok: true };
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

/** True when a set-password link is still good — drives the page's first render. */
export async function checkPasswordToken(token: string): Promise<boolean> {
  if (!token) return false;
  return (await peekPasswordToken(token)) !== null;
}

/**
 * Sets a password from a one-time link, then signs the person in.
 *
 * Every other session for that account is revoked: if the link was used
 * because someone lost control of the account, this is what locks the
 * other party out.
 */
export async function setPasswordWithToken(
  token: string,
  password: string,
  confirm: string,
): Promise<AuthResult> {
  if (password !== confirm) return { ok: false, error: "Those two don't match." };

  const problem = passwordProblem(password);
  if (problem) return { ok: false, error: problem };

  const userId = await consumePasswordToken(token);
  if (!userId) {
    return { ok: false, error: "This link has expired or has already been used." };
  }

  const hash = await hashPassword(password);
  const { error } = await salesDb()
    .from("users")
    .update({ password_hash: hash, failed_attempts: 0, locked_until: null })
    .eq("id", userId);

  if (error) return { ok: false, error: "Could not save that password." };

  await revokeAllSessions(userId);
  await createSession(userId);
  return { ok: true };
}
