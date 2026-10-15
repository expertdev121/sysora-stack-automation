import "server-only";

import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";

export type ClientSession = {
  userId: string;
  customerId: string;
  email: string;
  fullName: string | null;
};

/**
 * The gate on every portal page.
 *
 * The portal's tables have no RLS policy and are read with the service
 * role, exactly like the admin side, so this function is the only thing
 * standing between a request and another customer's hours. Every page
 * must call it first, and every query below it must be scoped by the
 * customerId it returns — never by an id from the URL.
 *
 * A staff user who wanders to /portal is sent to the admin console
 * rather than shown an empty portal, because they have no customer.
 */
export async function requireClient(): Promise<ClientSession> {
  const user = await getSessionUser();

  if (!user) redirect("/portal/login");

  if (user.role !== "client" || !user.customerId) {
    redirect(user.role === "client" ? "/portal/login" : "/admin");
  }

  return {
    userId: user.id,
    customerId: user.customerId,
    email: user.email,
    fullName: user.fullName,
  };
}
