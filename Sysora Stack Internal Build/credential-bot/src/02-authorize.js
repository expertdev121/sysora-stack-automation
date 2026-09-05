// ── Authorize ────────────────────────────────────────────────────────────────
// EDIT THIS LIST. Anyone not on it gets nothing.
//
// groups control WHICH credentials a person can see — matched against the
// "access:" line on each vault entry. Use 'all' sparingly.
//
//   slackId — Slack profile > right-click > Copy member ID. Required for the
//             Slack path, which is the only path with verified identity.
//   email   — used by the chat path. Self-declared, therefore weak.

const ALLOWLIST = [
  { name: 'Nikhil', email: 'nikhilkumarnk1142@gmail.com', slackId: 'U000OWNER', groups: ['all'] },
  { name: 'Example Dev', email: 'dev@sysora.com', slackId: 'U000DEV01', groups: ['dev', 'general'] },
  { name: 'Example Ops', email: 'ops@sysora.com', slackId: 'U000OPS01', groups: ['ops', 'general'] },
];

const req = $input.first().json;

let person = null;
if (req.source === 'slack' && req.requesterId) {
  person = ALLOWLIST.find((p) => p.slackId === req.requesterId) || null;
} else if (req.requesterEmail) {
  person = ALLOWLIST.find((p) => p.email.toLowerCase() === req.requesterEmail) || null;
}

const allowed = Boolean(person);

// Deliberately vague on denial: never reveal whether the person or the
// credential exists, and never hint at what the vault contains.
return [
  {
    json: {
      ...req,
      allowed,
      requesterName: person ? person.name : 'unknown',
      requesterEmail: person ? person.email : req.requesterEmail,
      groups: person ? person.groups : [],
      denyReason: allowed ? null : 'Requester is not on the credential allowlist.',
    },
  },
];
