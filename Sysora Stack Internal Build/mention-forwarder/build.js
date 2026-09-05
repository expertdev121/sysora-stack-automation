// Assembles workflow.json from ./src.  Run:  node build.js
const fs = require('fs');
const path = require('path');

const SOURCE_CHANNEL = 'C0BS56L7V1A'; // #ops-team (private)
const DEST_CHANNEL = 'PASTE_DESTINATION_CHANNEL_ID';

const node = (name, type, typeVersion, position, parameters, extra = {}) => ({
  parameters,
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  name,
  type,
  typeVersion,
  position,
  ...extra,
});

const nodes = [
  node('Watch ops-team', 'n8n-nodes-base.slackTrigger', 1, [-260, 0], {
    trigger: ['message'],
    watchWorkspace: false,
    channelId: { __rl: true, value: SOURCE_CHANNEL, mode: 'id' },
    options: {},
  }, {
    webhookId: 'c9e3f2a4-5d6b-4c8e-9a3f-1b2d4e6a8c53',
    notes: '#ops-team is PRIVATE: needs groups:history, and the bot must be invited to the channel.',
  }),

  node('Match Mention', 'n8n-nodes-base.code', 2, [-40, 0], {
    jsCode: fs.readFileSync(path.join(__dirname, 'src', '01-match-mention.js'), 'utf8'),
  }, { notes: 'Drops bots, edits, joins and self-mentions. Returns [] to halt.' }),

  node('Forward to Channel', 'n8n-nodes-base.slack', 2.2, [180, 0], {
    select: 'channel',
    channelId: { __rl: true, value: DEST_CHANNEL, mode: 'id' },
    messageType: 'text',
    text: '={{ $json.text }}',
    otherOptions: { includeLinkToWorkflow: false },
  }, { notes: 'Set the destination channel ID. Bot must be a member of it too.' }),
];

const connections = {
  'Watch ops-team': { main: [[{ node: 'Match Mention', type: 'main', index: 0 }]] },
  'Match Mention': { main: [[{ node: 'Forward to Channel', type: 'main', index: 0 }]] },
};

fs.writeFileSync(
  path.join(__dirname, 'workflow.json'),
  JSON.stringify(
    { name: 'Slack Mention Forwarder', nodes, connections, settings: { executionOrder: 'v1' }, pinData: {}, tags: [] },
    null,
    2
  ) + '\n'
);
console.log('wrote workflow.json (' + nodes.length + ' nodes)');
