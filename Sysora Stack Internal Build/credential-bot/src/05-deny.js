// ── Deny ─────────────────────────────────────────────────────────────────────
// Unauthorized requests get one flat message and nothing else — no hint about
// which credentials exist, no "you're close", no list. Still audited.

const req = $input.first().json;

return [
  {
    json: {
      output:
        "You are not on the credential allowlist, so I can not share anything. " +
        'Ask Nikhil to add you if you need access.',
      status: 'unauthorized',
      audit: {
        at: new Date().toISOString(),
        requester: req.requesterName || 'unknown',
        requesterId: req.requesterId,
        requesterEmail: req.requesterEmail,
        source: req.source,
        question: req.question,
        status: 'unauthorized',
        credential: '(none)',
      },
      replyTo: req.replyTo,
    },
  },
];
