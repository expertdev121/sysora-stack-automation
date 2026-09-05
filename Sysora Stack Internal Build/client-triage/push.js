// Pushes the locally-built workflow.json onto the LIVE n8n workflow without
// clobbering anything you set up in the UI.
//
// It merges rather than overwrites: credentials, node renames and any manual
// tweaks on existing nodes are preserved. Only node code, parameters that this
// repo owns, and the connection graph are replaced. New nodes are added and
// inherit the right credential.
//
//   node push.js            preview what would change
//   node push.js --apply    actually push
//
// Fill N8N_API_KEY, or set it in the environment as N8N_API_KEY.

const fs = require('fs');
const path = require('path');

const N8N = 'https://n8n-production-db72.up.railway.app';
const WORKFLOW_ID = 'VG5T51C46b5qzXZD';
const N8N_API_KEY = process.env.N8N_API_KEY || 'PASTE_YOUR_N8N_API_KEY';

// Which credential each new node should inherit, copied from an existing node.
const CRED_DONOR = { 'Get Comments': 'Search Jira' };

const apply = process.argv.includes('--apply');

async function main() {
  if (N8N_API_KEY.startsWith('PASTE')) {
    console.error('Set N8N_API_KEY (env var or edit this file) first.');
    process.exit(1);
  }
  const headers = { 'X-N8N-API-KEY': N8N_API_KEY, 'Content-Type': 'application/json' };

  const built = JSON.parse(fs.readFileSync(path.join(__dirname, 'workflow.json'), 'utf8'));
  const live = await (await fetch(N8N + '/api/v1/workflows/' + WORKFLOW_ID, { headers })).json();
  if (!live.nodes) {
    console.error('Could not read the live workflow: ' + JSON.stringify(live).slice(0, 200));
    process.exit(1);
  }

  const byName = (w, n) => w.nodes.find((x) => x.name === n);
  const changes = [];

  for (const bNode of built.nodes) {
    const lNode = byName(live, bNode.name);
    if (!lNode) {
      const copy = JSON.parse(JSON.stringify(bNode));
      const donor = CRED_DONOR[bNode.name] && byName(live, CRED_DONOR[bNode.name]);
      if (donor && donor.credentials) copy.credentials = donor.credentials;
      live.nodes.push(copy);
      changes.push('ADD  ' + bNode.name + (copy.credentials ? ' (credential inherited)' : ''));
      continue;
    }
    if (bNode.parameters.jsCode && lNode.parameters.jsCode !== bNode.parameters.jsCode) {
      lNode.parameters.jsCode = bNode.parameters.jsCode;
      changes.push('CODE ' + bNode.name);
    }
    if (bNode.parameters.text && lNode.parameters.text !== bNode.parameters.text) {
      lNode.parameters.text = bNode.parameters.text;
      changes.push('TEXT ' + bNode.name);
    }
  }

  if (JSON.stringify(live.connections) !== JSON.stringify(built.connections)) {
    live.connections = built.connections;
    changes.push('WIRE connection graph');
  }

  if (!changes.length) return console.log('Already up to date.');
  console.log(changes.map((c) => '  ' + c).join('\n'));

  if (!apply) return console.log('\nDry run. Re-run with --apply to push.');

  const body = JSON.stringify({
    name: live.name,
    nodes: live.nodes,
    connections: live.connections,
    settings: live.settings,
  });
  const res = await fetch(N8N + '/api/v1/workflows/' + WORKFLOW_ID, { method: 'PUT', headers, body });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) return console.error('\nFAILED ' + res.status + ': ' + (out.message || ''));

  console.log(
    '\npushed. nodes=' + out.nodes.length +
    ' credentials=' + out.nodes.filter((n) => n.credentials).length +
    ' active=' + out.active
  );
}

main();
