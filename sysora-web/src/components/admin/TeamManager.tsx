"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  Card,
  CardHeader,
  EmptyState,
  Pill,
  Table,
  Td,
  Th,
  inputClass,
  labelClass,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { inviteStaff, setStaffActive, setStaffRole } from "@/lib/admin/actions";
import { setUserActivities } from "@/lib/admin/activity-actions";
import {
  ROLE_HINTS,
  ROLE_LABELS,
  type ActivityType,
  type Staff,
  type StaffRole,
} from "@/lib/admin/types";

export function TeamManager({
  staff,
  activityTypes,
  assignments,
  currentUserId,
}: {
  staff: Staff[];
  /** Live lead measures, so a person can be put on one. */
  activityTypes: ActivityType[];
  /** User id → the activity type ids they're responsible for. */
  assignments: Record<string, string[]>;
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<StaffRole>("admin");

  const run = (work: () => Promise<{ ok: boolean; error?: string }>, message?: string) =>
    startTransition(async () => {
      setError(null);
      setNotice(null);
      const result = await work();
      if (!result.ok) setError(result.error ?? "That didn't work.");
      else {
        if (message) setNotice(message);
        router.refresh();
      }
    });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title="Invite a teammate" />
        <div className="flex flex-wrap items-end gap-3 px-6 py-5">
          <div className="flex flex-col gap-[6px] flex-1 min-w-[220px]">
            <label className={labelClass}>Email</label>
            <input
              className={inputClass}
              type="email"
              value={email}
              placeholder="teammate@sysora.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-[6px] flex-1 min-w-[180px]">
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              value={fullName}
              placeholder="Jane Doe"
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-[6px] min-w-[160px]">
            <label className={labelClass}>Role</label>
            <select
              className={inputClass}
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
            >
              {(Object.keys(ROLE_LABELS) as StaffRole[]).map((value) => (
                <option key={value} value={value}>
                  {ROLE_LABELS[value]}
                </option>
              ))}
            </select>
            <span className="text-[12px] leading-[1.5] text-[var(--ink-300)]">
              {ROLE_HINTS[role]}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            disabled={pending || !email.trim()}
            onClick={() =>
              run(async () => {
                const result = await inviteStaff(email, role, fullName);
                if (result.ok) {
                  setEmail("");
                  setFullName("");
                }
                return result;
              }, `Invite sent to ${email.trim()}.`)
            }
          >
            {pending ? "Sending…" : "Send invite"}
          </Button>
        </div>

        {(error || notice) && (
          <div className="px-6 pb-5">
            {error && (
              <p role="alert" className="m-0 text-[13.5px] text-[var(--danger-600)]">
                {error}
              </p>
            )}
            {notice && <p className="m-0 text-[13.5px] text-[var(--mint-700)]">{notice}</p>}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Staff" hint={`${staff.length} account${staff.length === 1 ? "" : "s"}`} />
        {staff.length === 0 ? (
          <EmptyState>Nobody yet.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Reports on</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id}>
                  <Td className="font-semibold text-[var(--ink-800)]">
                    {member.full_name ?? "—"}
                    {member.id === currentUserId && (
                      <span className="ml-2 text-[12px] font-normal text-[var(--ink-300)]">you</span>
                    )}
                  </Td>
                  <Td>{member.email ?? "—"}</Td>
                  <Td>
                    <select
                      className={`${inputClass} w-auto py-[6px]`}
                      value={member.role}
                      disabled={pending}
                      onChange={(e) =>
                        run(() =>
                          setStaffRole(member.id, e.target.value as StaffRole),
                        )
                      }
                    >
                      {(Object.keys(ROLE_LABELS) as StaffRole[]).map((value) => (
                        <option key={value} value={value}>
                          {ROLE_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  </Td>
                  <Td>
                    <ActivityPicker
                      types={activityTypes}
                      selected={assignments[member.id] ?? []}
                      disabled={pending}
                      onChange={(ids) => run(() => setUserActivities(member.id, ids))}
                    />
                  </Td>
                  <Td>
                    {member.is_active ? <Pill tone="mint">Active</Pill> : <Pill tone="slate">Off</Pill>}
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending || member.id === currentUserId}
                      onClick={() => run(() => setStaffActive(member.id, !member.is_active))}
                    >
                      {member.is_active ? "Deactivate" : "Reactivate"}
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

/**
 * Which lead measures a person is responsible for.
 *
 * Checkboxes rather than a multi-select because the list is short and
 * the answer has to be readable at a glance from the row — this is the
 * column that decides what somebody is asked every evening.
 */
function ActivityPicker({
  types,
  selected,
  disabled,
  onChange,
}: {
  types: ActivityType[];
  selected: string[];
  disabled: boolean;
  onChange: (ids: string[]) => void;
}) {
  if (types.length === 0) {
    return <span className="text-[12.5px] text-[var(--ink-100)]">No activities yet</span>;
  }

  const has = new Set(selected);

  return (
    <div className="flex flex-col gap-[6px] min-w-[150px]">
      {types.map((type) => (
        <label key={type.id} className="flex items-center gap-2 text-[13px] text-[var(--ink-600)]">
          <input
            type="checkbox"
            className="accent-[var(--accent)]"
            checked={has.has(type.id)}
            disabled={disabled}
            onChange={(e) =>
              onChange(
                e.target.checked
                  ? [...selected, type.id]
                  : selected.filter((id) => id !== type.id),
              )
            }
          />
          {type.label}
        </label>
      ))}
    </div>
  );
}
