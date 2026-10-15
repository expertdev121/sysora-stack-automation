import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";

import { salesDb } from "@/lib/supabase/admin";
import type { AccountRole } from "@/lib/admin/types";

/**
 * Sessions.
 *
 * The cookie holds a 256-bit random token. The database stores only its
 * SHA-256, so a leaked table gives an attacker nothing to log in with.
 * The cookie is httpOnly (JavaScript can't read it), sameSite=lax (so a
 * cross-site form post can't ride it), and secure outside development.
 */

const COOKIE = "sysora_session";
const LIFETIME_DAYS = 14;

export type SessionUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: AccountRole;
  /**
   * Set only for role 'client': the customer whose portal this user sees.
   * Staff rows leave it null. Every portal query is scoped by it, so it
   * is the one field standing between a client and someone else's hours.
   */
  customerId: string | null;
};

/** Tokens are hashed, never compared as plaintext. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + LIFETIME_DAYS * 24 * 60 * 60 * 1000);

  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");

  await salesDb().from("sessions").insert({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt.toISOString(),
    ip: forwarded?.split(",")[0]?.trim() || null,
    user_agent: headerList.get("user-agent"),
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/** The signed-in user, or null. Expired and revoked sessions count as null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;

  const { data, error } = await salesDb()
    .from("sessions")
    .select(
      "id, expires_at, revoked_at, users(id, email, full_name, role, is_active, customer_id)",
    )
    .eq("token_hash", hashToken(token))
    .maybeSingle();

  if (error || !data) return null;
  if (data.revoked_at) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  const user = (Array.isArray(data.users) ? data.users[0] : data.users) as
    | {
        id: string;
        email: string;
        full_name: string | null;
        role: AccountRole;
        is_active: boolean;
        customer_id: string | null;
      }
    | undefined;

  if (!user?.is_active) return null;

  // Cheap liveness stamp; failures here must not log anyone out.
  void salesDb()
    .from("sessions")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", data.id)
    .then(undefined, () => {});

  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    customerId: user.customer_id ?? null,
  };
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;

  if (token) {
    await salesDb()
      .from("sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("token_hash", hashToken(token));
  }

  cookieStore.delete(COOKIE);
}

/** Signs every other device out — used after a password change. */
export async function revokeAllSessions(userId: string): Promise<void> {
  await salesDb()
    .from("sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("revoked_at", null);
}

/* ---- One-time links ---------------------------------------- */

export async function createPasswordToken(
  userId: string,
  purpose: "reset" | "invite",
  hours = 24,
): Promise<string> {
  const token = randomBytes(32).toString("base64url");

  await salesDb().from("password_resets").insert({
    user_id: userId,
    token_hash: hashToken(token),
    purpose,
    expires_at: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
  });

  return token;
}

/** Returns the user id a live token belongs to, or null. Does not consume it. */
export async function peekPasswordToken(token: string): Promise<string | null> {
  const { data } = await salesDb()
    .from("password_resets")
    .select("user_id, expires_at, used_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();

  if (!data || data.used_at) return null;
  if (new Date(data.expires_at) < new Date()) return null;
  return data.user_id;
}

/** Burns the token. Returns the user id, or null if it was already spent. */
export async function consumePasswordToken(token: string): Promise<string | null> {
  const hash = hashToken(token);

  const { data } = await salesDb()
    .from("password_resets")
    .update({ used_at: new Date().toISOString() })
    .eq("token_hash", hash)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("user_id")
    .maybeSingle();

  return data?.user_id ?? null;
}
