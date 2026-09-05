// Offline tests: pure logic plus a real JSON-RPC handshake against the server
// over a child process. No n8n instance required.
//
//   node test.js
const { spawn } = require('child_process');
const path = require('path');
const { auditWorkflow, digestExecution, mergeWorkflow, interpretProbe } = require('./src/digest');

let failures = 0;
const check = (label, cond, detail) => {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + label + (detail ? '  -> ' + detail : ''));
  if (!cond) failures++;
};

// ── fixtures ────────────────────────────────────────────────────────────────
const wf = {
  id: 'W1',
  name: 'Client Triage',
  active: true,
  nodes: [
    { name: 'Trigger', type: 'n8n-nodes-base.slackTrigger', parameters: {}, webhookId: 'abc-123', credentials: { slackApi: { id: '1', name: 'Slack' } } },
    { name: 'Filter', type: 'n8n-nodes-base.code', parameters: { jsCode: 'return [];' } },
    { name: 'Create Issue', type: 'n8n-nodes-base.jira', parameters: { project: 'PICK_PROJECT_IN_UI' } },
    { name: 'Reply', type: 'n8n-nodes-base.slack', parameters: {}, credentials: { slackApi: { id: '1', name: 'Slack' } } },
    { name: 'Orphan', type: 'n8n-nodes-base.code', parameters: { jsCode: '// nothing points here' } },
    { name: 'Stranded', type: 'n8n-nodes-base.code', parameters: { jsCode: '// fed, but output unused' } },
    { name: 'Model', type: '@n8n/n8n-nodes-langchain.lmChatOpenAi', parameters: {}, credentials: { openAiApi: { id: '9', name: 'OpenAI' } } },
    { name: 'Classify', type: '@n8n/n8n-nodes-langchain.chainLlm', parameters: {} },
  ],
  connections: {
    Trigger: { main: [[{ node: 'Filter', type: 'main', index: 0 }]] },
    Filter: { main: [[{ node: 'Create Issue', type: 'main', index: 0 }]] },
    'Create Issue': { main: [[{ node: 'Reply', type: 'main', index: 0 }, { node: 'Stranded', type: 'main', index: 0 }, { node: 'Classify', type: 'main', index: 0 }]] },
    // AI sub-node: outgoing only, on a non-main connection.
    Model: { ai_languageModel: [[{ node: 'Classify', type: 'ai_languageModel', index: 0 }]] },
  },
};

console.log('\n1. auditWorkflow');
{
  const a = auditWorkflow(wf);
  const kinds = (k) => a.problems.filter((p) => p.kind === k).map((p) => p.node);
  check('not ready while problems exist', a.ready === false);
  check('spots the missing Jira credential', kinds('missing_credential').includes('Create Issue'));
  check('spots the PICK_ placeholder', kinds('placeholder').includes('Create Issue'));
  check('spots the unreachable node', kinds('unreachable').includes('Orphan'), kinds('unreachable').join(','));
  check('spots a transform whose output is unused', kinds('dead_end').includes('Stranded'), kinds('dead_end').join(','));
  check('terminal ACTION node is not a dead end', !kinds('dead_end').includes('Reply'), kinds('dead_end').join(','));
  check('AI sub-node is not called unreachable', !kinds('unreachable').includes('Model'), kinds('unreachable').join(','));
  check('trigger is not called unreachable', !kinds('unreachable').includes('Trigger'));
  check('reports the trigger webhookId', a.triggers[0].webhookId === 'abc-123');

  const clean = auditWorkflow({
    name: 'ok', nodes: [
      { name: 'T', type: 'n8n-nodes-base.webhook', parameters: {} },
      { name: 'C', type: 'n8n-nodes-base.code', parameters: { jsCode: 'return $input.all();' } },
    ],
    connections: { T: { main: [[{ node: 'C', type: 'main', index: 0 }]] }, C: { main: [[{ node: 'T', type: 'main', index: 0 }]] } },
  });
  check('a healthy workflow reports ready', clean.ready === true, JSON.stringify(clean.problems));

  const noTrigger = auditWorkflow({ name: 'x', nodes: [{ name: 'C', type: 'n8n-nodes-base.code', parameters: {} }], connections: {} });
  check('flags a workflow with no trigger', noTrigger.problems.some((p) => p.kind === 'no_trigger'));
}

console.log('\n2. digestExecution — the silent halt');
{
  const exec = {
    id: '12', workflowId: 'W1', status: 'success', mode: 'webhook',
    startedAt: '2026-08-22T21:59:03.000Z', stoppedAt: '2026-08-22T21:59:05.000Z',
    data: { resultData: { lastNodeExecuted: 'Decide Action', runData: {
      Trigger: [{ data: { main: [[{ json: { text: 'hello' } }]] }, executionTime: 5 }],
      Filter: [{ data: { main: [[{ json: { text: 'hello' } }]] }, executionTime: 3 }],
      'Decide Action': [{ data: { main: [[]] }, executionTime: 2 }],
    } } },
  };
  const d = digestExecution(exec);
  check('per-node item counts', d.nodes.find((n) => n.node === 'Filter').items === 1);
  check('detects the 0-item node', d.nodes.find((n) => n.node === 'Decide Action').items === 0);
  check('names where it stopped', /Stopped at "Decide Action"/.test(d.verdict), d.verdict.slice(0, 60));
  check('says it was probably deliberate', /deliberate filtering/.test(d.verdict));
  check('duration computed', d.ms === 2000, String(d.ms));

  const errExec = {
    id: '13', status: 'error', startedAt: '2026-08-22T00:00:00.000Z',
    data: { resultData: { runData: { Jira: [{ error: { message: 'issuetype is required' }, data: {} }] } } },
  };
  const e = digestExecution(errExec);
  check('surfaces node errors', e.nodes[0].error === 'issuetype is required');
  check('verdict points at the error', /node errored/.test(e.verdict));

  const big = digestExecution({
    id: '14', startedAt: '2026-08-22T00:00:00.000Z',
    data: { resultData: { runData: { N: [{ data: { main: [[{ json: { blob: 'y'.repeat(5000), n: 3 } }]] } }] } } },
  });
  check('large values truncated in the sample', big.nodes[0].sample.blob.length < 300, 'len=' + big.nodes[0].sample.blob.length);
  check('small values kept intact', big.nodes[0].sample.n === 3);
}

console.log('\n3. mergeWorkflow — credentials must survive');
{
  const { workflow, changes } = mergeWorkflow(wf, {
    nodes: [
      { name: 'Filter', jsCode: 'return [{json:{ok:true}}];' },
      { name: 'Create Issue', parameters: { project: '10002' } },
    ],
  });
  const byName = (n) => workflow.nodes.find((x) => x.name === n);
  check('code replaced', byName('Filter').parameters.jsCode.includes('ok:true'));
  check('parameter replaced', byName('Create Issue').parameters.project === '10002');
  check('CREDENTIALS PRESERVED', byName('Reply').credentials.slackApi.name === 'Slack');
  check('untouched params kept', byName('Trigger').webhookId === 'abc-123');
  check('changes reported', changes.length === 2, JSON.stringify(changes));

  const added = mergeWorkflow(wf, {
    nodes: [{
      name: 'Get Comments',
      node: { name: 'Get Comments', type: 'n8n-nodes-base.jira', parameters: {}, position: [0, 0] },
      inheritCredentialFrom: 'Reply',
    }],
  });
  const gc = added.workflow.nodes.find((n) => n.name === 'Get Comments');
  check('new node added', Boolean(gc));
  check('new node inherits credential', gc.credentials.slackApi.name === 'Slack');

  const noop = mergeWorkflow(wf, { nodes: [{ name: 'Filter', jsCode: 'return [];' }] });
  check('identical value is not a change', noop.changes.length === 0, JSON.stringify(noop.changes));

  const missing = mergeWorkflow(wf, { nodes: [{ name: 'Ghost', jsCode: 'x' }] });
  check('unknown node without definition is skipped', missing.changes[0].change === 'skipped');

  const orig = JSON.parse(JSON.stringify(wf));
  mergeWorkflow(wf, { nodes: [{ name: 'Filter', jsCode: 'mutated' }] });
  check('input workflow not mutated', JSON.stringify(wf) === JSON.stringify(orig));
}

console.log('\n4. interpretProbe');
{
  check('inactive workflow', interpretProbe(404, '{"message":"The requested webhook is not registered."}').registered === false);
  check('healthy, wrong method', interpretProbe(404, '{"message":"This webhook is not registered for GET requests."}').registered === true);
  check('healthy verdict', interpretProbe(404, 'not registered for GET requests').healthy === true);
  check('401 means signature check', /signing secret/.test(interpretProbe(401, 'Unauthorized').meaning));
  check('401 counts as registered', interpretProbe(401, 'Unauthorized').registered === true);
  check('200 accepted', interpretProbe(200, 'ok').healthy === true);
}

// ── 5. real protocol handshake ──────────────────────────────────────────────
console.log('\n5. MCP protocol over stdio');
(async () => {
  const child = spawn(process.execPath, [path.join(__dirname, 'src', 'index.js')], {
    env: { ...process.env, N8N_BASE_URL: 'http://127.0.0.1:1', N8N_API_KEY: 'x' },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

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

  const send = (o) => child.stdin.write(JSON.stringify(o) + '\n');
  const waitFor = (id, ms = 8000) =>
    new Promise((res, rej) => {
      const t0 = Date.now();
      const tick = () => {
        const hit = replies.find((r) => r.id === id);
        if (hit) return res(hit);
        if (Date.now() - t0 > ms) return rej(new Error('timeout waiting for id ' + id));
        setTimeout(tick, 25);
      };
      tick();
    });

  try {
    send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {} } });
    const init = await waitFor(1);
    check('initialize responds', Boolean(init.result));
    check('echoes protocol version', init.result.protocolVersion === '2025-06-18', init.result.protocolVersion);
    check('advertises tools capability', Boolean(init.result.capabilities.tools));
    check('names itself', init.result.serverInfo.name === 'n8n');

    send({ jsonrpc: '2.0', method: 'notifications/initialized' }); // must not reply

    send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
    const list = await waitFor(2);
    const names = list.result.tools.map((t) => t.name);
    check('lists all tools', names.length === 12, 'n=' + names.length);
    check('every tool has a description', list.result.tools.every((t) => t.description && t.description.length > 20));
    check('every tool has a schema', list.result.tools.every((t) => t.inputSchema && t.inputSchema.type === 'object'));
    check('includes the differentiators', ['n8n_audit_workflow', 'n8n_explain_execution', 'n8n_patch_workflow', 'n8n_probe_webhook'].every((n) => names.includes(n)));

    // Unreachable host: must come back as a readable tool error, not a crash.
    send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'n8n_list_workflows', arguments: {} } });
    const call = await waitFor(3);
    check('network failure -> isError, not a crash', call.result.isError === true);
    check('error text is readable', /Error:/.test(call.result.content[0].text));

    send({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'nope' } });
    const bad = await waitFor(4);
    check('unknown tool rejected', Boolean(bad.error) && /Unknown tool/.test(bad.error.message));

    send({ jsonrpc: '2.0', id: 5, method: 'ping' });
    check('ping answered', Boolean((await waitFor(5)).result));

    check('notification produced no reply', !replies.some((r) => r.id === undefined && r.result));
  } catch (e) {
    check('protocol suite ran', false, e.message);
  }

  child.kill();
  console.log('\n' + (failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'));
  process.exit(failures === 0 ? 0 : 1);
})();
