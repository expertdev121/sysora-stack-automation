import "server-only";

import { randomInt } from "node:crypto";

import { hashPassword } from "@/lib/auth/password";
import { salesDb } from "@/lib/supabase/admin";

/**
 * Creates the client's portal account the moment their first order is paid.
 *
 * The generated password is returned once, in memory, so the confirmation
 * webhook can hand it to GoHighLevel to email. It is never stored in
 * plain text and never logged: the row keeps a scrypt hash like every
 * other account, and this function is the only place the clear value
 * exists.
 *
 * Six digits is short on purpose, because it gets read out loud and
 * retyped. It is below the site's own ten-character minimum, so the
 * account is flagged `must_change_password` and the portal asks for a
 * real one on arrival.
 */

/**
 * `existing_client` is the ordinary repeat purchase. `email_in_use`
 * means the address already belongs to somebody who is not this
 * customer, a staff login most often, so no portal account can be made
 * for them. They are still a paying customer and still need telling,
 * which is a different outcome and routes differently.
 */
export type Provisioned =
  | { created: true; reason: "created"; email: string; password: string }
  | { created: false; reason: "existing_client" | "email_in_use" | "no_email"; email: string | null };

/** 100000-999999, from the CSPRNG rather than Math.random. */
function sixDigitPassword(): string {
  return String(randomInt(100_000, 1_000_000));
}

export async function provisionPortalAccount(customerId: string): Promise<Provisioned> {
  const db = salesDb();

  const { data: customer } = await db
    .from("customers")
    .select("id, email, full_name")
    .eq("id", customerId)
    .maybeSingle();

  if (!customer?.email) return { created: false, reason: "no_email", email: null };

  const email = customer.email.trim();
  const normalized = email.toLowerCase();

  // Two ways an account can already exist: this customer has one, or the
  // address is in use by somebody else (a staff login on the same
  // address, say). Either way we do not touch it, and the caller sends
  // the repeat-purchase webhook instead of credentials.
  //
  // Two queries rather than one .or(): the filter is a string grammar
  // where a comma starts the next condition, and an address is not
  // something to hand to a parser unescaped.
  const [byCustomer, byEmail] = await Promise.all([
    db.from("users").select("id").eq("customer_id", customerId).maybeSingle(),
    db.from("users").select("id").eq("email_normalized", normalized).maybeSingle(),
  ]);

  if (byCustomer.data) return { created: false, reason: "existing_client", email };
  if (byEmail.data) {
    // Not this customer's account. Nothing here is safe to overwrite:
    // the row may be a staff login, and giving it a customer_id would
    // hand a staff session a client portal.
    console.error(
      `[provisionPortalAccount] ${email} already belongs to another account, no portal account created`,
    );
    return { created: false, reason: "email_in_use", email };
  }

  const password = sixDigitPassword();
  const passwordHash = await hashPassword(password);

  const { error } = await db.from("users").insert({
    email,
    email_normalized: normalized,
    password_hash: passwordHash,
    full_name: customer.full_name,
    role: "client",
    is_active: true,
    customer_id: customerId,
    must_change_password: true,
  });

  if (error) {
    // 23505 means somebody else inserted between the check and here,
    // which is the same outcome as the account already existing.
    if (error.code === "23505") return { created: false, reason: "email_in_use", email };
    console.error("[provisionPortalAccount] could not create account", error.code, error.message);
    return { created: false, reason: "email_in_use", email };
  }

  return { created: true, reason: "created", email, password };
}
