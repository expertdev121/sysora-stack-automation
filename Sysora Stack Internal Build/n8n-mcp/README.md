# n8n MCP server

Drive an n8n instance from Claude (or any MCP client): list and audit
workflows, explain executions, patch workflows without breaking them, and
check whether a webhook is actually listening.

**Zero dependencies.** MCP over stdio is newline-delimited JSON-RPC, so the
protocol is implemented directly — there is nothing to `npm install`.

```bash
node test.js                                   # 50 offline checks
N8N_BASE_URL=... N8N_API_KEY=... node smoke.js  # read-only live check
```

## Install — just for you

Run in an interactive terminal, from anywhere:

```bash
claude mcp add n8n --scope user \
  --env N8N_BASE_URL=https://n8n-production-db72.up.railway.app \
  --env N8N_API_KEY=<your key> \
  -- node "<absolute path>/Sysora Stack Internal Build/n8n-mcp/src/index.js"
```

`--scope user` makes it available in every project you open. Use
`--scope local` instead to limit it to the current project.

## Install — for the team

The repo root has a committed `.mcp.json`. Anyone who clones the repo is
offered this server automatically; nothing to install, no path to configure.

It carries **no secret** — the key is expanded from each person's environment:

```json
"env": {
  "N8N_BASE_URL": "https://n8n-production-db72.up.railway.app",
  "N8N_API_KEY": "${N8N_API_KEY}"
}
```

So each teammate does two things, once:

1. Get their **own** n8n API key — n8n → Settings → n8n API → Create.
   Do not pass one key around; it cannot be attributed or revoked per person.
2. Export it, so Claude Code can expand `${N8N_API_KEY}`:

   ```bash
   # macOS / Linux — ~/.zshrc or ~/.bashrc
   export N8N_API_KEY="their-key"
   ```
   ```powershell
   # Windows — persists for future sessions
   setx N8N_API_KEY "their-key"
   ```

Then open the repo in Claude Code and approve the server when prompted.

Verify with `claude mcp list`, or ask Claude to run `n8n_health` — it reports
whether the instance is reachable and whether the key actually works.

Then ask things like *"why did the last Client Triage run do nothing?"* or
*"what is missing from the credential desk workflow?"*.

## Tools

| Tool | Purpose |
|---|---|
| `n8n_health` | Instance reachable, API key valid |
| `n8n_list_workflows` | ids, names, active/archived |
| **`n8n_audit_workflow`** | What is wrong with a workflow — missing credentials, leftover placeholders, orphans, dead ends, missing trigger |
| `n8n_get_workflow` | Full JSON, or one node with `nodeName` |
| **`n8n_patch_workflow`** | Edit a live workflow **without wiping credentials**. Dry-run by default |
| `n8n_create_workflow` | Create one, returns id + audit |
| `n8n_set_active` | Activate / deactivate |
| `n8n_list_executions` | Recent runs |
| **`n8n_explain_execution`** | Node-by-node: who errored, item counts, where it silently stopped |
| **`n8n_probe_webhook`** | Is the webhook registered, and what the status code actually means |
| `n8n_credential_schema` | Real field names for a credential type |
| `n8n_delete_execution` | Remove one stored run |

The four in bold are the reason this exists. The rest is a thin wrapper over
`/api/v1`; those four encode things that are genuinely easy to get wrong.

## The three problems it solves

**1. A workflow that "does nothing" and reports success.**

n8n's most confusing behaviour: a node returning 0 items silently halts
everything downstream, and the execution is still marked `success`. Nothing in
the UI says why. `n8n_explain_execution` names it:

```
Watch Channel      1 item(s)
Filter Messages    0 item(s)
verdict: Stopped at "Filter Messages": it returned 0 items, so nothing
         downstream ran. That is usually deliberate filtering, not a crash.
```

**2. Editing a live workflow destroys its credentials.**

`PUT /workflows/:id` replaces the whole document. Push a locally-built version
and every credential assignment, node rename, and UI tweak is gone.
`n8n_patch_workflow` keeps the live workflow as the base and overlays only the
fields you name. Credentials are never in the patch path at all; new nodes can
inherit one from an existing node via `inheritCredentialFrom`. Dry-run is the
default, so you see the change list before anything is written.

**3. Webhook status codes lie to you.**

Three outcomes that look alike and mean completely different things:

| Status | Reality |
|---|---|
| `404 not registered` | Workflow inactive or archived — **everything sent here is dropped** |
| `404 not registered for GET` | Registered and healthy, waiting for POST |
| `401` | Registered, signature verification rejecting — check the signing secret |

`n8n_probe_webhook` sends an empty body (so it triggers no real work) and
returns the interpretation, not just the code.

## Notes

- **No credential-writing tool.** The schema tool tells you the exact field
  names, but secrets are yours to paste. Nothing here reads or writes credential
  values.
- **stdout is the transport.** All logging goes to stderr; writing to stdout
  would corrupt the protocol stream.
- **Tool failures return `isError`,** not JSON-RPC errors, so the model sees the
  message and can adapt rather than just failing.
- The API key inherits full instance access. It can read execution data, which
  contains whatever your workflows processed.
