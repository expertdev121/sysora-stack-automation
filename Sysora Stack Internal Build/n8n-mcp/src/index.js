#!/usr/bin/env node
// MCP server for n8n, over stdio. Zero dependencies: the stdio transport is
// newline-delimited JSON-RPC 2.0, so the protocol is implemented directly and
// there is nothing to npm install.
//
//   N8N_BASE_URL=https://your-n8n  N8N_API_KEY=...  node src/index.js

const readline = require('readline');
const { N8n } = require('./n8n');
const { TOOLS } = require('./tools');

const SERVER = { name: 'n8n', version: '1.0.0' };
const FALLBACK_PROTOCOL = '2025-06-18';

// Never write to stdout except protocol messages — stdout IS the transport.
const log = (...a) => process.stderr.write('[n8n-mcp] ' + a.join(' ') + '\n');

let client = null;
function n8n() {
  if (!client) {
    client = new N8n({ baseUrl: process.env.N8N_BASE_URL, apiKey: process.env.N8N_API_KEY });
  }
  return client;
}

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}
const ok = (id, result) => send({ jsonrpc: '2.0', id, result });
const fail = (id, code, message) => send({ jsonrpc: '2.0', id, error: { code, message } });

async function handle(req) {
  const { id, method, params } = req;

  // Notifications have no id and take no reply.
  if (id === undefined || id === null) return;

  switch (method) {
    case 'initialize':
      return ok(id, {
        protocolVersion: (params && params.protocolVersion) || FALLBACK_PROTOCOL,
        capabilities: { tools: {} },
        serverInfo: SERVER,
      });

    case 'ping':
      return ok(id, {});

    case 'tools/list':
      return ok(id, {
        tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
      });

    case 'tools/call': {
      const tool = TOOLS.find((t) => t.name === (params && params.name));
      if (!tool) return fail(id, -32602, 'Unknown tool: ' + (params && params.name));
      try {
        const result = await tool.handler(n8n(), (params && params.arguments) || {});
        return ok(id, { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] });
      } catch (e) {
        // Tool errors belong in the result with isError, not as protocol errors —
        // that way the model can read the message and adapt.
        return ok(id, {
          content: [{ type: 'text', text: 'Error: ' + e.message }],
          isError: true,
        });
      }
    }

    // Declared unsupported rather than left to time out.
    case 'resources/list':
      return ok(id, { resources: [] });
    case 'prompts/list':
      return ok(id, { prompts: [] });

    default:
      return fail(id, -32601, 'Method not found: ' + method);
  }
}

const rl = readline.createInterface({ input: process.stdin });

rl.on('line', async (line) => {
  const text = line.trim();
  if (!text) return;
  let req;
  try {
    req = JSON.parse(text);
  } catch {
    return fail(null, -32700, 'Parse error');
  }
  try {
    await handle(req);
  } catch (e) {
    log('handler crash: ' + e.stack);
    if (req && req.id !== undefined && req.id !== null) fail(req.id, -32603, 'Internal error: ' + e.message);
  }
});

rl.on('close', () => process.exit(0));
process.on('uncaughtException', (e) => log('uncaught: ' + e.stack));

log('ready — ' + TOOLS.length + ' tools, target ' + (process.env.N8N_BASE_URL || '(N8N_BASE_URL unset)'));
