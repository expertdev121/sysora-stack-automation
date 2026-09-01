import type { Metadata } from "next";
import Link from "next/link";

import { AcquisitionBudget } from "@/components/AcquisitionBudget";
import { ConnectLedger } from "@/components/ConnectLedger";
import { ProposalLog } from "@/components/ProposalLog";
import { Shell } from "@/components/Shell";
import { formatDay } from "@/components/TargetProgress";
import { Card, CardHeader, EmptyState, PageHeading, Table, Td, Th } from "@/components/ui";
import { requireFinance } from "@/lib/admin/auth";
import { formatMoney } from "@/lib/money";
import type {
  AcquisitionDay,
  AcquisitionProgress,
  ConnectPosition,
  ConnectPurchase,
  Profile,
  Proposal,
} from "@/lib/admin/types";
import { publicDb, salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Acquisition" };

/**
 * What it costs to win work.
 *
 * Three things on one page because they are one loop: you buy connects, you
 * spend them bidding, and the spending burns a budget. Splitting them across
 * screens would mean holding the arithmetic in your head.
 */
export default async function AcquisitionPage() {
  const session = await requireFinance();
  const db = salesDb();

  const [{ data: positionRow }, { data: purchaseRows }, { data: proposalRows }, { data: dayRows }] =
    await Promise.all([
      db.from("connect_position").select("*").maybeSingle(),
      db.from("connect_purchases").select("*").order("purchased_on", { ascending: false }),
      db.from("proposals").select("*").order("submitted_on", { ascending: false }).limit(500),
      db.from("acquisition_daily").select("*").order("day", { ascending: false }).limit(30),
    ]);

  // The window to budget against: whatever sprint is running, falling back to
  // the annual target so there is always something to measure.
  const { data: progressRows } = await db
    .from("acquisition_progress")
    .select("*")
    .lte("starts_on", new Date().toISOString().slice(0, 10))
    .gte("ends_on", new Date().toISOString().slice(0, 10))
    .order("starts_on", { ascending: false });

  const windows = (progressRows ?? []) as AcquisitionProgress[];
  const current = windows.find((w) => w.level === "sprint") ?? windows[0] ?? null;

  const position = (positionRow ?? {
    connects_acquired: 0,
    connects_free: 0,
    connects_bought: 0,
    paid_inr: 0,
    paid_usd: 0,
    tax_usd: 0,
    connects_spent: 0,
    connects_refunded: 0,
    proposals: 0,
    connects_left: 0,
    rate_inr: null,
    rate_usd: null,
  }) as ConnectPosition;

  // Who can be credited with a bid. BDEs first, since they are the ones who
  // bid; everyone else is there so a stand-in shift can still be recorded.
  const { data: peopleRows } = await publicDb()
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("is_active", true)
    .order("full_name");

  const people = ((peopleRows ?? []) as (Pick<Profile, "id" | "full_name" | "email"> & {
    role: string;
  })[]).sort((a, b) => Number(b.role === "bde") - Number(a.role === "bde"));

  const days = (dayRows ?? []) as AcquisitionDay[];

  return (
    <Shell session={session}>
      <PageHeading eyebrow="What it costs to win work" title="Acquisition" />

      {current ? (
        <AcquisitionBudget progress={current} />
      ) : (
        <Card className="mb-8">
          <EmptyState>
            No target window covers today, so there is nothing to budget against. Set one under{" "}
            <Link href="/targets" className="font-semibold text-[var(--accent-strong)]">
              Targets
            </Link>
            .
          </EmptyState>
        </Card>
      )}

      <ConnectLedger position={position} purchases={(purchaseRows ?? []) as ConnectPurchase[]} />

      {days.length > 0 && (
        <Card className="mb-8">
          <CardHeader title="By day" hint={`Last ${days.length} days with activity`} />
          <Table>
            <thead>
              <tr>
                <Th>Day</Th>
                <Th>Proposals</Th>
                <Th>Connects</Th>
                <Th>Cost</Th>
                <Th>Won</Th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr
                  key={day.day}
                  className="hover:bg-[var(--surface-1)] transition-colors duration-150"
                >
                  <Td className="whitespace-nowrap text-[13px] text-[var(--ink-500)]">
                    {formatDay(day.day)}
                  </Td>
                  <Td className="[font-variant-numeric:tabular-nums]">{day.proposals}</Td>
                  <Td className="[font-variant-numeric:tabular-nums]">
                    {day.connects_spent}
                    {day.connects_refunded > 0 && (
                      <span className="ml-1.5 text-[12px] text-[var(--mint-700)]">
                        −{day.connects_refunded} back
                      </span>
                    )}
                  </Td>
                  <Td className="font-semibold text-[var(--ink-800)] [font-variant-numeric:tabular-nums]">
                    {formatMoney(day.connects_cost_inr)}
                  </Td>
                  <Td className="[font-variant-numeric:tabular-nums]">
                    {day.won > 0 ? day.won : <span className="text-[var(--ink-100)]">—</span>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <ProposalLog
        proposals={(proposalRows ?? []) as Proposal[]}
        people={people}
        ratePaise={position.rate_inr}
      />
    </Shell>
  );
}
