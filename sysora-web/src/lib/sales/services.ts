import "server-only";

import type { Service, ServiceFaq } from "@/lib/sales/types";
import { salesDb } from "@/lib/supabase/admin";

/**
 * Reading the services catalogue.
 *
 * Public pages go through the service key on the server rather than
 * exposing the table to anon: the rows carry draft copy and pricing that
 * is not public until someone ticks the box, and an RLS policy that has
 * to encode "published" is a second place for that rule to drift from
 * the one the queries already apply.
 */

/** Published services, in display order. */
export async function listPublishedServices(): Promise<Service[]> {
  const { data } = await salesDb()
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");
  return (data ?? []) as Service[];
}

/** Everything, published or not — the dashboard needs the drafts too. */
export async function listAllServices(): Promise<Service[]> {
  const { data } = await salesDb()
    .from("services")
    .select("*")
    .order("sort_order")
    .order("name");
  return (data ?? []) as Service[];
}

/**
 * One published service and its questions.
 *
 * Returns null for a draft as well as for a missing slug, so an unpublished
 * page 404s rather than being readable by anyone who guesses the URL.
 */
export async function getPublishedService(
  slug: string,
): Promise<{ service: Service; faqs: ServiceFaq[] } | null> {
  const db = salesDb();

  const { data } = await db
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return null;
  const service = data as Service;

  const { data: faqRows } = await db
    .from("service_faqs")
    .select("*")
    .eq("service_id", service.id)
    .order("sort_order");

  return { service, faqs: (faqRows ?? []) as ServiceFaq[] };
}

/** FAQs for the dashboard, where drafts are visible. */
export async function getServiceFaqs(serviceId: string): Promise<ServiceFaq[]> {
  const { data } = await salesDb()
    .from("service_faqs")
    .select("*")
    .eq("service_id", serviceId)
    .order("sort_order");
  return (data ?? []) as ServiceFaq[];
}

/**
 * What the page shows where a price would go.
 *
 * A null price is an enquiry, not a free service, so it must never render
 * as "$0" — that is the one wrong answer here.
 */
export function priceLabel(service: Pick<Service, "price_amount" | "currency">): string {
  if (service.price_amount === null) return "Get a quote";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: service.currency || "USD",
    minimumFractionDigits: service.price_amount % 100 === 0 ? 0 : 2,
    maximumFractionDigits: service.price_amount % 100 === 0 ? 0 : 2,
  }).format(service.price_amount / 100);
}

/** Blank-line-separated prose into paragraphs. */
export function paragraphs(body: string | null): string[] {
  if (!body) return [];
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
