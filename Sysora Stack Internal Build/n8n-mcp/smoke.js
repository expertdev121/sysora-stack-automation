// Live smoke test: drives the real MCP server against a real n8n instance.
// Read-only — it lists, audits, explains and probes. It changes nothing.
//
//   N8N_BASE_URL=https://... N8N_API_KEY=... node smoke.js
const { spawn } = require('child_process');
const path = require('path');

if (!process.env.N8N_BASE_URL || !process.env.N8N_API_KEY) {
  console.error('Set N8N_BASE_URL and N8N_API_KEY.');
  process.exit(1);
}

const child = spawn(process.execPath, [path.join(__dirname, 'src', 'index.js')], { stdio: ['pipe', 'pipe', 'inherit'] });
const replies = [];
let buf = '';
child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (line) replies.push(JSON.parse(line));
  }
});

let id = 0;
const rpc = (method, params) => {
  const myId = ++id;
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: myId, method, params }) + '\n');
  return new Promise((res, rej) => {
    const t0 = Date.now();
    const tick = () => {
      const hit = replies.find((r) => r.id === myId);
      if (hit) return res(hit);
      if (Date.now() - t0 > 20000) return rej(new Error('timeout: ' + method));
      setTimeout(tick, 30);
    };
    tick();
  });
};
const callTool = async (name, args) => {
  const r = await rpc('tools/call', { name, arguments: args || {} });
  const text = r.result.content[0].text;
  if (r.result.isError) return { _error: text };
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

(async () => {
  await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {} });

  console.log('\n── n8n_health ──');
  console.log(' ', JSON.stringify(await callTool('n8n_health')));

  console.log('\n── n8n_list_workflows ──');
  const list = await callTool('n8n_list_workflows', {});
  for (const w of list.workflows || []) {
    console.log(
      '  ' + (w.active ? 'ACTIVE  ' : w.archived ? 'archived' : 'inactive') +
      '  ' + w.id + '  ' + w.name + '  (' + w.nodes + ' nodes)'
    );
  }

  const target = (list.workflows || []).find((w) => w.active && !w.archived);
  if (!target) return done();

  console.log('\n── n8n_audit_workflow ' + target.name + ' ──');
  const audit = await callTool('n8n_audit_workflow', { id: target.id });
  console.log('  ready:', audit.ready, '| nodes:', audit.nodeCount);
  for (const p of audit.problems || []) console.log('  PROBLEM  ' + p.kind + ': ' + p.node + ' — ' + p.detail);
  if (!audit.problems.length) console.log('  no problems found');

  const hook = (audit.triggers || []).find((t) => t.webhookId);
  if (hook) {
    console.log('\n── n8n_probe_webhook ' + hook.name + ' ──');
    const probe = await callTool('n8n_probe_webhook', { webhookId: hook.webhookId });
    console.log('  status:', probe.status, '| registered:', probe.registered, '| healthy:', probe.healthy);
    console.log('  ' + probe.meaning);
  }

  console.log('\n── n8n_list_executions ──');
  const ex = await callTool('n8n_list_executions', { workflowId: target.id, limit: 3 });
  for (const e of ex.executions || []) console.log('  #' + e.id + '  ' + e.status + '  ' + e.ms + 'ms  ' + e.startedAt);

  if (ex.executions && ex.executions.length) {
    console.log('\n── n8n_explain_execution #' + ex.executions[0].id + ' ──');
    const d = await callTool('n8n_explain_execution', { id: ex.executions[0].id });
    for (const n of d.nodes || []) {
      console.log('  ' + n.node.padEnd(22) + (n.error ? 'ERROR ' + n.error : n.items + ' item(s)'));
    }
    console.log('  verdict: ' + d.verdict);
  }

  console.log('\n── n8n_credential_schema jiraSoftwareCloudApi ──');
  const sch = await callTool('n8n_credential_schema', { type: 'jiraSoftwareCloudApi' });
  console.log('  fields:', (sch.fields || []).join(', '));

  done();
})().catch((e) => {
  console.error('smoke failed:', e.message);
  child.kill();
  process.exit(1);
});

function done() {
  console.log('\nsmoke complete (read-only, nothing changed)');
  child.kill();
  process.exit(0);
}
