// ── Created Reply ────────────────────────────────────────────────────────────
// Runs after the Jira issue is created. Builds the confirmation that goes back
// into the client's own thread.

const BASE = 'https://sysorastack.atlassian.net/browse/';

const ctx = $('Decide Action').first().json;
const created = $input.first().json || {};
const key = created.key || null;

if (!key) {
  // Jira accepted the call but gave us no key — tell the truth rather than
  // claiming a ticket exists.
  return [
    {
      json: {
        ...ctx,
        reply:
          'I tried to log this but Jira did not return a ticket reference. ' +
          'Flagging it for the Ops team to raise manually.',
      },
    },
  ];
}

const reply =
  'Logged as <' + BASE + key + '|' + key + '> — *' + ctx.title + '*\n' +
  'This has gone to the Ops team at Sysora Stack for review. ' +
  'They will pick it up and you will be notified in this thread as it progresses.';

return [{ json: { ...ctx, reply, createdKey: key } }];
