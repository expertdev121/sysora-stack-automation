// ── Resolve & Reply ──────────────────────────────────────────────────────────
// Takes the model's chosen KEY and does the actual secret lookup here, in code.
// The access check is re-run server-side — the model's choice is treated as an
// untrusted hint, never as authorization. One entry out, maximum. No bulk dump.

const vault = $('Parse Vault').first().json;
const req = vault.request;
const entries = vault.entries;
const secretFields = vault.secretFields;

// --- Read the model's pick, defensively -------------------------------------
const raw = $input.first().json;
const modelText = String(raw.text || raw.output || raw.response || '').trim();

let pick = { key: null, confidence: 'low', clarify: '' };
try {
  const m = modelText.match(/\{[\s\S]*\}/);
  if (m) pick = { ...pick, ...JSON.parse(m[0]) };
} catch (e) {
  // fall through to the not-found reply
}

const chosen = pick.key ? entries.find((e) => e.key === pick.key) : null;

// --- Re-check access independently of the model -----------------------------
const groups = req.groups || [];
const permitted =
  chosen &&
  (groups.includes('all') ||
    chosen.access.includes('all') ||
    chosen.access.some((a) => groups.includes(a)));

let output;
let status;

if (!chosen || !permitted) {
  status = chosen ? 'denied' : 'not_found';
  const suggestions = vault.index.slice(0, 8).map((e) => e.name).join(', ');
  output = pick.clarify
    ? pick.clarify
    : 'I could not match that to a credential you have access to.' +
      (suggestions ? '\n\nThings I can help with: ' + suggestions : '');
} else {
  status = 'granted';
  const lines = ['*' + chosen.name + '*'];
  for (const [k, v] of Object.entries(chosen.fields)) {
    const label = k.replace(/\b\w/g, (c) => c.toUpperCase());
    lines.push(label + ': ' + v);
  }
  lines.push('');
  lines.push('_Keep this in your password manager. Do not paste it into a channel, ticket, or doc._');
  output = lines.join('\n');
}

// --- Audit record. n8n's own execution log is the backstop; the Google Sheets
// --- node writes the human-readable version.
const audit = {
  at: new Date().toISOString(),
  requester: req.requesterName,
  requesterId: req.requesterId,
  requesterEmail: req.requesterEmail,
  source: req.source,
  question: req.question,
  status,
  credential: chosen ? chosen.name : '(none)',
};

return [{ json: { output, status, audit, replyTo: req.replyTo, secretFieldsUsed: secretFields.length } }];
