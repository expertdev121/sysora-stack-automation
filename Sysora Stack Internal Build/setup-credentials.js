// Creates every n8n credential in one shot, so you never touch the UI forms.
//
//   1. Fill in the SECRETS block below.
//   2. node setup-credentials.js
//   3. Delete the file, or blank the secrets back out.
//
// Field names came from n8n's own credential schema endpoint, so they are exact.
// Nothing here is sent anywhere except your own n8n instance.

const N8N = 'https://n8n-production-db72.up.railway.app';
const N8N_API_KEY = 'PASTE_YOUR_N8N_API_KEY';

// ─── SECRETS ────────────────────────────────────────────────────────────────
const SECRETS = {
  openAiApiKey: 'PASTE_sk-proj-...',

  jiraEmail: 'expertdeveloper121@gmail.com', // must match the token's owner
  jiraApiToken: 'PASTE_ATATT...',
  jiraDomain: 'https://sysorastack.atlassian.net',

  slackBotToken: 'PASTE_xoxb-...',
  slackSigningSecret: 'PASTE_from_Basic_Information', // '' to disable verification
};
// ────────────────────────────────────────────────────────────────────────────

const CREDENTIALS = [
  {
    name: 'OpenAI (Sysora)',
    type: 'openAiApi',
    data: { apiKey: SECRETS.openAiApiKey },
  },
  {
    name: 'Jira Cloud (Sysora Stack)',
    type: 'jiraSoftwareCloudApi',
    data: {
      email: SECRETS.jiraEmail,
      apiToken: SECRETS.jiraApiToken,
      domain: SECRETS.jiraDomain,
    },
  },
  {
    name: 'Slack (Sysora Ops Bot)',
    type: 'slackApi',
    data: {
      accessToken: SECRETS.slackBotToken,
      signatureSecret: SECRETS.slackSigningSecret,
    },
  },
];

async function main() {
  const unfilled = Object.entries(SECRETS).filter(([, v]) => String(v).startsWith('PASTE'));
  if (N8N_API_KEY.startsWith('PASTE') || unfilled.length) {
    console.error('Fill these in first: ' + [
      ...(N8N_API_KEY.startsWith('PASTE') ? ['N8N_API_KEY'] : []),
      ...unfilled.map(([k]) => k),
    ].join(', '));
    process.exit(1);
  }

  for (const cred of CREDENTIALS) {
    const res = await fetch(N8N + '/api/v1/credentials', {
      method: 'POST',
      headers: { 'X-N8N-API-KEY': N8N_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(cred),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log('created  ' + cred.name.padEnd(28) + ' id=' + body.id);
    } else {
      console.log('FAILED   ' + cred.name.padEnd(28) + ' ' + res.status + ' ' + (body.message || ''));
    }
  }

  console.log('\nNow open each workflow and pick these from the Credential dropdowns.');
  console.log('Then blank out the secrets in this file.');
}

main();
