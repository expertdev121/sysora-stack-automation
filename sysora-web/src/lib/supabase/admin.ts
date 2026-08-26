import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase clients, one per schema.
 *
 * supabase-js binds a client to a single schema, so reading across
 * `sales` and `public` needs two. They share a connection pool and a
 * key; only the default schema differs.
 *
 * Both use the service role, so they bypass RLS — every call must
 * therefore live behind a guard that has already decided the caller is
 * allowed. The `server-only` import above makes importing either into a
 * client component a build error rather than a leak.
 */

function createFor(schema: "sales" | "public") {
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

  return createClient(url, serviceRoleKey, {
    db: { schema },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type Client = ReturnType<typeof createFor>;

let sales: Client | null = null;
let publicSchema: Client | null = null;

/** Money and targets: offers, payments, revenue_targets, the views. */
export function salesDb(): Client {
  if (!sales) sales = createFor("sales");
  return sales;
}

/**
 * The org: profiles, eod_reports, eod_metrics, work_metrics.
 *
 * People and the work they report live here, in the EMS's schema, and
 * the sales side reads across rather than keeping its own copy.
 */
export function publicDb(): Client {
  if (!publicSchema) publicSchema = createFor("public");
  return publicSchema;
}

/** True when the server has everything it needs to talk to the database. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
