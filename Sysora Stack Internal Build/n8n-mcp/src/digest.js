// Pure functions. No network, no n8n import — so they can be tested offline.
//
// These encode the three things that were re-derived by hand over and over
// while debugging the Slack/Jira workflows:
//   1. what a workflow is actually missing (credentials, placeholders, dead ends)
//   2. what an execution really did, node by node
//   3. how to change a workflow without destroying its credentials

const PLACEHOLDER_RE = /PASTE_[A-Z0-9_]+|PICK_[A-Z0-9_]+|REPLACE_ME|YOUR_[A-Z0-9_]+/g;

// Node types that cannot run without a credential attached.
const NEEDS_CREDENTIAL = [
  'n8n-nodes-base.slack',
  'n8n-nodes-base.slackTrigger',
  'n8n-nodes-base.jira',
  'n8n-nodes-base.jiraTrigger',
  'n8n-nodes-base.googleDocs',
  'n8n-nodes-base.googleSheets',
  'n8n-nodes-base.gmail',
  '@n8n/n8n-nodes-langchain.lmChatOpenAi',
  '@n8n/n8n-nodes-langchain.lmChatAnthropic',
];

const isTrigger = (t) => /trigger$/i.test(t) || t === 'n8n-nodes-base.webhook';

// Nodes that only reshape data. If one of these ends the flow, its work is
// thrown away and that is almost always a wiring mistake. An ACTION node
// (Slack send, Jira create) ending the flow is perfectly normal — it did its
// job via a side effect — so those must never be reported as dead ends.
const TRANSFORM_ONLY = /\.(code|set|if|switch|filter|merge|splitOut|itemLists|aggregate|sort|limit|renameKeys|dateTime)$/i;

/**
 * What is wrong with this workflow right now. The check that kept being
 * rewritten by hand: missing credentials, leftover placeholders, and nodes
 * whose output goes nowhere.
 */
function auditWorkflow(wf) {
  const nodes = wf.nodes || [];
  const connections = wf.connections || {};

  // Every node that is the target of some connection, and every node that has
  // at least one outgoing link.
  const hasOutgoing = new Set();
  const isTarget = new Set();
  for (const [from, conn] of Object.entries(connections)) {
    for (const outputs of Object.values(conn)) {
      for (const branch of outputs || []) {
        for (const link of branch || []) {
          hasOutgoing.add(from);
          isTarget.add(link.node);
        }
      }
    }
  }

  const problems = [];
  const nodeReport = nodes.map((n) => {
    const params = JSON.stringify(n.parameters || {});
    const placeholders = [...new Set(params.match(PLACEHOLDER_RE) || [])];
    const needsCred = NEEDS_CREDENTIAL.includes(n.type);
    const hasCred = Boolean(n.credentials && Object.keys(n.credentials).length);

    if (needsCred && !hasCred && !n.disabled) {
      problems.push({ node: n.name, kind: 'missing_credential', detail: n.type });
    }
    if (placeholders.length && !n.disabled) {
      problems.push({ node: n.name, kind: 'placeholder', detail: placeholders.join(', ') });
    }
    // Truly orphaned: wired to nothing in either direction. A node with an
    // outgoing link is fine even with no incoming one — that is how AI
    // sub-nodes (language models, memory, tools) attach to their parent.
    if (!isTrigger(n.type) && !isTarget.has(n.name) && !hasOutgoing.has(n.name) && !n.disabled) {
      problems.push({ node: n.name, kind: 'unreachable', detail: 'not connected to anything' });
    }
    if (
      !isTrigger(n.type) &&
      isTarget.has(n.name) &&
      !hasOutgoing.has(n.name) &&
      !n.disabled &&
      TRANSFORM_ONLY.test(n.type)
    ) {
      problems.push({ node: n.name, kind: 'dead_end', detail: 'transforms data that nothing consumes' });
    }

    return {
      name: n.name,
      type: n.type,
      disabled: Boolean(n.disabled),
      credential: hasCred ? Object.values(n.credentials)[0].name : null,
      placeholders,
    };
  });

  const triggers = nodes.filter((n) => isTrigger(n.type) && !n.disabled);
  if (!triggers.length) problems.push({ node: '(workflow)', kind: 'no_trigger', detail: 'nothing can start it' });

  return {
    name: wf.name,
    id: wf.id,
    active: Boolean(wf.active),
    archived: Boolean(wf.isArchived),
    nodeCount: nodes.length,
    nodes: nodeReport,
    triggers: triggers.map((t) => ({ name: t.name, type: t.type, webhookId: t.webhookId || null })),
    problems,
    ready: problems.length === 0,
  };
}

/**
 * What an execution actually did. n8n's raw payload buries this; the useful
 * view is per node: did it error, and how many items came out. A node
 * emitting 0 items silently halts everything downstream, which is the single
 * most confusing n8n failure mode.
 */
function digestExecution(exec) {
  const result = (exec.data && exec.data.resultData) || {};
  const runData = result.runData || {};

  const nodes = Object.entries(runData).map(([name, runs]) => {
    const run = runs && runs[0];
    const main = run && run.data && run.data.main;
    const items = main && main[0] ? main[0].length : 0;
    return {
      node: name,
      error: run && run.error ? String(run.error.message).slice(0, 300) : null,
      items,
      ms: run ? run.executionTime : null,
      // Only a small preview — execution payloads can be enormous.
      sample: main && main[0] && main[0][0] ? previewJson(main[0][0].json) : null,
    };
  });

  const halted = nodes.find((n) => !n.error && n.items === 0);

  return {
    id: exec.id,
    workflowId: exec.workflowId,
    status: exec.status,
    mode: exec.mode,
    startedAt: exec.startedAt,
    ms: exec.stoppedAt ? new Date(exec.stoppedAt) - new Date(exec.startedAt) : null,
    lastNode: result.lastNodeExecuted || null,
    topError: result.error ? String(result.error.message).slice(0, 300) : null,
    nodes,
    // The interpretation, not just the data.
    verdict: nodes.some((n) => n.error)
      ? 'A node errored — see the first node with an error set.'
      : halted
        ? 'Stopped at "' + halted.node + '": it returned 0 items, so nothing downstream ran. ' +
          'That is usually deliberate filtering, not a crash.'
        : 'Ran to completion.',
  };
}

function previewJson(json, max = 220) {
  const out = {};
  for (const [k, v] of Object.entries(json || {})) {
    if (v && typeof v === 'object') {
      out[k] = Array.isArray(v) ? '[' + v.length + ' items]' : '{…}';
    } else {
      const s = String(v);
      out[k] = s.length > max ? s.slice(0, max) + '…' : v;
    }
  }
  return out;
}

/**
 * Merge changes into a live workflow WITHOUT losing what was set up in the UI.
 *
 * A plain PUT of a locally-built workflow wipes credentials every time. This
 * keeps the live node as the base and overlays only the named fields; new
 * nodes can inherit a credential from an existing node.
 */
function mergeWorkflow(live, patch) {
  const next = JSON.parse(JSON.stringify(live));
  const byName = (n) => next.nodes.find((x) => x.name === n);
  const changes = [];

  for (const p of patch.nodes || []) {
    const target = byName(p.name);

    if (!target) {
      if (!p.node) {
        changes.push({ node: p.name, change: 'skipped', detail: 'not live and no full node given' });
        continue;
      }
      const copy = JSON.parse(JSON.stringify(p.node));
      if (p.inheritCredentialFrom) {
        const donor = byName(p.inheritCredentialFrom);
        if (donor && donor.credentials) copy.credentials = donor.credentials;
      }
      next.nodes.push(copy);
      changes.push({
        node: p.name,
        change: 'added',
        detail: copy.credentials ? 'credential inherited from ' + p.inheritCredentialFrom : 'no credential',
      });
      continue;
    }

    if (p.jsCode !== undefined && target.parameters.jsCode !== p.jsCode) {
      target.parameters.jsCode = p.jsCode;
      changes.push({ node: p.name, change: 'jsCode' });
    }
    if (p.parameters) {
      for (const [k, v] of Object.entries(p.parameters)) {
        if (JSON.stringify(target.parameters[k]) !== JSON.stringify(v)) {
          target.parameters[k] = v;
          changes.push({ node: p.name, change: 'parameter', detail: k });
        }
      }
    }
    if (p.disabled !== undefined && Boolean(target.disabled) !== Boolean(p.disabled)) {
      target.disabled = p.disabled;
      changes.push({ node: p.name, change: p.disabled ? 'disabled' : 'enabled' });
    }
    // Credentials are never touched by a patch — that is the whole point.
  }

  if (patch.connections && JSON.stringify(next.connections) !== JSON.stringify(patch.connections)) {
    next.connections = patch.connections;
    changes.push({ node: '(workflow)', change: 'connections' });
  }

  return { workflow: next, changes };
}

/**
 * Turn a raw webhook probe into an answer. These status codes mean very
 * specific things and are easy to misread:
 *   404 "not registered"     -> workflow inactive/archived; Slack gets nothing
 *   404 "not for GET"        -> registered and healthy, waiting for POST
 *   401                      -> registered, signature verification rejecting
 */
function interpretProbe(status, body) {
  const text = String(body || '');
  if (status === 401 || status === 403) {
    return {
      registered: true,
      healthy: true,
      meaning:
        'Registered and enforcing signature verification. An unsigned probe is ' +
        'correctly rejected. If the real sender also gets 401, the signing secret is wrong.',
    };
  }
  if (status === 404 && /not registered for/i.test(text)) {
    return { registered: true, healthy: true, meaning: 'Registered and waiting for POST. This is the healthy state.' };
  }
  if (status === 404) {
    return {
      registered: false,
      healthy: false,
      meaning:
        'NOT registered. The workflow is inactive or archived, so anything sent here is dropped. ' +
        'Activate the workflow, or point the sender at a different webhook.',
    };
  }
  if (status >= 200 && status < 300) {
    return { registered: true, healthy: true, meaning: 'Accepted the request.' };
  }
  return { registered: null, healthy: false, meaning: 'Unexpected status ' + status + ': ' + text.slice(0, 200) };
}

module.exports = { auditWorkflow, digestExecution, mergeWorkflow, interpretProbe, previewJson };
