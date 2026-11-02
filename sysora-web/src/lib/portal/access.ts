import "server-only";

import { revalidatePath } from "next/cache";

import { requireClient } from "@/lib/portal/auth";
import { salesDb } from "@/lib/supabase/admin";

/**
 * The access a client has granted us.
 *
 * Nothing billable can start until we are inside their GoHighLevel
 * account, so the portal asks for this before it asks for anything
 * else, and the checklist stays on the overview until it is done.
 *
 * The address every grant goes to is fixed here rather than in the
 * copy, so there is one place to change it and the form, the checklist
 * and the admin all read the same value.
 */
export const ACCESS_EMAIL = "expertdeveloper121@gmail.com";

export type AccessGrant = {
  ghlGranted: boolean;
  ghlAccountName: string | null;
  toolsNotes: string | null;
  completedAt: string | null;
};

/** Current state, with the empty shape when nothing has been filled in. */
export async function getAccessGrant(customerId: string): Promise<AccessGrant> {
  const { data } = await salesDb()
    .from("access_grants")
    .select("ghl_granted, ghl_account_name, tools_notes, completed_at")
    .eq("customer_id", customerId)
    .maybeSingle();

  return {
    ghlGranted: Boolean(data?.ghl_granted),
    ghlAccountName: (data?.ghl_account_name as string | null) ?? null,
    toolsNotes: (data?.tools_notes as string | null) ?? null,
    completedAt: (data?.completed_at as string | null) ?? null,
  };
}
