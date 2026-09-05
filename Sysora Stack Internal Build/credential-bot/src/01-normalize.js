// ── Normalize Request ────────────────────────────────────────────────────────
// Accepts either the Chat Trigger or the Slack Trigger and emits one shape:
//   { source, requesterId, requesterEmail, question, replyTo, receivedAt }
// Nothing sensitive happens here — this is purely shape-flattening.

const item = $input.first().json;
let out;

if (item.chatInput !== undefined || item.sessionId !== undefined) {
  // n8n Chat Trigger. NOTE: the chat widget does NOT verify identity.
  // Basic-auth on the trigger is a shared gate, not a per-person login.
  out = {
    source: 'chat',
    requesterId: item.sessionId || 'anonymous',
    requesterEmail: String(item.email || (item.metadata && item.metadata.email) || '')
      .toLowerCase()
      .trim(),
    question: String(item.chatInput || '').trim(),
    replyTo: null,
  };
} else if (item.event) {
  // Slack Trigger (app_mention or message.im). Identity here IS verified by Slack.
  const ev = item.event;
  out = {
    source: 'slack',
    requesterId: ev.user || '',
    requesterEmail: '', // resolved from the Slack ID by the allowlist step
    question: String(ev.text || '').replace(/<@[^>]+>/g, '').trim(),
    replyTo: ev.channel || '',
  };
} else {
  throw new Error('Unrecognised trigger payload. Expected Chat Trigger or Slack Trigger.');
}

if (!out.question) {
  throw new Error('Empty request — nothing to look up.');
}

out.receivedAt = new Date().toISOString();
return [{ json: out }];
