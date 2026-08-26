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
import { ROLE_HINTS, ROLE_LABELS, type Staff, type StaffRole } from "@/lib/admin/types";

export function TeamManager({
  staff,
  currentUserId,
}: {
  staff: Staff[];
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

