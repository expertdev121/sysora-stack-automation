import "server-only";

import { createClient } from "@supabase/supabase-js";

/** A client bound to the `sales` schema rather than `public`. */
type SalesClient = ReturnType<typeof createSalesClient>;

function createSalesClient(url: string, key: string) {
  return createClient(url, key, {
    db: { schema: "sales" },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Server-side Supabase client scoped to the `sales` schema.
 *
 * Uses the service role, so it bypasses RLS — every call must therefore
 * live in a server action or route handler that has already decided the
 * caller is allowed to do what they're asking. It must never be imported
 * into a client component; the `server-only` import above makes that a
 * build error rather than a leak.
 */

let client: SalesClient | null = null;

export function salesDb(): SalesClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set. Copy .env.example to .env.local.");
  }
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local — " +
        "Supabase dashboard → Project Settings → API → service_role.",
    );
  }

  client = createSalesClient(url, serviceRoleKey);

  return client;
}

/** True when the server has everything it needs to talk to the database. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
