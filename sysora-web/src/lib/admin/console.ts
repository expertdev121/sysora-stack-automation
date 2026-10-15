import "server-only";

import { salesDb } from "@/lib/supabase/admin";

/**
 * Reads for the operations console.
 *
 * The console's whole job is to answer "who needs me today", so the
 * shapes here lead with the derived health of an account rather than
 * raw rows: a client is Healthy, Low balance, Expiring, Used up or
 * Payment failed, and that verdict is computed in one place so the
 * overview and the client table cannot disagree about it.
 */

export type ClientHealth =
  | "Healthy"
  | "Low balance"
  | "Expiring"
  | "Used up"
  | "Payment failed";

export type ClientRow = {
  customerId: string;
  name: string;
  contact: string | null;
  email: string;
  purchased: number;
  used: number;
  remaining: number;
  nextExpiry: string | null;
  nextReset: string | null;
  lifetimeValue: number;
  openTickets: number;
  paymentFailed: boolean;
  health: ClientHealth;
  /** Why it is not Healthy, for the attention list. Empty when it is. */
  reason: string;
};

export type TicketRow = {
  id: string;
  reference: string;
  subject: string;
  clientName: string;
  customerId: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type BuildRow = {
  id: string;
  reference: string;
  title: string;
  clientName: string;
  budgetBand: string | null;
  stage: string;
  createdAt: string;
};

const DAY = 86_400_000;

function healthOf(row: {
  purchased: number;
  remaining: number;
  nextExpiry: string | null;
  paymentFailed: boolean;
}): { health: ClientHealth; reason: string } {
  if (row.paymentFailed) {
    return { health: "Payment failed", reason: "Card declined on renewal" };
  }
  if (row.purchased > 0 && row.remaining <= 0) {
    return { health: "Used up", reason: "No hours left, offer a top-up" };
  }

  const daysToExpiry = row.nextExpiry
    ? Math.ceil((Date.parse(row.nextExpiry) - Date.now()) / DAY)
    : null;

  // Unused hours about to expire is money the client is going to lose,
  // and the most useful thing the console can surface.
  if (daysToExpiry !== null && daysToExpiry <= 14 && row.remaining / row.purchased > 0.5) {
    return {
      health: "Expiring",
      reason: `${round(row.remaining)}h unused, expires in ${daysToExpiry} day${daysToExpiry === 1 ? "" : "s"}`,
    };
  }
  if (row.purchased > 0 && row.remaining / row.purchased < 0.2) {
    return { health: "Low balance", reason: `${round(row.remaining)}h left` };
  }
  return { health: "Healthy", reason: "" };
}

const round = (n: number) => Math.round(n * 100) / 100;

export async function getClients(): Promise<ClientRow[]> {
  const db = salesDb();

  const { data: customers } = await db
    .from("customers")
    .select("id, email, full_name, company_name")
    .order("created_at", { ascending: false })
    .limit(500);

  if (!customers || customers.length === 0) return [];
  const ids = customers.map((c) => c.id);

  const [balances, orders, tickets, failed] = await Promise.all([
    db
      .from("customer_hour_balance")
      .select("customer_id, hours_purchased, hours_used, hours_remaining, next_expiry, next_reset")
      .in("customer_id", ids),
    db
      .from("requests")
      .select("customer_id, amount, status")
      .in("customer_id", ids)
      .eq("status", "paid"),
    db
      .from("support_tickets")
      .select("customer_id, status")
      .in("customer_id", ids)
      .neq("status", "resolved"),
    db
      .from("payments")
      .select("status, requests!inner(customer_id)")
      .eq("status", "failed")
      .in("requests.customer_id", ids),
  ]);

  const byId = new Map(
    (balances.data ?? []).map((b) => [b.customer_id as string, b]),
  );

  const ltv = new Map<string, number>();
  for (const o of orders.data ?? []) {
    ltv.set(o.customer_id, (ltv.get(o.customer_id) ?? 0) + (o.amount ?? 0));
  }

  const openTickets = new Map<string, number>();
  for (const t of tickets.data ?? []) {
    openTickets.set(t.customer_id, (openTickets.get(t.customer_id) ?? 0) + 1);
  }

  const failedFor = new Set<string>();
  for (const p of (failed.data ?? []) as unknown as {
    requests: { customer_id: string } | { customer_id: string }[];
  }[]) {
    const r = Array.isArray(p.requests) ? p.requests[0] : p.requests;
    if (r?.customer_id) failedFor.add(r.customer_id);
  }

  return customers.map((c) => {
    const b = byId.get(c.id);
    const purchased = Number(b?.hours_purchased ?? 0);
    const used = Number(b?.hours_used ?? 0);
    const remaining = Number(b?.hours_remaining ?? 0);
    const paymentFailed = failedFor.has(c.id);
    const { health, reason } = healthOf({
      purchased,
      remaining,
      nextExpiry: b?.next_expiry ?? null,
      paymentFailed,
    });

    return {
      customerId: c.id,
      name: c.company_name || c.full_name || c.email,
      contact: c.full_name,
      email: c.email,
      purchased,
      used,
      remaining,
      nextExpiry: b?.next_expiry ?? null,
      nextReset: b?.next_reset ?? null,
      lifetimeValue: ltv.get(c.id) ?? 0,
      openTickets: openTickets.get(c.id) ?? 0,
      paymentFailed,
      health,
      reason,
    };
  });
}

export async function getTickets(): Promise<TicketRow[]> {
  const { data } = await salesDb()
    .from("support_tickets")
    .select(
      "id, reference, subject, priority, status, created_at, updated_at, customer_id, customers(full_name, company_name, email)",
    )
    .order("created_at", { ascending: false })
    .limit(300);

  return (data ?? []).map((t) => {
    const c = (Array.isArray(t.customers) ? t.customers[0] : t.customers) as
      | { full_name: string | null; company_name: string | null; email: string }
      | undefined;
    return {
      id: t.id,
      reference: t.reference,
      subject: t.subject,
      clientName: c?.company_name || c?.full_name || c?.email || "Unknown",
      customerId: t.customer_id,
      priority: t.priority,
      status: t.status,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    };
  });
}

export async function getBuildRequests(): Promise<BuildRow[]> {
  const { data } = await salesDb()
    .from("requests")
    .select(
      "id, reference, title, build_stage, budget_band, created_at, customers(full_name, company_name, email)",
    )
    .eq("kind", "build_request")
    .order("created_at", { ascending: false })
    .limit(200);

  return (data ?? []).map((r) => {
    const c = (Array.isArray(r.customers) ? r.customers[0] : r.customers) as
      | { full_name: string | null; company_name: string | null; email: string }
      | undefined;
    return {
      id: r.id,
      reference: r.reference,
      title: r.title ?? "Build request",
      clientName: c?.company_name || c?.full_name || c?.email || "Unknown",
      budgetBand: r.budget_band,
      stage: r.build_stage ?? "new",
      createdAt: r.created_at,
    };
  });
}

/** Hours delivered per day for the last seven days, for the overview chart. */
export async function getWeeklyHours(): Promise<{ day: string; hours: number }[]> {
  const since = new Date(Date.now() - 6 * DAY).toISOString().slice(0, 10);

  const { data } = await salesDb()
    .from("time_entries")
    .select("entry_date, hours")
    .gte("entry_date", since);

  const byDate = new Map<string, number>();
  for (const e of data ?? []) {
    byDate.set(e.entry_date, (byDate.get(e.entry_date) ?? 0) + Number(e.hours));
  }

  const out: { day: string; hours: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY);
    const key = d.toISOString().slice(0, 10);
    out.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      hours: round(byDate.get(key) ?? 0),
    });
  }
  return out;
}

/** The one client the drawer is showing, with its ledger. */
export async function getClientDetail(customerId: string) {
  const db = salesDb();

  const [client, entries, entitlements] = await Promise.all([
    getClients().then((all) => all.find((c) => c.customerId === customerId) ?? null),
    db
      .from("time_entries")
      .select("id, entry_date, description, kind, hours, billable")
      .eq("customer_id", customerId)
      .order("entry_date", { ascending: false })
      .limit(50),
    db
      .from("hour_entitlements")
      .select("id, hours, source, starts_at, expires_at, resets_at, note")
      .eq("customer_id", customerId)
      .order("starts_at", { ascending: false }),
  ]);

  return {
    client,
    ledger: (entries.data ?? []).map((e) => ({
      id: e.id,
      date: e.entry_date,
      description: e.description,
      kind: e.kind,
      hours: Number(e.hours),
      billable: e.billable,
    })),
    entitlements: entitlements.data ?? [],
  };
}
