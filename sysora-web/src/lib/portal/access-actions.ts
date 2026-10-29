"use server";

import { revalidatePath } from "next/cache";

import { requireClient } from "@/lib/portal/auth";
import { salesDb } from "@/lib/supabase/admin";

/**
 * Saving the access grant.
 *
 * Separate from access.ts because that module is server-only and this
 * one is called from the browser. The read side stays there.
 */
export type AccessResult = { ok: true } | { ok: false; error: string };

/**
 * Saves the grant. Complete means the GoHighLevel box is ticked and the
 * account name is filled in, because an account we cannot identify is
 * not access we can use. The other tools are optional: most clients
 * have none, and the ones who do describe them in their own words.
 */
export async function saveAccessGrant(form: FormData): Promise<AccessResult> {
  const { customerId } = await requireClient();

  const granted = form.get("ghl_granted") === "on";
  const accountName = String(form.get("ghl_account_name") ?? "").trim();
  const toolsNotes = String(form.get("tools_notes") ?? "").trim();

  if (granted && accountName.length < 2) {
    return { ok: false, error: "Tell us the GoHighLevel account name so we can find it." };
  }

  const complete = granted && accountName.length >= 2;

  const { error } = await salesDb()
    .from("access_grants")
    .upsert(
      {
        customer_id: customerId,
        ghl_granted: granted,
        ghl_account_name: accountName || null,
        tools_notes: toolsNotes || null,
        completed_at: complete ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "customer_id" },
    );

  if (error) {
    console.error("[saveAccessGrant]", error.code, error.message);
    return { ok: false, error: "Could not save that. Please try again." };
  }

  revalidatePath("/portal");
  return { ok: true };
}
