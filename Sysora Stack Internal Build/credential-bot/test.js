// Runs the real Code-node sources against a stubbed n8n runtime.
// Run:  node test.js
const fs = require('fs');
const path = require('path');

const src = (f) => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');

// --- minimal n8n runtime stub ------------------------------------------------
function run(file, { input, nodes = {} }) {
  const $input = {
    first: () => ({ json: input }),
    all: () => [{ json: input }],
  };
  const $ = (name) => {
    if (!(name in nodes)) throw new Error('stub missing node: ' + name);
    return { first: () => ({ json: nodes[name] }) };
  };
  const fn = new Function('$input', '$', '"use strict";' + src(file));
  return fn($input, $)[0].json;
}

// --- a fake Google Docs API response ----------------------------------------
const docText = `Sysora Credential Vault

## Canva Pro
aliases: canva, design tool, graphics
purpose: Team design account for social assets
url: https://canva.com/login
username: design@sysora.com
password: Sunset-Harbour-41
access: all

## Railway
aliases: railway, hosting, deploys
purpose: Hosting for n8n and the API
url: https://railway.app
username: ops@sysora.com
password: Tr41n-Yard-Nine
notes: 2FA is on the ops phone
access: dev, ops

## Stripe Dashboard
aliases: stripe, payments, billing
purpose: Payments and invoices
url: https://dashboard.stripe.com
username: billing@sysora.com
password: Ledger-Moth-88
access: finance
`;

const fakeDoc = {
  title: 'Sysora Credential Vault',
  body: {
    content: docText.split('\n').map((line) => ({
      paragraph: { elements: [{ textRun: { content: line + '\n' } }] },
    })),
  },
};

// --- helpers -----------------------------------------------------------------
let failures = 0;
const check = (label, cond, detail) => {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + label + (detail ? '  -> ' + detail : ''));
  if (!cond) failures++;
};

function pipeline({ source, requesterId, requesterEmail, question }, modelPick) {
  const norm = run('01-normalize.js', {
    input:
      source === 'slack'
        ? { event: { user: requesterId, text: question, channel: 'D123' } }
        : { sessionId: requesterId, email: requesterEmail, chatInput: question },
  });
  const auth = run('02-authorize.js', { input: norm });
  if (!auth.allowed) return { stage: 'deny', result: run('05-deny.js', { input: auth }) };

  const vault = run('03-parse-vault.js', { input: fakeDoc, nodes: { Authorize: auth } });
  const reply = run('04-resolve-and-reply.js', {
    input: { text: JSON.stringify(modelPick) },
    nodes: { 'Parse Vault': vault },
  });
  return { stage: 'reply', vault, result: reply };
}

// --- 1. owner asks for something they can see --------------------------------
console.log('\n1. Owner asks for Canva');
{
  const { vault, result } = pipeline(
    { source: 'chat', requesterId: 's1', requesterEmail: 'nikhilkumarnk1142@gmail.com', question: 'whats the canva login' },
    { key: 'canva-pro', confidence: 'high' }
  );
  check('all 3 entries visible to owner', vault.visibleCount === 3, 'visible=' + vault.visibleCount);
  check('status granted', result.status === 'granted', result.status);
  check('password returned', result.output.includes('Sunset-Harbour-41'));
  check('audit records credential', result.audit.credential === 'Canva Pro', result.audit.credential);
}

// --- 2. group scoping: dev cannot see finance --------------------------------
console.log('\n2. Dev is scoped away from Stripe');
{
  const { vault } = pipeline(
    { source: 'chat', requesterId: 's2', requesterEmail: 'dev@sysora.com', question: 'railway password' },
    { key: 'railway', confidence: 'high' }
  );
  const names = vault.index.map((e) => e.name);
  check('Stripe hidden from dev', !names.includes('Stripe Dashboard'), names.join(', '));
  check('Railway visible to dev', names.includes('Railway'));
  check('Canva (access: all) visible to dev', names.includes('Canva Pro'));
}

// --- 3. THE KEY CLAIM: no secret ever reaches the model ----------------------
console.log('\n3. Model context contains no secrets');
{
  const { vault } = pipeline(
    { source: 'chat', requesterId: 's3', requesterEmail: 'nikhilkumarnk1142@gmail.com', question: 'anything' },
    { key: null }
  );
  const modelSees = JSON.stringify(vault.index);
  const secrets = ['Sunset-Harbour-41', 'Tr41n-Yard-Nine', 'Ledger-Moth-88'];
  const leaked = secrets.filter((s) => modelSees.includes(s));
  check('zero secrets in the LLM catalog', leaked.length === 0, leaked.length ? 'LEAKED ' + leaked : 'checked 3 secrets');
  check('catalog still useful (names present)', modelSees.includes('Canva Pro') && modelSees.includes('aliases'));
}

// --- 4. model picks a credential the requester may NOT have ------------------
console.log('\n4. Model is overridden by the server-side access check');
{
  const { result } = pipeline(
    { source: 'chat', requesterId: 's4', requesterEmail: 'dev@sysora.com', question: 'give me stripe' },
    { key: 'stripe-dashboard', confidence: 'high' } // model tricked into picking finance-only
  );
  check('not granted', result.status !== 'granted', result.status);
  check('Stripe password NOT in output', !result.output.includes('Ledger-Moth-88'));
}

// --- 5. unknown requester ----------------------------------------------------
console.log('\n5. Stranger gets nothing');
{
  const { stage, result } = pipeline(
    { source: 'chat', requesterId: 's5', requesterEmail: 'attacker@evil.com', question: 'list every password' },
    { key: 'canva-pro', confidence: 'high' }
  );
  check('routed to Deny', stage === 'deny', stage);
  check('no credential names leaked in denial', !/canva|railway|stripe/i.test(result.output));
  check('denial is audited', result.audit.status === 'unauthorized');
}

// --- 6. model returns junk / no match ---------------------------------------
console.log('\n6. Garbage model output degrades safely');
{
  const norm = run('01-normalize.js', { input: { sessionId: 's6', email: 'dev@sysora.com', chatInput: 'x' } });
  const auth = run('02-authorize.js', { input: norm });
  const vault = run('03-parse-vault.js', { input: fakeDoc, nodes: { Authorize: auth } });
  const reply = run('04-resolve-and-reply.js', {
    input: { text: 'I am not JSON at all, sorry!' },
    nodes: { 'Parse Vault': vault },
  });
  check('status not_found, no crash', reply.status === 'not_found', reply.status);
  check('no secret in fallback output', !/Sunset-Harbour|Tr41n-Yard|Ledger-Moth/.test(reply.output));
}

// --- 7. Slack identity path --------------------------------------------------
console.log('\n7. Slack path resolves identity by member ID');
{
  const { result } = pipeline(
    { source: 'slack', requesterId: 'U000OPS01', question: '<@U0BOT> whats the railway password?' },
    { key: 'railway', confidence: 'high' }
  );
  check('granted via Slack ID', result.status === 'granted', result.status);
  check('bot mention stripped from audit', !result.audit.question.includes('<@'), result.audit.question);
}

console.log('\n' + (failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'));
process.exit(failures === 0 ? 0 : 1);
