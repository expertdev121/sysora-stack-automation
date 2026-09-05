// ── Status Reply ─────────────────────────────────────────────────────────────
// Builds the "here is where your task stands" message: the live Jira fields
// plus the most recent comments.
//
// WHAT GETS SHOWN. Jira comments are written for the team, not the client.
// Two filters guard against leaking internal discussion into a channel a
// client can read:
//   1. Any comment with a Jira visibility restriction (role/group limited) is
//      always dropped — Jira already marked it as not-for-everyone.
//   2. CLIENT_SAFE_MARKER, when set, shows ONLY comments containing that
//      marker. Turn it on if this channel ever has clients in it, and have the
//      team prefix updates they are happy to share.

const BASE = 'https://sysorastack.atlassian.net/browse/';
const MAX_COMMENTS = 3;
const MAX_COMMENT_CHARS = 400;
const CLIENT_SAFE_MARKER = ''; // e.g. '[client]' to show only marked comments

const ctx = $('Decide Action').first().json;
const m = ctx.matched || {};

// Jira Cloud returns comment bodies as Atlassian Document Format (nested JSON),
// not a string, unless the node simplified them. Handle both.
function adfToText(body) {
  if (!body) return '';
  if (typeof body === 'string') return body;
  const parts = [];
  const walk = (n) => {
    if (!n) return;
    if (Array.isArray(n)) return n.forEach(walk);
    if (n.type === 'text' && n.text) parts.push(n.text);
    if (n.type === 'hardBreak') parts.push('\n');
    if (n.content) walk(n.content);
  };
  walk(body.content || body);
  return parts.join('').replace(/\n{3,}/g, '\n\n').trim();
}

const raw = $input
  .all()
  .map((i) => i.json)
  .filter((c) => c && (c.id || c.body));

const comments = raw
  .filter((c) => !c.visibility) // Jira-restricted: never surface
  .map((c) => ({
    author: (c.author && (c.author.displayName || c.author.name)) || 'Someone',
    when: (c.created || '').slice(0, 10),
    text: adfToText(c.body),
  }))
  .filter((c) => c.text)
  .filter((c) => !CLIENT_SAFE_MARKER || c.text.includes(CLIENT_SAFE_MARKER))
  .slice(-MAX_COMMENTS);

const lines = [];
lines.push('*<' + BASE + m.key + '|' + m.key + '> — ' + (m.summary || '') + '*');

const facts = [
  m.status ? '*Status:* ' + m.status : null,
  m.priority ? '*Priority:* ' + m.priority : null,
  m.assignee ? '*Assignee:* ' + m.assignee : null,
  m.duedate ? '*Due:* ' + m.duedate : null,
].filter(Boolean);
if (facts.length) lines.push(facts.join('   '));
if (m.updated) lines.push('_Last updated ' + String(m.updated).slice(0, 10) + '_');

if (comments.length) {
  lines.push('');
  lines.push(comments.length === 1 ? '*Latest update:*' : '*Latest updates:*');
  for (const c of comments) {
    let t = c.text.replace(CLIENT_SAFE_MARKER, '').trim();
    if (t.length > MAX_COMMENT_CHARS) t = t.slice(0, MAX_COMMENT_CHARS) + '…';
    lines.push('> *' + c.author + '* (' + c.when + '): ' + t.split('\n').join(' '));
  }
} else {
  lines.push('');
  lines.push('_No notes on the ticket yet — the team will post updates here as it moves._');
}

if (ctx.isDuplicateReport) {
  lines.push('');
  lines.push(
    'This looked like something already logged, so I have not raised a duplicate. ' +
      'If it is actually a different issue, say so and I will create a separate ticket.'
  );
}

return [{ json: { ...ctx, reply: lines.join('\n'), commentCount: comments.length } }];
