// Thin client over the n8n public API (/api/v1) plus the raw webhook host.

class N8nError extends Error {
  constructor(status, body, path) {
    super('n8n ' + status + ' on ' + path + ': ' + (body && body.message ? body.message : JSON.stringify(body).slice(0, 200)));
    this.status = status;
    this.body = body;
  }
}

class N8n {
  constructor({ baseUrl, apiKey }) {
    if (!baseUrl) throw new Error('N8N_BASE_URL is not set.');
    if (!apiKey) throw new Error('N8N_API_KEY is not set.');
    this.base = baseUrl.replace(/\/+$/, '');
    this.key = apiKey;
  }

  async call(method, path, body) {
    const res = await fetch(this.base + '/api/v1' + path, {
      method,
      headers: {
        'X-N8N-API-KEY': this.key,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const text = await res.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = { raw: text.slice(0, 500) };
    }
    if (!res.ok) throw new N8nError(res.status, parsed, path);
    return parsed;
  }

  // ── workflows ──
  listWorkflows(q = {}) {
    const p = new URLSearchParams();
    if (q.active !== undefined) p.set('active', String(q.active));
    if (q.name) p.set('name', q.name);
    p.set('limit', String(q.limit || 50));
    return this.call('GET', '/workflows?' + p);
  }
  getWorkflow(id) {
    return this.call('GET', '/workflows/' + id);
  }
  createWorkflow(wf) {
    const { name, nodes, connections, settings } = wf;
    return this.call('POST', '/workflows', {
      name,
      nodes,
      connections,
      settings: settings || { executionOrder: 'v1' },
    });
  }
  updateWorkflow(id, wf) {
    const { name, nodes, connections, settings } = wf;
    return this.call('PUT', '/workflows/' + id, {
      name,
      nodes,
      connections,
      settings: settings || { executionOrder: 'v1' },
    });
  }
  setActive(id, active) {
    return this.call('POST', '/workflows/' + id + (active ? '/activate' : '/deactivate'));
  }

  // ── executions ──
  listExecutions(q = {}) {
    const p = new URLSearchParams();
    if (q.workflowId) p.set('workflowId', q.workflowId);
    if (q.status) p.set('status', q.status);
    p.set('limit', String(q.limit || 20));
    return this.call('GET', '/executions?' + p);
  }
  getExecution(id, includeData = true) {
    return this.call('GET', '/executions/' + id + '?includeData=' + includeData);
  }
  deleteExecution(id) {
    return this.call('DELETE', '/executions/' + id);
  }

  // ── misc ──
  credentialSchema(type) {
    return this.call('GET', '/credentials/schema/' + type);
  }
  listUsers() {
    return this.call('GET', '/users?limit=50');
  }

  async health() {
    const res = await fetch(this.base + '/healthz');
    return { url: this.base, status: res.status, ok: res.ok };
  }

  /**
   * Probe a production webhook. Deliberately unauthenticated and harmless —
   * an empty POST tells you whether the endpoint is registered without
   * triggering real work (a signature check or the workflow's own filters
   * reject it).
   */
  async probeWebhook(webhookId, method = 'POST') {
    const url = this.base + '/webhook/' + webhookId + '/webhook';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(method === 'POST' ? { body: '{}' } : {}),
    });
    return { url, status: res.status, body: (await res.text()).slice(0, 400) };
  }
}

module.exports = { N8n, N8nError };
