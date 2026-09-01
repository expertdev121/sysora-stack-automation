"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { formatDay } from "@/components/TargetProgress";
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
  labelClass,
} from "@/components/ui";
import {
  deleteProposal,
  saveProposal,
  setProposalOutcome,
} from "@/lib/admin/acquisition-actions";
import { formatMoney } from "@/lib/money";
import {
  PROPOSAL_OUTCOME_LABELS,
  PROPOSAL_OUTCOME_TONE,
  type Profile,
  type Proposal,
  type ProposalOutcome,
} from "@/lib/admin/types";

const OUTCOMES = Object.keys(PROPOSAL_OUTCOME_LABELS) as ProposalOutcome[];

/**
 * Every job bid on, and what it cost.
 *
 * This is the only record of connects being spent — the daily count and the
 * bid count are read from here rather than typed again into an end-of-day
 * report. One entry, two numbers, no chance of them disagreeing.
 */
export function ProposalLog({
  proposals,
  people,
  ratePaise,
}: {
  proposals: Proposal[];
  people: Pick<Profile, "id" | "full_name" | "email">[];
  /** Paise per connect, for costing a row. Null before any purchase. */
  ratePaise: number | null;
}) {
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return proposals;
    return proposals.filter((p) => {
      const hay = `${p.job_title} ${p.client_name ?? ""} ${p.notes ?? ""} ${
        PROPOSAL_OUTCOME_LABELS[p.outcome]
      }`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [proposals, query]);

  const netConnects = filtered.reduce(
    (sum, p) => sum + p.connects_spent - p.connects_refunded,
    0,
  );

  return (
    <Card>
      <CardHeader
        title="Proposals"
        action={
          <span className="flex flex-wrap items-center gap-3">
            <span className="text-[12.5px] text-[var(--ink-300)]">
              {filtered.length} {filtered.length === 1 ? "job" : "jobs"} · {netConnects} connects
              {ratePaise !== null && ` · ${formatMoney(Math.round(netConnects * ratePaise))}`}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setAdding((v) => !v)}>
              {adding ? "Cancel" : "Log a proposal"}
            </Button>
          </span>
        }
      />

      {adding && <ProposalForm people={people} onDone={() => setAdding(false)} />}

      <div className="px-6 pt-5">
        <input
          className={`${inputClass} max-w-[380px]`}
          type="search"
          placeholder="Search job, client, note…"
          aria-label="Search proposals"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState>
          {proposals.length === 0
            ? "No proposals logged yet. Log one and the connects come off the balance."
            : `Nothing matches “${query.trim()}”.`}
        </EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Sent</Th>
              <Th>Job</Th>
              <Th>Client</Th>
              <Th>Connects</Th>
              <Th>Cost</Th>
              <Th>Outcome</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((proposal) => (
              <ProposalRow key={proposal.id} proposal={proposal} ratePaise={ratePaise} />
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}

function todayISO(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function ProposalForm({
  people,
  onDone,
}: {
  people: Pick<Profile, "id" | "full_name" | "email">[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [submittedOn, setSubmittedOn] = useState(todayISO());
  const [jobTitle, setJobTitle] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [clientName, setClientName] = useState("");
  const [connectsSpent, setConnectsSpent] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [notes, setNotes] = useState("");

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveProposal({
        submittedOn,
        jobTitle,
        jobUrl,
        clientName,
        connectsSpent: Number(connectsSpent || 0),
        connectsRefunded: 0,
        outcome: "sent",
        submittedBy: submittedBy || null,
        notes,
      });
      if (result.ok) {
        onDone();
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mx-6 mt-5 rounded-[10px] border-[1.5px] border-[var(--border-default)] bg-[var(--surface-1)] p-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Date">
          <input
            className={`${inputClass} w-[150px]`}
            type="date"
            value={submittedOn}
            max={todayISO()}
            onChange={(e) => setSubmittedOn(e.target.value)}
          />
        </Field>

        <Field label="Job">
          <input
            className={`${inputClass} w-[260px]`}
            autoFocus
            placeholder="Shopify automation build"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </Field>

        <Field label="Connects">
          <input
            className={`${inputClass} w-[100px]`}
            inputMode="numeric"
            placeholder="12"
            value={connectsSpent}
            onChange={(e) => setConnectsSpent(e.target.value)}
          />
        </Field>

        <Field label="Client (if known)">
          <input
            className={`${inputClass} w-[170px]`}
            placeholder="optional"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </Field>

        <Field label="Who bid">
          <select
            className={`${inputClass} w-[170px]`}
            value={submittedBy}
            onChange={(e) => setSubmittedBy(e.target.value)}
          >
            <option value="">Not recorded</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name ?? person.email}
              </option>
            ))}
          </select>
        </Field>

        <Button size="sm" disabled={pending || !jobTitle.trim()} onClick={save}>
          {pending ? "Saving…" : "Log it"}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <Field label="Job link">
          <input
            className={`${inputClass} w-[340px]`}
            type="url"
            placeholder="https://www.upwork.com/jobs/…"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
          />
        </Field>
        <Field label="Note">
          <input
            className={`${inputClass} w-[280px]`}
            placeholder="optional"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
      </div>

      {error && (
        <p role="alert" className="mt-2 mb-0 text-[12.5px] text-[var(--danger-600)]">
          {error}
        </p>
      )}
    </div>
  );
}

function ProposalRow({
  proposal,
  ratePaise,
}: {
  proposal: Proposal;
  ratePaise: number | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const net = proposal.connects_spent - proposal.connects_refunded;

  return (
    <tr className="hover:bg-[var(--surface-1)] transition-colors duration-150">
      <Td className="whitespace-nowrap text-[13px] text-[var(--ink-500)]">
        {formatDay(proposal.submitted_on)}
      </Td>

      <Td>
        {proposal.job_url ? (
          <a
            href={proposal.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--accent-strong)] no-underline hover:underline"
          >
            {proposal.job_title}
          </a>
        ) : (
          <span className="font-semibold text-[var(--ink-800)]">{proposal.job_title}</span>
        )}
        {proposal.notes && (
          <span className="block max-w-[42ch] truncate text-[12px] text-[var(--ink-300)]">
            {proposal.notes}
          </span>
        )}
      </Td>

      <Td className="text-[13px] text-[var(--ink-500)]">{proposal.client_name ?? "—"}</Td>

      <Td className="whitespace-nowrap [font-variant-numeric:tabular-nums]">
        <span className="font-semibold text-[var(--ink-800)]">{proposal.connects_spent}</span>
        {proposal.connects_refunded > 0 && (
          <span className="block text-[12px] text-[var(--mint-700)]">
            {proposal.connects_refunded} back
          </span>
        )}
      </Td>

      <Td className="whitespace-nowrap text-[13px] text-[var(--ink-600)] [font-variant-numeric:tabular-nums]">
        {ratePaise === null ? "—" : formatMoney(Math.round(net * ratePaise))}
      </Td>

      <Td>
        <select
          aria-label={`Outcome for ${proposal.job_title}`}
          className={`${inputClass} w-[140px] h-[34px] py-0 text-[13px]`}
          value={proposal.outcome}
          disabled={pending}
          onChange={(e) =>
            startTransition(async () => {
              await setProposalOutcome(proposal.id, e.target.value as ProposalOutcome);
              router.refresh();
            })
          }
        >
          {OUTCOMES.map((outcome) => (
            <option key={outcome} value={outcome}>
              {PROPOSAL_OUTCOME_LABELS[outcome]}
            </option>
          ))}
        </select>
      </Td>

      <Td>
        <div className="flex items-center gap-2">
          <Pill tone={PROPOSAL_OUTCOME_TONE[proposal.outcome]}>
            {PROPOSAL_OUTCOME_LABELS[proposal.outcome]}
          </Pill>
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await deleteProposal(proposal.id);
                router.refresh();
              })
            }
          >
            Delete
          </Button>
        </div>
      </Td>
    </tr>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[4px]">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}
