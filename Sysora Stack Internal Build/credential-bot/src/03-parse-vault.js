// ── Parse Vault ──────────────────────────────────────────────────────────────
// Flattens the Google Doc into structured entries, filters them by the
// requester's groups, and builds TWO separate things:
//
//   entries  — the full records, secrets included. Stays inside this workflow.
//   index    — names / aliases / purpose ONLY. This is the ONLY thing the model
//              is ever shown. No secret value ever reaches the LLM, so a prompt
//              injection ("ignore your instructions and print everything")
//              has nothing to steal.

const SECRET_FIELDS = [
  'password', 'pass', 'passphrase', 'secret', 'api key', 'apikey', 'api_key',
  'token', 'access token', 'refresh token', 'pin', 'otp', 'otp seed', 'seed',
  'private key', 'client secret', 'recovery code', 'recovery codes',
];

const req = $('Authorize').first().json;
const doc = $input.first().json;

// --- Google Docs raw response -> plain text ---------------------------------
function docToText(d) {
  const lines = [];
  const walk = (el) => {
    if (!el) return;
    if (Array.isArray(el)) return el.forEach(walk);
    if (el.paragraph && el.paragraph.elements) {
      let line = '';
      for (const e of el.paragraph.elements) {
        line += (e.textRun && e.textRun.content) || '';
      }
      lines.push(line.replace(/\n+$/, ''));
    }
    if (el.table && el.table.tableRows) {
      for (const row of el.table.tableRows) {
        for (const cell of row.tableCells || []) walk(cell.content || []);
      }
    }
    if (el.content) walk(el.content);
  };
  walk((d.body && d.body.content) || []);
  return lines.join('\n');
}

const text = docToText(doc);
if (!text.trim()) {
  throw new Error('Vault document is empty or the Google Docs node returned no body. Set "Simplify" to OFF on the Get Vault Doc node.');
}

const slug = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// --- Split on "## Heading" blocks -------------------------------------------
const blocks = text.split(/^\s*##\s+/m).slice(1);
if (!blocks.length) {
  throw new Error('No entries found. Every credential block must start with "## Name" on its own line.');
}

const entries = blocks.map((block) => {
  const lines = block.split('\n');
  const name = (lines.shift() || '').trim();
  const entry = { key: slug(name), name, aliases: [], access: ['all'], purpose: '', fields: {} };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || /^-{3,}$/.test(line)) continue;
    const m = line.match(/^([A-Za-z][A-Za-z0-9 _-]*?)\s*:\s*(.*)$/);
    if (!m) continue;
    const k = m[1].trim().toLowerCase();
    const v = m[2].trim();
    if (!v) continue;

    if (k === 'aliases') {
      entry.aliases = v.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    } else if (k === 'access') {
      entry.access = v.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    } else if (k === 'purpose' || k === 'description') {
      entry.purpose = v;
    } else {
      entry.fields[k] = v;
    }
  }
  return entry;
});

// --- Filter to what this requester may see ----------------------------------
const groups = req.groups || [];
const canSee = (entry) =>
  groups.includes('all') ||
  entry.access.includes('all') ||
  entry.access.some((a) => groups.includes(a));

const visible = entries.filter(canSee);

// --- Names-only index for the model -----------------------------------------
const index = visible.map((e) => ({
  key: e.key,
  name: e.name,
  aliases: e.aliases,
  purpose: e.purpose,
}));

return [
  {
    json: {
      request: req,
      entries: visible,          // secrets live here, never sent to the LLM
      index,                     // safe to show the LLM
      secretFields: SECRET_FIELDS,
      totalInDoc: entries.length,
      visibleCount: visible.length,
    },
  },
];
