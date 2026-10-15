import "server-only";

import { salesDb } from "@/lib/supabase/admin";

/**
 * Everything the client portal reads.
 *
 * Every function takes a customerId and filters by it. That argument
 * always comes from requireClient(), never from a URL or a form, which
 * is what keeps one client out of another's ledger.
 */

export type Balance = {
  purchased: number;
  used: number;
  remaining: number;
  nextExpiry: string | null;
  nextReset: string | null;
};

export type LedgerRow = {
  id: string;
  date: string;
  description: string;
  kind: string;
  hours: number;
  billable: boolean;
};

export type TaskRow = {
  id: string;
  title: string;
  detail: string | null;
  status: string;
  estimateHours: number | null;
  loggedHours: number;
};

export type InvoiceRow = {
  id: string;
  reference: string;
  date: string;
  item: string;
  amount: number;
  currency: string;
  status: "Paid" | "Scheduled" | "Unpaid";
  receiptUrl: string | null;
};

export type TicketRow = {
  id: string;
  reference: string;
  subject: string;
  category: string | null;
  status: string;
  priority: string;
  updatedAt: string;
};

export type BuildRow = {
  id: string;
  reference: string;
  title: string;
  stage: string | null;
  budgetBand: string | null;
  createdAt: string;
};

/**
 * What the sidebar needs on every page: hours left, the company name
 * under the avatar, and the open-ticket count on the nav badge. One
 * call so a page does not assemble the chrome three different ways.
 */
export async function getChrome(customerId: string): Promise<{
  remaining: number;
  purchased: number;
  company: string | null;
  openTickets: number;
}> {
  const db = salesDb();
  const [balance, customer, tickets] = await Promise.all([
    getBalance(customerId),
    db.from("customers").select("company_name").eq("id", customerId).maybeSingle(),
    db
      .from("support_tickets")
      .select("id")
      .eq("customer_id", customerId)
      .neq("status", "resolved"),
  ]);

  return {
    remaining: balance.remaining,
    purchased: balance.purchased,
    company: customer.data?.company_name ?? null,
    openTickets: (tickets.data ?? []).length,
  };
}

export async function getBalance(customerId: string): Promise<Balance> {
  const { data } = await salesDb()
    .from("customer_hour_balance")
    .select("hours_purchased, hours_used, hours_remaining, next_expiry, next_reset")
    .eq("customer_id", customerId)
    .maybeSingle();

  return {
    purchased: Number(data?.hours_purchased ?? 0),
    used: Number(data?.hours_used ?? 0),
    remaining: Number(data?.hours_remaining ?? 0),
    nextExpiry: data?.next_expiry ?? null,
    nextReset: data?.next_reset ?? null,
  };
}

export async function getLedger(customerId: string, limit = 200): Promise<LedgerRow[]> {
  const { data } = await salesDb()
    .from("time_entries")
    .select("id, entry_date, description, kind, hours, billable")
    .eq("customer_id", customerId)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((r) => ({
    id: r.id,
    date: r.entry_date,
    description: r.description,
    kind: r.kind,
    hours: Number(r.hours),
    billable: r.billable,
  }));
}

export async function getTasks(customerId: string): Promise<TaskRow[]> {
  const db = salesDb();

  const { data: tasks } = await db
    .from("tasks")
    .select("id, title, detail, status, estimate_hours")
    .eq("customer_id", customerId)
    .not("status", "in", "(done,cancelled)")
    .order("created_at", { ascending: false });

  const ids = (tasks ?? []).map((t) => t.id);
  if (ids.length === 0) return [];

  // Hours logged per task, so the card can show actual against estimate.
  const { data: entries } = await db
    .from("time_entries")
    .select("task_id, hours")
    .in("task_id", ids);

  const logged = new Map<string, number>();
  for (const e of entries ?? []) {
    if (!e.task_id) continue;
    logged.set(e.task_id, (logged.get(e.task_id) ?? 0) + Number(e.hours));
  }

  return (tasks ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    detail: t.detail,
    status: t.status,
    estimateHours: t.estimate_hours === null ? null : Number(t.estimate_hours),
    loggedHours: logged.get(t.id) ?? 0,
  }));
}

/**
 * Invoices are derived, not a table: a paid order is a paid invoice, and
 * an active subscription's next period is the scheduled one. Inventing an
 * invoices table would mean two records of the same money.
 */
export async function getInvoices(customerId: string): Promise<InvoiceRow[]> {
  const db = salesDb();

  const { data: orders } = await db
    .from("requests")
    .select("id, reference, title, amount, currency, status, paid_at, created_at")
    .eq("customer_id", customerId)
    .eq("kind", "hour_pack")
    .order("created_at", { ascending: false });

  const ids = (orders ?? []).map((o) => o.id);
  const receipts = new Map<string, string>();

  if (ids.length > 0) {
    const { data: payments } = await db
      .from("payments")
      .select("request_id, receipt_url, status")
      .in("request_id", ids)
      .eq("status", "succeeded");

    for (const p of payments ?? []) {
      if (p.request_id && p.receipt_url) receipts.set(p.request_id, p.receipt_url);
    }
  }

  const rows: InvoiceRow[] = (orders ?? []).map((o) => ({
    id: o.id,
    reference: o.reference,
    date: o.paid_at ?? o.created_at,
    item: o.title ?? "Prepaid hours",
    amount: o.amount,
    currency: o.currency,
    status: o.status === "paid" ? "Paid" : "Unpaid",
    receiptUrl: receipts.get(o.id) ?? null,
  }));

  // A live subscription's next renewal, shown above the history.
  const { data: sub } = await db
    .from("subscriptions")
    .select("id, amount, currency, current_period_end, status")
    .eq("customer_id", customerId)
    .in("status", ["active", "trialing", "past_due"])
    .order("current_period_end", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (sub?.current_period_end) {
    rows.unshift({
      id: sub.id,
      reference: "UPCOMING",
      date: sub.current_period_end,
      item: "Monthly plan renewal",
      amount: sub.amount,
      currency: sub.currency,
      status: "Scheduled",
      receiptUrl: null,
    });
  }

  return rows;
}

export async function getTickets(customerId: string): Promise<TicketRow[]> {
  const { data } = await salesDb()
    .from("support_tickets")
    .select("id, reference, subject, category, status, priority, updated_at")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((t) => ({
    id: t.id,
    reference: t.reference,
    subject: t.subject,
    category: t.category,
    status: t.status,
    priority: t.priority,
    updatedAt: t.updated_at,
  }));
}

export async function getBuildRequests(customerId: string): Promise<BuildRow[]> {
  const { data } = await salesDb()
    .from("requests")
    .select("id, reference, title, build_stage, budget_band, created_at")
    .eq("customer_id", customerId)
    .eq("kind", "build_request")
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    id: r.id,
    reference: r.reference,
    title: r.title ?? "Build request",
    stage: r.build_stage,
    budgetBand: r.budget_band,
    createdAt: r.created_at,
  }));
}

/**
 * The plan behind the current hours: the most recent entitlement, and
 * what was paid for it. Derived rather than stored, like the balance.
 */
export async function getPlan(customerId: string): Promise<{
  hours: number;
  monthly: boolean;
  amount: number;
  currency: string;
} | null> {
  const { data } = await salesDb()
    .from("hour_entitlements")
    .select("hours, source, rate_amount, currency")
    .eq("customer_id", customerId)
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  const hours = Number(data.hours);
  return {
    hours,
    monthly: data.source === "monthly",
    // rate_amount is per hour in minor units; the plan price is the whole pack.
    amount: Math.round((data.rate_amount ?? 0) * hours),
    currency: data.currency ?? "USD",
  };
}

/** The card on file, read from the most recent successful payment. */
export async function getCardOnFile(
  customerId: string,
): Promise<{ brand: string | null; last4: string | null } | null> {
  const { data } = await salesDb()
    .from("payments")
    .select("card_brand, card_last4, requests!inner(customer_id)")
    .eq("requests.customer_id", customerId)
    .eq("status", "succeeded")
    .not("card_last4", "is", null)
    .order("succeeded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return { brand: data.card_brand, last4: data.card_last4 };
}
