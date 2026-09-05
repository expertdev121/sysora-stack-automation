// ── Match Mention ────────────────────────────────────────────────────────────
// Slack fires an event for EVERY message in the watched channel. This node is
// the gate: it drops everything that is not a real human tagging you, and
// formats the ones that survive. Returning [] stops the workflow, so the
// Slack send node only runs on a genuine hit.

const WATCH_FOR = 'U09KNBVTGG0'; // Expert Dev — whoever "me" is
const SOURCE_CHANNEL = 'C0BS56L7V1A'; // #ops-team
const INCLUDE_BROADCASTS = false; // count @here / @channel as tagging you?
const ALLOW_SELF_MENTION = true; // TESTING: true lets you tag yourself and fire
//                                  the workflow solo. Flip back to false once
//                                  someone else has tested it, or you will get
//                                  pinged for your own messages forever.
const WORKSPACE_DOMAIN = ''; // e.g. 'gsmedia' -> adds a "Jump to message" link

// n8n's Slack Trigger FLATTENS the event — {type,user,ts,text,channel,...} at
// the top level, not the {event:{...}} envelope from Slack's docs. Accept both.
const raw = $input.first().json;
const ev = raw.event || raw;

// Order matters: cheapest rejections first.
if (ev.type !== 'message') return [];
if (ev.channel !== SOURCE_CHANNEL) return [];
if (ev.subtype) return []; // joins, edits, deletions, channel_join, file_share
if (ev.bot_id) return []; // never forward bot chatter (Jira, tldv, etc.)
if (ev.user === WATCH_FOR && !ALLOW_SELF_MENTION) return []; // self-tag is not a ping

const text = String(ev.text || '');
const tagged = text.includes('<@' + WATCH_FOR + '>');
const broadcast = INCLUDE_BROADCASTS && /<!(here|channel)>/.test(text);
if (!tagged && !broadcast) return [];

// <@Uxxx> and <#Cxxx> render as the real name / channel link in the
// destination, so no extra API call is needed to resolve them.
const lines = [
  ':bell: You were mentioned by <@' + ev.user + '> in <#' + ev.channel + '>',
  '',
  text
    .split('\n')
    .map((l) => '> ' + l)
    .join('\n'),
];

if (WORKSPACE_DOMAIN) {
  const p = 'p' + String(ev.ts).replace('.', '');
  lines.push(
    '',
    '<https://' + WORKSPACE_DOMAIN + '.slack.com/archives/' + ev.channel + '/' + p + '|Jump to message>'
  );
}

return [
  {
    json: {
      text: lines.join('\n'),
      from: ev.user,
      ts: ev.ts,
      sourceChannel: ev.channel,
      threadTs: ev.thread_ts || null,
    },
  },
];
