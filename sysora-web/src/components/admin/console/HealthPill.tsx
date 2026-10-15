import type { ClientHealth } from "@/lib/admin/console";

/**
 * One colour vocabulary for account health, shared by the overview's
 * attention list and the client table so a client cannot look urgent in
 * one place and fine in the other.
 */
const TONE: Record<ClientHealth, { bg: string; fg: string }> = {
  Healthy: { bg: "#F0FAF6", fg: "#00A87E" },
  "Low balance": { bg: "#FFF4E5", fg: "#C2410C" },
  Expiring: { bg: "#FFF4E5", fg: "#C2410C" },
  "Used up": { bg: "#F7F9F7", fg: "#475569" },
  "Payment failed": { bg: "#FBEDEA", fg: "#B4472F" },
};

export function HealthPill({ health }: { health: ClientHealth }) {
  const tone = TONE[health];
  return (
    <span
      className="inline-flex items-center rounded-full px-[10px] py-[3px] text-[12px] font-semibold"
      style={{ background: tone.bg, color: tone.fg }}
    >
      {health}
    </span>
  );
}

const TICKET_TONE: Record<string, { bg: string; fg: string; label: string }> = {
  open: { bg: "#FFF4E5", fg: "#C2410C", label: "Open" },
  in_progress: { bg: "#F0FAF6", fg: "#00A87E", label: "In progress" },
  waiting_on_client: { bg: "#EEF6EF", fg: "#3E6B4F", label: "Waiting on client" },
  resolved: { bg: "#F7F9F7", fg: "#475569", label: "Resolved" },
};

export function TicketPill({ status }: { status: string }) {
  const tone = TICKET_TONE[status] ?? TICKET_TONE.open;
  return (
    <span
      className="inline-flex items-center rounded-full px-[10px] py-[3px] text-[12px] font-semibold"
      style={{ background: tone.bg, color: tone.fg }}
    >
      {tone.label}
    </span>
  );
}

export const STAGE_LABELS: Record<string, string> = {
  new: "New",
  scoping: "Scoping",
  proposal_sent: "Proposal sent",
  approved: "Approved",
};
