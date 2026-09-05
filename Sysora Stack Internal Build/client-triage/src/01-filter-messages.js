// ── Filter Messages ──────────────────────────────────────────────────────────
// Every message in the channel hits this node. Only real human messages get
// through. Returning [] halts the workflow, so nothing downstream costs money.
//
// The bot_id / SELF_BOT checks are the loop guard: this workflow REPLIES into
// the channel, and without them each reply would re-trigger the workflow and
// run away.

const SOURCE_CHANNEL = 'C0BS56L7V1A'; // #ops-team
const SELF_BOT = 'U0BSVQH51H6'; // Sysora Ops — never react to our own replies
const MIN_LENGTH = 8; // "ok", "thanks", ":+1:" are not requests

// n8n's Slack Trigger FLATTENS the event — it hands you {type,user,ts,text,
// channel,...} directly, not the raw {event:{...}} envelope the Slack API docs
// show. Accept either, so this works with the trigger and with a plain Webhook
// node fed the raw Slack body.
const raw = $input.first().json;
const ev = raw.event || raw;

if (ev.type !== 'message') return [];
if (ev.channel !== SOURCE_CHANNEL) return [];
if (ev.subtype) return []; // joins, edits, deletions, file shares
if (ev.bot_id) return []; // Jira integration, tldv, and our own posts
if (ev.user === SELF_BOT) return [];

const text = String(ev.text || '').trim();
if (text.length < MIN_LENGTH) return [];

// ── Idempotency guard ───────────────────────────────────────────────────────
// Slack redelivers events: it retries anything not acknowledged within 3s, and
// a duplicate subscription sends the same event twice. Either way the same
// client_msg_id arrives more than once, and without this each copy creates its
// own Jira ticket.
//
// Static data persists between executions of an ACTIVE workflow. Caveat worth
// knowing: n8n writes it when an execution ENDS, so two deliveries that run
// genuinely concurrently can both pass this check. It stops sequential
// redelivery, which is the common case; the real cure for concurrent copies is
// to stop them being sent (see README).
const store = $getWorkflowStaticData('global');
store.seen = Array.isArray(store.seen) ? store.seen : [];

const msgId = ev.client_msg_id || ev.event_ts || ev.ts;
if (store.seen.includes(msgId)) return [];

store.seen.push(msgId);
if (store.seen.length > 300) store.seen = store.seen.slice(-300);

return [
  {
    json: {
      text,
      user: ev.user,
      channel: ev.channel,
      ts: ev.ts,
      // Reply into the thread of the original message. If the client wrote in
      // an existing thread, stay in that thread instead of starting a new one.
      threadTs: ev.thread_ts || ev.ts,
    },
  },
];
