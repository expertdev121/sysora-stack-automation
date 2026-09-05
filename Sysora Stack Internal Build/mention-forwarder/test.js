// Runs the real Code-node source against stubbed Slack event payloads.
// Run:  node test.js
const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, 'src', '01-match-mention.js'), 'utf8');

function match(event) {
  const $input = { first: () => ({ json: event }), all: () => [{ json: event }] };
  const out = new Function('$input', '"use strict";' + code)($input);
  return out.length ? out[0].json : null;
}

const ME = 'U09KNBVTGG0';
const CH = 'C0BS56L7V1A';
const base = { type: 'message', channel: CH, user: 'U07CPGT5QCU', ts: '1787431869.924959' };

let failures = 0;
const check = (label, cond, detail) => {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + label + (detail ? '  -> ' + detail : ''));
  if (!cond) failures++;
};

console.log('\nForwards');
{
  const r = match({ ...base, text: 'hey <@' + ME + '> can you check GS-1?' });
  check('a real mention forwards', r !== null);
  check('names the sender', r && r.text.includes('<@U07CPGT5QCU>'));
  check('links the source channel', r && r.text.includes('<#' + CH + '>'));
  check('quotes the message', r && r.text.includes('> hey <@' + ME + '>'));
  check('no broken jump link by default', r && !r.text.includes('slack.com/archives'));
}

console.log('\nDrops');
{
  check('bot post (Jira)', match({ ...base, bot_id: 'B123', text: 'ticket <@' + ME + '> assigned' }) === null);
  check('channel_join noise', match({ ...base, subtype: 'channel_join', text: '<@' + ME + '> joined' }) === null);
  check('message edit', match({ ...base, subtype: 'message_changed', text: '<@' + ME + '>' }) === null);
  // This one flips with the ALLOW_SELF_MENTION switch at the top of the source.
  const selfAllowed = /ALLOW_SELF_MENTION\s*=\s*true/.test(code);
  const self = match({ ...base, user: ME, text: 'note to self <@' + ME + '>' });
  check(
    selfAllowed ? 'self-mention forwards (testing mode ON)' : 'self-mention dropped',
    selfAllowed ? self !== null : self === null,
    'ALLOW_SELF_MENTION=' + selfAllowed
  );
  check('untagged chatter', match({ ...base, text: 'deploy is green' }) === null);
  check('different channel', match({ ...base, channel: 'C0B42H33XCZ', text: '<@' + ME + '>' }) === null);
  check('@here broadcast (off by default)', match({ ...base, text: '<!here> standup' }) === null);
  check('substring lookalike ID', match({ ...base, text: 'ping <@U09KNBVTGG0X>' }) === null);
  check('non-message event', match({ ...base, type: 'reaction_added', text: '<@' + ME + '>' }) === null);
  check('empty text', match({ ...base, text: '' }) === null);
}

console.log('\nThreads');
{
  const r = match({ ...base, thread_ts: '1787431000.111', text: 'in thread <@' + ME + '> look' });
  check('thread reply still forwards', r !== null);
  check('thread_ts carried through', r && r.threadTs === '1787431000.111', r && String(r.threadTs));
}

console.log('\n' + (failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'));
process.exit(failures === 0 ? 0 : 1);
