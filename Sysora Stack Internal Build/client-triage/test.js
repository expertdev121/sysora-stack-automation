// Runs the real Code-node sources against a stubbed n8n runtime.
// Run:  node test.js
const fs = require('fs');
const path = require('path');

const src = (f) => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');

const STATIC = {};
function run(file, { input, items, nodes = {} }) {
  const list = items || [{ json: input }];
  const $input = { first: () => list[0], all: () => list };
  const $getWorkflowStaticData = () => STATIC;
  const $ = (name) => {
    if (!(name in nodes)) throw new Error('stub missing node: ' + name);
    return { first: () => ({ json: nodes[name] }) };
  };
  const out = new Function(
    '$input',
    '$',
    '$getWorkflowStaticData',
    '"use strict";' + src(file)
  )($input, $, $getWorkflowStaticData);
  return out.length ? out[0].json : null;
}

let failures = 0;
const check = (label, cond, detail) => {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + label + (detail ? '  -> ' + detail : ''));
  if (!cond) failures++;
};

const CH = 'C0BS56L7V1A';
const msg = (over = {}) => ({
  type: 'message', channel: CH, user: 'U07CPGT5QCU',
  text: 'The DonorHQ page keeps auto-refreshing and I lose my work', ts: '100.1', ...over,
});

// Most checks want a clean dedupe memory; the redelivery check opts out.
const filter = (event) => {
  STATIC.seen = [];
  return run('01-filter-messages.js', { input: event });
};
const filterKeepingMemory = (event) => run('01-filter-messages.js', { input: event });
const parse = (aiJson, ctx) =>
  run('02-parse-intent.js', { input: { text: aiJson }, nodes: { 'Filter Messages': ctx } });
const decide = (hits, ctx) =>
  run('03-decide-action.js', {
    items: hits.length ? hits.map((h) => ({ json: h })) : [{ json: {} }],
    nodes: { 'Parse Intent': ctx },
  });
const statusReply = (comments, ctx) =>
  run('05-status-reply.js', {
    items: comments.length ? comments.map((c) => ({ json: c })) : [{ json: {} }],
    nodes: { 'Decide Action': ctx },
  });

// One Jira search hit, in the shape the Jira node actually returns.
const HIT = {
  key: 'GS-3',
  fields: {
    summary: 'DonorHQ auto-refresh loses in-progress work',
    status: { name: 'In Progress' },
    assignee: { displayName: 'Sean' },
    priority: { name: 'Highest' },
    duedate: '2026-09-01',
    updated: '2026-08-22T09:14:00.000+0000',
  },
};

console.log('\n1. Filter');
{
  check('human message passes', filter(msg()) !== null);
  check('Jira bot post dropped', filter(msg({ bot_id: 'B1' })) === null);
  check('our own reply dropped (loop guard)', filter(msg({ user: 'U0BSVQH51H6' })) === null);
  check('join noise dropped', filter(msg({ subtype: 'channel_join' })) === null);
  check('"ok" too short', filter(msg({ text: 'ok' })) === null);
  const f = filter(msg({ thread_ts: '99.5' }));
  check('replies stay in existing thread', f && f.threadTs === '99.5', f && f.threadTs);
  const g = filter(msg());
  check('top-level msg threads on itself', g && g.threadTs === '100.1', g && g.threadTs);
}

console.log('\n1b. Redelivery (the GS-4 / GS-5 bug)');
{
  STATIC.seen = [];
  const dup = msg({ client_msg_id: '2bb905f1-c5fa-44ea-83b9-57c52306954e' });
  check('first delivery passes', filterKeepingMemory(dup) !== null);
  check('second delivery of same client_msg_id dropped', filterKeepingMemory(dup) === null);
  const other = msg({ client_msg_id: 'a-different-id', ts: '200.2' });
  check('a genuinely different message still passes', filterKeepingMemory(other) !== null);
  check('memory stays bounded', STATIC.seen.length <= 300, 'seen=' + STATIC.seen.length);
}

console.log('\n2. Parse Intent');
const ctxBase = filter(msg());
{
  const p = parse('{"intent":"new_task","issueKey":null,"searchTerms":"donorhq auto refresh losing progress","title":"Fix DonorHQ auto-refresh","description":"Page refreshes unprompted","priority":"High"}', ctxBase);
  check('intent parsed', p.intent === 'new_task', p.intent);
  check('JQL built', p.jql.includes('text ~ "donorhq auto refresh'), p.jql);
  check('priority kept', p.priority === 'High');

  const k = parse('{"intent":"status_request","issueKey":"GS-3","searchTerms":"x"}', ctxBase);
  check('explicit key -> key lookup', k.jql === 'key = GS-3', k.jql);

  const bad = parse('{"intent":"status_request","issueKey":"PROJ-9; DROP","searchTerms":"a"}', ctxBase);
  check('foreign/malformed key rejected', bad.issueKey === null, String(bad.issueKey));

  const inj = parse('{"intent":"new_task","searchTerms":"x\\" OR project = ADMIN OR \\"a"}', ctxBase);
  check('JQL injection neutralised', !inj.jql.includes('"') || inj.jql.split('"').length === 3, inj.jql);
  check('no stray operators survive', !/OR project = ADMIN/.test(inj.jql));

  const junk = parse('sorry, I could not help with that', ctxBase);
  check('non-JSON model output -> other', junk.intent === 'other', junk.intent);
  const evil = parse('{"intent":"delete_everything"}', ctxBase);
  check('unknown intent -> other', evil.intent === 'other', evil.intent);
}

console.log('\n3. Decide Action');
{
  const asNew = parse('{"intent":"new_task","searchTerms":"donorhq refresh","title":"Fix refresh","description":"d"}', ctxBase);
  const asStatus = parse('{"intent":"status_request","issueKey":"GS-3","searchTerms":"donorhq"}', ctxBase);
  const d1 = decide([], asNew);
  check('new + no match -> create', d1.shouldCreate === true);

  const d2 = decide([HIT], asStatus);
  check('status + match -> no create', d2.shouldCreate === false);
  check('normalises the issue fields', d2.matched.status === 'In Progress' && d2.matched.assignee === 'Sean');
  check('carries due date through', d2.matched.duedate === '2026-09-01', d2.matched.duedate);

  const d3 = decide([HIT], asNew);
  check('new + match -> dedupes instead of creating', d3.shouldCreate === false);
  check('flags it as a duplicate report', d3.isDuplicateReport === true);
  check('status request is not flagged duplicate', d2.isDuplicateReport === false);

  const d4 = decide([], asStatus);
  check('status + no match -> creates it', d4.shouldCreate === true);

  const other = parse('{"intent":"other"}', ctxBase);
  check('chit-chat produces no reply at all', decide([], other) === null);
}

console.log('\n5. Status Reply (fields + comments)');
{
  const adf = (t) => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: t }] }] });
  const asStatus = parse('{"intent":"status_request","issueKey":"GS-3","searchTerms":"donorhq"}', ctxBase);
  const ctx = decide([HIT], asStatus);

  const comments = [
    { id: '1', author: { displayName: 'Brandy' }, created: '2026-08-20T10:00:00.000+0000', body: adf('Reproduced on staging') },
    { id: '2', author: { displayName: 'Sean' }, created: '2026-08-21T10:00:00.000+0000', visibility: { type: 'role', value: 'Administrators' }, body: adf('client is on the cheap plan, deprioritise') },
    { id: '3', author: { displayName: 'Sean' }, created: '2026-08-22T10:00:00.000+0000', body: adf('Fix is in review, expect it Monday') },
  ];

  const r = statusReply(comments, ctx);
  check('links the ticket with its summary', r.reply.includes('browse/GS-3|GS-3') && r.reply.includes('DonorHQ auto-refresh'));
  check('shows the live fields', /In Progress/.test(r.reply) && /Sean/.test(r.reply) && /Highest/.test(r.reply));
  check('renders ADF comment bodies as text', r.reply.includes('Fix is in review, expect it Monday'));
  check('INTERNAL restricted comment withheld', !r.reply.includes('deprioritise'), 'visibility-restricted');
  check('counts only visible comments', r.commentCount === 2, 'count=' + r.commentCount);

  const none = statusReply([], ctx);
  check('no comments -> honest placeholder', /No notes on the ticket yet/.test(none.reply));
  check('no comments -> still shows fields', none.reply.includes('In Progress'));

  const dupCtx = decide([HIT], parse('{"intent":"new_task","searchTerms":"donorhq refresh"}', ctxBase));
  const dup = statusReply(comments, dupCtx);
  check('duplicate report explains itself', /not raised a duplicate/.test(dup.reply));
  check('status request does NOT get that line', !/not raised a duplicate/.test(r.reply));

  const long = statusReply(
    [{ id: '9', author: { displayName: 'Bot' }, created: '2026-08-22T10:00:00.000+0000', body: adf('x'.repeat(900)) }],
    ctx
  );
  check('long comment truncated', long.reply.includes('…') && long.reply.length < 900, 'len=' + long.reply.length);
}

console.log('\n4. Created Reply');
{
  const ctx = { ...ctxBase, title: 'Fix DonorHQ auto-refresh' };
  const ok = run('04-created-reply.js', { input: { key: 'GS-12' }, nodes: { 'Decide Action': ctx } });
  check('confirms with link', ok.reply.includes('browse/GS-12|GS-12'));
  check('mentions Ops review', /Ops team at Sysora Stack/.test(ok.reply));
  const bad = run('04-created-reply.js', { input: {}, nodes: { 'Decide Action': ctx } });
  check('no key -> honest failure, no fake ticket', !/GS-/.test(bad.reply), bad.reply.slice(0, 60));
}

console.log('\n' + (failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'));
process.exit(failures === 0 ? 0 : 1);
