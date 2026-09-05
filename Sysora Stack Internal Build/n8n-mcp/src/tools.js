// Tool definitions + handlers. Kept separate from the JSON-RPC plumbing so
// both can be tested independently.

const { auditWorkflow, digestExecution, mergeWorkflow, interpretProbe } = require('./digest');

const str = (description) => ({ type: 'string', description });
const num = (description) => ({ type: 'number', description });
const bool = (description) => ({ type: 'boolean', description });

const TOOLS = [
  {
    name: 'n8n_health',
    description: 'Check the n8n instance is reachable and the API key works. Start here when something looks broken.',
    inputSchema: { type: 'object', properties: {} },
    handler: async (n8n) => {
      const health = await n8n.health();
      let apiKeyValid = true;
      let detail = null;
      try {
        await n8n.listWorkflows({ limit: 1 });
      } catch (e) {
        apiKeyValid = false;
        detail = e.message;
      }
      return { ...health, apiKeyValid, detail };
    },
  },

  {
    name: 'n8n_list_workflows',
    description: 'List workflows with their id, name, active and archived state.',
    inputSchema: {
      type: 'object',
      properties: {
        active: bool('Only active (true) or only inactive (false). Omit for all.'),
        name: str('Filter by exact name.'),
        limit: num('Default 50.'),
      },
    },
    handler: async (n8n, a) => {
      const res = await n8n.listWorkflows(a);
      return {
        count: res.data.length,
        workflows: res.data.map((w) => ({
          id: w.id,
          name: w.name,
          active: w.active,
          archived: Boolean(w.isArchived),
          nodes: (w.nodes || []).length,
          updatedAt: w.updatedAt,
        })),
      };
    },
  },

  {
    name: 'n8n_audit_workflow',
    description:
      'Explain what is wrong with a workflow: nodes missing credentials, leftover PASTE_/PICK_ placeholders, ' +
      'unreachable nodes, dead ends, and whether it has a usable trigger. Use this before asking why a workflow ' +
      'does not work — it answers most of it without reading the JSON.',
    inputSchema: {
      type: 'object',
      properties: { id: str('Workflow id.') },
      required: ['id'],
    },
    handler: async (n8n, a) => auditWorkflow(await n8n.getWorkflow(a.id)),
  },

  {
    name: 'n8n_get_workflow',
    description:
      'Fetch the full workflow JSON. Large — prefer n8n_audit_workflow unless you need node parameters or code.',
    inputSchema: {
      type: 'object',
      properties: {
        id: str('Workflow id.'),
        nodeName: str('Return only this one node, to avoid dumping the whole workflow.'),
      },
      required: ['id'],
    },
    handler: async (n8n, a) => {
      const wf = await n8n.getWorkflow(a.id);
      if (!a.nodeName) return wf;
      const node = (wf.nodes || []).find((n) => n.name === a.nodeName);
      if (!node) throw new Error('No node named "' + a.nodeName + '". Have: ' + wf.nodes.map((n) => n.name).join(', '));
      return node;
    },
  },

  {
    name: 'n8n_patch_workflow',
    description:
      'Change a live workflow WITHOUT losing credentials, node renames, or UI tweaks. This is the safe way to edit — ' +
      'a plain update overwrites everything and wipes credential assignments. Always dry-run first.',
    inputSchema: {
      type: 'object',
      properties: {
        id: str('Workflow id.'),
        nodes: {
          type: 'array',
          description: 'Per-node changes. Existing nodes are patched field by field; unknown names are added if "node" is supplied.',
          items: {
            type: 'object',
            properties: {
              name: str('Node name (must match exactly).'),
              jsCode: str('New Code-node body.'),
              parameters: { type: 'object', description: 'Parameters to overlay. Only the keys given are replaced.' },
              disabled: bool('Enable or disable the node.'),
              node: { type: 'object', description: 'Full node definition, used only when adding a new node.' },
              inheritCredentialFrom: str('When adding: copy the credential from this existing node.'),
            },
            required: ['name'],
          },
        },
        connections: { type: 'object', description: 'Replacement connection graph. Omit to leave wiring untouched.' },
        dryRun: bool('Default true. Report what would change without writing.'),
      },
      required: ['id'],
    },
    handler: async (n8n, a) => {
      const live = await n8n.getWorkflow(a.id);
      const { workflow, changes } = mergeWorkflow(live, { nodes: a.nodes, connections: a.connections });
      const dryRun = a.dryRun !== false;
      if (dryRun) return { dryRun: true, changes, hint: 'Re-run with dryRun:false to apply.' };
      if (!changes.length) return { dryRun: false, changes: [], note: 'Nothing to change.' };
      const saved = await n8n.updateWorkflow(a.id, workflow);
      return {
        dryRun: false,
        changes,
        after: {
          nodes: saved.nodes.length,
          withCredentials: saved.nodes.filter((n) => n.credentials).length,
          active: saved.active,
        },
      };
    },
  },

  {
    name: 'n8n_create_workflow',
    description: 'Create a new workflow. Returns its id. Created inactive; activate separately once configured.',
    inputSchema: {
      type: 'object',
      properties: {
        name: str('Workflow name.'),
        nodes: { type: 'array', description: 'Node definitions.', items: { type: 'object' } },
        connections: { type: 'object', description: 'Connection graph.' },
        settings: { type: 'object', description: 'Defaults to {executionOrder:"v1"}.' },
      },
      required: ['name', 'nodes', 'connections'],
    },
    handler: async (n8n, a) => {
      const wf = await n8n.createWorkflow(a);
      return { id: wf.id, name: wf.name, nodes: wf.nodes.length, active: wf.active, audit: auditWorkflow(wf) };
    },
  },

  {
    name: 'n8n_set_active',
    description: 'Activate or deactivate a workflow. Deactivate to stop a misbehaving automation immediately.',
    inputSchema: {
      type: 'object',
      properties: { id: str('Workflow id.'), active: bool('true to activate, false to deactivate.') },
      required: ['id', 'active'],
    },
    handler: async (n8n, a) => {
      const wf = await n8n.setActive(a.id, a.active);
      return { id: wf.id, name: wf.name, active: wf.active };
    },
  },

  {
    name: 'n8n_list_executions',
    description: 'List recent executions. Zero executions on an active workflow means nothing is reaching the trigger.',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: str('Restrict to one workflow.'),
        status: str('One of: success, error, waiting.'),
        limit: num('Default 20.'),
      },
    },
    handler: async (n8n, a) => {
      const res = await n8n.listExecutions(a);
      return {
        count: res.data.length,
        executions: res.data.map((e) => ({
          id: e.id,
          workflowId: e.workflowId,
          status: e.status,
          mode: e.mode,
          startedAt: e.startedAt,
          ms: e.stoppedAt ? new Date(e.stoppedAt) - new Date(e.startedAt) : null,
        })),
      };
    },
  },

  {
    name: 'n8n_explain_execution',
    description:
      'Node-by-node account of one execution: which node errored, how many items each produced, and where it stopped. ' +
      'A node emitting 0 items silently halts everything downstream — n8n reports that as "success", which is the ' +
      'most misleading failure mode there is. This names it explicitly.',
    inputSchema: {
      type: 'object',
      properties: { id: str('Execution id.') },
      required: ['id'],
    },
    handler: async (n8n, a) => digestExecution(await n8n.getExecution(a.id, true)),
  },

  {
    name: 'n8n_probe_webhook',
    description:
      'Check whether a production webhook is actually registered and listening, and interpret the result. ' +
      'Distinguishes "workflow inactive so events are dropped" from "healthy, waiting for POST" from ' +
      '"signature verification rejecting". Sends an empty body, so it triggers no real work.',
    inputSchema: {
      type: 'object',
      properties: {
        webhookId: str('The trigger node webhookId (from n8n_audit_workflow).'),
        method: str('POST (default) or GET.'),
      },
      required: ['webhookId'],
    },
    handler: async (n8n, a) => {
      const probe = await n8n.probeWebhook(a.webhookId, a.method || 'POST');
      return { ...probe, ...interpretProbe(probe.status, probe.body) };
    },
  },

  {
    name: 'n8n_credential_schema',
    description:
      'Exact field names for a credential type, straight from n8n. Use before creating credentials so you use ' +
      'the real field names (e.g. Jira wants "apiToken", not "password"). Returns the schema only — never secrets.',
    inputSchema: {
      type: 'object',
      properties: { type: str('e.g. slackApi, jiraSoftwareCloudApi, openAiApi, googleApi.') },
      required: ['type'],
    },
    handler: async (n8n, a) => {
      const s = await n8n.credentialSchema(a.type);
      return { type: a.type, fields: Object.keys(s.properties || {}), required: s.required || [], schema: s };
    },
  },

  {
    name: 'n8n_delete_execution',
    description: 'Delete one execution record. Useful for clearing runs whose stored payload holds sensitive data.',
    inputSchema: {
      type: 'object',
      properties: { id: str('Execution id.') },
      required: ['id'],
    },
    handler: async (n8n, a) => {
      await n8n.deleteExecution(a.id);
      return { deleted: a.id };
    },
  },
];

module.exports = { TOOLS };
