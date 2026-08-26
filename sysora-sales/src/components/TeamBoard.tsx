"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Pill,
  Table,
  Td,
  Th,
  inputClass,
} from "@/components/ui";
import { linkLoginToProfile, setProfileMetrics } from "@/lib/admin/activity-actions";
import { profileRoleLabel, type Profile, type Staff, type WorkMetric } from "@/lib/admin/types";

/**
 * People, what they report on, and which login belongs to whom.
 *
 * The person is the employee record — it has their org, their manager
 * and their start date. A dashboard login is something a person may or
 * may not have, so it hangs off the profile rather than being a second
 * idea of who works here.
 *
 * Two authentication systems still exist underneath: the EMS signs in
 * through Supabase Auth, this app through its own table. Linking them
 * here is what stops them drifting until they are merged.
 */
export function TeamBoard({
  profiles,
  metrics,
  assignments,
  logins,
}: {
  profiles: Profile[];
  metrics: WorkMetric[];
  /** Profile id → metric ids they report on. */
  assignments: Record<string, string[]>;
  logins: (Staff & { profile_id: string | null })[];
}) {
  const linkedProfileIds = new Set(logins.map((l) => l.profile_id).filter(Boolean) as string[]);
  const bdeCount = profiles.filter((p) => p.role === "bde").length;

  return (
    <div className="flex flex-col gap-6">
      {bdeCount === 0 && (
        <p className="m-0 px-4 py-3 rounded-[10px] bg-[var(--warning-bg)] border-[1.5px] border-[var(--warning-border)] text-[13px] leading-[1.7] text-[var(--warning)]">
          <span className="font-semibold">Nobody is marked BDE yet.</span> Sales targets count
          activity from BDE profiles only, so bid and Connect numbers will read zero until someone
          has that role. Set it in the EMS, where employee records are managed.
        </p>
      )}

      <Card>
        <CardHeader title="People" hint={`${profiles.length} on the team`} />
        {profiles.length === 0 ? (
          <EmptyState>No employee records yet.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Person</Th>
                <Th>Job</Th>
                <Th>Reports on</Th>
                <Th>Dashboard login</Th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <PersonRow
                  key={profile.id}
                  profile={profile}
                  metrics={metrics}
                  selected={assignments[profile.id] ?? []}
                  login={logins.find((l) => l.profile_id === profile.id) ?? null}
                />
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Logins not yet matched to a person"
          hint={`${logins.filter((l) => !l.profile_id).length} unlinked`}
        />
        <div className="px-6 py-5">
          <p className="m-0 mb-4 max-w-[74ch] text-[13.5px] leading-[1.7] text-[var(--ink-400)]">
            A login has to belong to somebody before their end-of-day numbers can count toward a
            target. None matched an employee record by email, so this is a decision rather than
            something the system can work out.
          </p>

          {logins.filter((l) => !l.profile_id).length === 0 ? (
            <p className="m-0 text-[14px] text-[var(--mint-700)]">
              Every login belongs to somebody.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {logins
                .filter((l) => !l.profile_id)
                .map((login) => (
                  <LinkRow
                    key={login.id}
                    login={login}
                    profiles={profiles.filter((p) => !linkedProfileIds.has(p.id))}
                  />
                ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function PersonRow({
  profile,
  metrics,
  selected,
  login,
}: {
  profile: Profile;
  metrics: WorkMetric[];
  selected: string[];
  login: (Staff & { profile_id: string | null }) | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const has = new Set(selected);

  function toggle(metricId: string, on: boolean) {
    setError(null);
    startTransition(async () => {
      const next = on ? [...selected, metricId] : selected.filter((id) => id !== metricId);
      const result = await setProfileMetrics(profile.id, next);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  return (
    <tr className="hover:bg-[var(--surface-1)] transition-colors duration-150">
      <Td>
        <span className="block font-semibold text-[var(--ink-800)]">
          {profile.full_name ?? profile.email}
        </span>
        <span className="block text-[12.5px] text-[var(--ink-300)]">{profile.email}</span>
        {!profile.is_active && (
          <span className="block text-[12px] text-[var(--ink-200)]">Deactivated</span>
        )}
      </Td>
      <Td>
        <Pill tone={profile.role === "bde" ? "mint" : "slate"}>
          {profileRoleLabel(profile.role)}
        </Pill>
      </Td>
      <Td>
        {metrics.length === 0 ? (
          <span className="text-[13px] text-[var(--ink-100)]">No metrics yet</span>
        ) : (
          <div className="flex flex-col gap-[6px] min-w-[170px]">
            {metrics.map((metric) => (
              <label
                key={metric.id}
                className="flex items-center gap-2 text-[13px] text-[var(--ink-600)]"
              >
                <input
                  type="checkbox"
                  className="accent-[var(--accent)]"
                  checked={has.has(metric.id)}
                  disabled={pending}
                  onChange={(e) => toggle(metric.id, e.target.checked)}
                />
                {metric.label}
              </label>
            ))}
          </div>
        )}
        {error && (
          <p role="alert" className="mt-1 mb-0 text-[12.5px] text-[var(--danger-600)]">
            {error}
          </p>
        )}
      </Td>
      <Td className="text-[13px]">
        {login ? (
          <span className="text-[var(--ink-600)]">{login.email}</span>
        ) : (
          <span className="text-[var(--ink-100)]">None</span>
        )}
      </Td>
    </tr>
  );
}

function LinkRow({
  login,
  profiles,
}: {
  login: Staff & { profile_id: string | null };
  profiles: Profile[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [choice, setChoice] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="min-w-[240px] text-[13.5px] font-semibold text-[var(--ink-800)]">
        {login.email}
      </span>
      <select
        className={`${inputClass} w-auto min-w-[220px]`}
        value={choice}
        onChange={(e) => setChoice(e.target.value)}
      >
        <option value="">Belongs to…</option>
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.full_name ?? profile.email}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending || !choice}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await linkLoginToProfile(login.id, choice);
            if (result.ok) router.refresh();
            else setError(result.error);
          })
        }
      >
        {pending ? "Linking…" : "Link"}
      </Button>
      {error && (
        <span role="alert" className="text-[12.5px] text-[var(--danger-600)]">
          {error}
        </span>
      )}
    </div>
  );
}
