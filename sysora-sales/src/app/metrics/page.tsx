import type { Metadata } from "next";

import { MetricEditor } from "@/components/MetricEditor";
import { Shell } from "@/components/Shell";
import { PageHeading } from "@/components/ui";
import { requireOwner } from "@/lib/admin/auth";
import type { WorkMetric } from "@/lib/admin/types";
import { publicDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Metrics" };

export default async function MetricsPage() {
  const session = await requireOwner();

  const { data } = await publicDb()
    .from("work_metrics")
    .select("id, slug, label, question, unit, sort_order, is_active, feeds_sales")
    .order("is_active", { ascending: false })
    .order("sort_order", { ascending: true });

  return (
    <Shell session={session}>
      <PageHeading eyebrow="Configure" title="Metrics" />
      <p className="mt-[-16px] mb-8 max-w-[74ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
        The lead measures — the things somebody can still change today, unlike revenue, which only
        reports a week that already happened. Each one becomes a question on the end-of-day report
        and a number you can set against any target. They live with the team, in the same schema as
        the people who report them, so there is one list rather than one per app.
      </p>

      <MetricEditor metrics={(data ?? []) as WorkMetric[]} />
    </Shell>
  );
}
