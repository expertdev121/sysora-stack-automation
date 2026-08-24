import type { Metadata } from "next";

import { Shell } from "@/components/Shell";
import { Card, CardHeader, EmptyState, PageHeading, Pill, Table, Td, Th } from "@/components/ui";
import { requireOwner } from "@/lib/admin/auth";
import { ROLE_LABELS, type ActivityType, type Staff } from "@/lib/admin/types";
import { salesDb } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Team" };

/**
 * Read-only here on purpose.
 *
 * Accounts, roles and invitations are set in one place — the marketing
 * site's dashboard — because two apps that can both create logins is
 * two places to get it wrong. This page answers "who can see this and
 * what do they report on", which is the question you have while looking
 * at the numbers.
 */
export default async function TeamPage() {
  const session = await requireOwner();
  const db = salesDb();

  const [{ data: staff }, { data: types }, { data: assigned }] = await Promise.all([
    db.from("users").select("*").order("created_at"),
    db
      .from("activity_types")
      .select("id, slug, label, question, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order"),
    db.from("user_activities").select("user_id, activity_type_id"),
  ]);

  const people = (staff ?? []) as Staff[];
  const activities = (types ?? []) as ActivityType[];

  const assignments: Record<string, string[]> = {};
  for (const row of (assigned ?? []) as { user_id: string; activity_type_id: string }[]) {
    (assignments[row.user_id] ??= []).push(row.activity_type_id);
  }

  return (
    <Shell session={session}>
      <PageHeading eyebrow="Who sees this" title="Team" />
      <p className="mt-[-16px] mb-8 max-w-[72ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
        Managers and owners can open this app; admins and BDEs can&apos;t. Accounts, roles and
        activity assignments are managed in the main dashboard — one place to create a login is
        one place to get it wrong.
      </p>

      <Card>
        <CardHeader title="Accounts" hint={`${people.length}`} />
        {people.length === 0 ? (
          <EmptyState>Nobody yet.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Reports on</Th>
                <Th>Sees this app</Th>
              </tr>
            </thead>
            <tbody>
              {people.map((member) => {
                const mine = assignments[member.id] ?? [];
                const canSee = member.role === "manager" || member.role === "owner";
                return (
                  <tr key={member.id}>
                    <Td className="font-semibold text-[var(--ink-800)]">
                      {member.full_name ?? "—"}
                      {member.id === session.userId && (
                        <span className="ml-2 text-[12px] font-normal text-[var(--ink-300)]">
                          you
                        </span>
                      )}
                    </Td>
                    <Td className="text-[13px]">{member.email ?? "—"}</Td>
                    <Td>
                      <Pill tone={canSee ? "mint" : "slate"}>{ROLE_LABELS[member.role]}</Pill>
                    </Td>
                    <Td>
                      {mine.length === 0 ? (
                        <span className="text-[13px] text-[var(--ink-100)]">Nothing</span>
                      ) : (
                        <div className="flex flex-wrap gap-[6px]">
                          {mine.map((id) => {
                            const type = activities.find((a) => a.id === id);
                            return type ? (
                              <Pill key={id} tone="slate">
                                {type.label}
                              </Pill>
                            ) : null;
                          })}
                        </div>
                      )}
                    </Td>
                    <Td className="text-[13px]">
                      {!member.is_active ? (
                        <span className="text-[var(--ink-300)]">Deactivated</span>
                      ) : canSee ? (
                        <span className="font-semibold text-[var(--mint-700)]">Yes</span>
                      ) : (
                        <span className="text-[var(--ink-300)]">No</span>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </Shell>
  );
}
