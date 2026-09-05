// ── Decide Action ────────────────────────────────────────────────────────────
// Reads the Jira search results and decides the single next move. Formatting
// now lives downstream: the create path builds its own message, and the status
// path needs the ticket's comments first, so this node only decides and
// normalises the matched issue.
//
// Search runs for BOTH intents on purpose. For a status request it finds the
// task to report on; for a new request it catches the case where the client is
// re-reporting something already logged, so we link the existing ticket
// instead of creating a duplicate.

const ctx = $('Parse Intent').first().json;

// Jira "getAll" with alwaysOutputData emits one empty item when nothing matches.
const hits = $input
  .all()
  .map((i) => i.json)
  .filter((j) => j && typeof j.key === 'string' && j.key);

const hit = hits[0] || null;

if (ctx.intent === 'other') {
  // Nothing actionable was said. Stay quiet rather than reply with noise.
  return [];
}

let matched = null;
if (hit) {
  const f = hit.fields || {};
  matched = {
    key: hit.key,
    summary: f.summary || '',
    status: (f.status && f.status.name) || 'Unknown',
    assignee: (f.assignee && f.assignee.displayName) || 'Unassigned',
    priority: (f.priority && f.priority.name) || '',
    duedate: f.duedate || '',
    updated: f.updated || '',
  };
}

return [
  {
    json: {
      ...ctx,
      shouldCreate: !matched,
      matched,
      matchedKey: matched ? matched.key : null,
      // A new report that collided with an existing ticket. The status reply
      // adds a line explaining why nothing new was raised.
      isDuplicateReport: Boolean(matched) && ctx.intent === 'new_task',
      hitCount: hits.length,
    },
  },
];
