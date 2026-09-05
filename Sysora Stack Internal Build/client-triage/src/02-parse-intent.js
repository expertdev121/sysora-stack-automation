// ── Parse Intent ─────────────────────────────────────────────────────────────
// Turns the model's reply into a trusted, well-formed object and builds the JQL.
//
// The model's output is treated as untrusted text throughout: the intent is
// whitelisted, the issue key must match the real key format, and the search
// terms are stripped of every character that has meaning in JQL. Without that
// last step a client could write a message that breaks out of the quoted string
// and rewrites the query.

const PROJECT = 'GS';
const VALID_INTENTS = ['new_task', 'status_request', 'other'];
const VALID_PRIORITIES = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

// Jira numeric IDs for the GiveSuite project (id 10002). The Jira API takes
// IDs, not names, and these are stable per project.
const ISSUE_TYPE_IDS = { Bug: '10015', Task: '10012', Story: '10013', Feature: '10014' };
const DEFAULT_ISSUE_TYPE = 'Task';

const ctx = $('Filter Messages').first().json;
const modelText = String($input.first().json.text || $input.first().json.output || '');

let ai = {};
try {
  const m = modelText.match(/\{[\s\S]*\}/);
  if (m) ai = JSON.parse(m[0]);
} catch (e) {
  // leave ai empty; defaults below take over
}

const intent = VALID_INTENTS.includes(ai.intent) ? ai.intent : 'other';
const priority = VALID_PRIORITIES.includes(ai.priority) ? ai.priority : 'Medium';
const issueType = Object.prototype.hasOwnProperty.call(ISSUE_TYPE_IDS, ai.issueType)
  ? ai.issueType
  : DEFAULT_ISSUE_TYPE;

// Only accept a key that looks like a real key for THIS project.
const keyRe = new RegExp('^' + PROJECT + '-\\d+$');
const issueKey = typeof ai.issueKey === 'string' && keyRe.test(ai.issueKey.trim())
  ? ai.issueKey.trim()
  : null;

// JQL-safe: keep letters, digits, spaces and hyphens. Nothing else survives.
const terms = String(ai.searchTerms || ctx.text)
  .replace(/[^A-Za-z0-9 -]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .split(' ')
  .filter((w) => w.length > 2)
  .slice(0, 8)
  .join(' ');

let jql;
if (issueKey) {
  jql = 'key = ' + issueKey;
} else if (terms) {
  jql = 'project = ' + PROJECT + ' AND text ~ "' + terms + '" ORDER BY updated DESC';
} else {
  jql = 'project = ' + PROJECT + ' AND created >= -1d ORDER BY updated DESC';
}

const title = String(ai.title || ctx.text).replace(/\s+/g, ' ').trim().slice(0, 120);
const description = String(ai.description || ctx.text).trim();

return [
  {
    json: {
      ...ctx,
      intent,
      issueKey,
      issueType,
      issueTypeId: ISSUE_TYPE_IDS[issueType],
      priority,
      terms,
      jql,
      title,
      description,
      aiRaw: modelText.slice(0, 500),
    },
  },
];
