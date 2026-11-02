import { CONTENT_DATE, type Article, type ArticleBlock } from "./types";

/**
 * Guides, part two: integration, migration and hiring.
 *
 * Same rule as part one: platform claims come from the vendor's own
 * documentation and are listed on the page. The arithmetic in the hiring
 * comparison uses stated example inputs, and says so, because we hold no
 * salary data of our own to report.
 */

const dates = { published: CONTENT_DATE, modified: CONTENT_DATE };

/** HighLevel's CSV rules, which every CSV-based migration shares. */
const CSV_RULES: ArticleBlock[] = [
  { k: "h2", text: "What are HighLevel's CSV import rules?" },
  {
    k: "ul",
    items: [
      "Each opportunity-only row needs a Contact ID, an Opportunity Name and a Pipeline.",
      "Opportunity custom fields must exist under the Opportunity object before import, not the Contact object.",
      "Opportunity CSV files must stay under 30 MB.",
      "Contact notes import at one note per contact, up to 5,000 characters.",
      "HighLevel's articles disagree on the contact file limit, 50 MB in one and 20 MB or 10,000 rows in an older one. Check your own import screen.",
      "There is no one-click rollback for a completed opportunity import, so start with a small test file.",
    ],
  },
];

const CSV_SOURCES = [
  {
    label: "HighLevel: Import opportunities using CSV",
    url: "https://help.gohighlevel.com/support/solutions/articles/155000002517-importing-opportunities-using-a-csv-file",
  },
  {
    label: "HighLevel: Import contacts",
    url: "https://help.gohighlevel.com/support/solutions/articles/155000005056-getting-started-import-existing-contacts",
  },
  {
    label: "HighLevel: Troubleshooting bulk imports",
    url: "https://help.gohighlevel.com/support/solutions/articles/48001223155-troubleshooting-bulk-imports-via-csv",
  },
];

const MIGRATION_RELATED = ["/services/crm-migration", "/guides/gohighlevel-workflow-not-triggering", "/pricing"];

export const guidesB: readonly Article[] = [
  {
    kind: "guide",
    slug: "n8n-gohighlevel-integration",
    eyebrow: "Guide, integration",
    title: "n8n and GoHighLevel integration: patterns that hold up",
    metaTitle: "n8n GoHighLevel Integration Guide",
    description:
      "Connect n8n and GoHighLevel with webhooks and the API: securing the webhook, a working contact upsert request, rate limits and error handling.",
    answer:
      "To connect n8n and GoHighLevel, send events from a HighLevel workflow to an n8n Webhook node, then write back through the HighLevel API using a Private Integration Token. Secure the webhook with header authentication, make writes safe to repeat, respect the published rate limits, and send failures to an error workflow.",
    ...dates,
    blocks: [
      { k: "h2", text: "What does the basic pattern look like?" },
      {
        k: "ol",
        items: [
          "A HighLevel workflow fires on an event and calls the n8n webhook URL with the contact's data.",
          "The n8n Webhook node checks a shared header and responds.",
          "n8n does the work, such as calling another system or reformatting data.",
          "An HTTP Request node writes the result back to HighLevel.",
          "Any failure routes to an error workflow that tells a person.",
        ],
      },
      { k: "h2", text: "How do you secure the webhook?" },
      {
        k: "p",
        text: "n8n's Webhook node supports Basic auth, Header auth, JWT auth and n8n User Auth. Header auth is the simple choice here. Add a long random secret as a custom header in the HighLevel webhook action, and require the same header in n8n. Without this, anyone who finds the URL can feed your workflow.",
      },
      { k: "h2", text: "What does a write back to HighLevel look like?" },
      {
        k: "p",
        text: "This is an HTTP Request node calling the contact upsert endpoint. Upsert is the safer choice for automation, because a retried request updates the same contact rather than creating a second one. Check the field names against the current API reference before you rely on them.",
      },
      {
        k: "code",
        label: "HTTP Request node",
        text: `POST https://services.leadconnectorhq.com/contacts/upsert
Authorization: Bearer YOUR_PRIVATE_INTEGRATION_TOKEN
Version: 2021-07-28
Content-Type: application/json

{
  "locationId": "YOUR_LOCATION_ID",
  "email": "lead@example.com",
  "firstName": "Sam",
  "phone": "+15555550100",
  "tags": ["from-n8n"]
}`,
      },
      { k: "h2", text: "What rate limits apply?" },
      {
        k: "table",
        head: ["Limit", "Value", "Counted per"],
        rows: [
          ["Burst", "100 requests per 10 seconds", "App and location or company"],
          ["Daily", "200,000 requests", "App and location or company"],
          ["Sandbox burst", "25 requests per 10 seconds", "Account, shared across its tokens"],
          ["Sandbox daily", "10,000 requests", "Account, shared across its tokens"],
        ],
      },
      {
        k: "p",
        text: "Responses carry headers such as X-RateLimit-Remaining and X-RateLimit-Daily-Remaining. For a bulk sync, batch your items in n8n and wait between batches rather than sending everything at once.",
      },
      { k: "h2", text: "What error handling does a production workflow need?" },
      {
        k: "ul",
        items: [
          "Retries on the HTTP Request node, for temporary failures.",
          "An n8n error workflow that alerts a person with the failed record.",
          "A check for duplicate events, because webhooks can arrive more than once.",
          "A short response from the webhook first, with slow work done after it.",
        ],
      },
      { k: "h2", text: "Should you use n8n's HighLevel node or HTTP Request?" },
      {
        k: "p",
        text: "n8n lists a HighLevel credential type, so check its current node for the operation you need. If it does not cover an endpoint, HTTP Request reaches the whole API. Tokens should sit in n8n credentials, never in a workflow's plain fields.",
      },
    ],
    faq: [
      {
        q: "Do Private Integration Tokens expire?",
        a: "They do not auto-refresh. HighLevel says you rotate or regenerate them manually.",
      },
      {
        q: "When do I need OAuth instead?",
        a: "HighLevel points to OAuth 2.0 for public or Marketplace apps. A Private Integration Token suits internal, single-account use.",
      },
    ],
    sources: [
      { label: "HighLevel: Rate limits", url: "https://marketplace.gohighlevel.com/docs/other/rate-limits/" },
      { label: "HighLevel: Private Integration Tokens", url: "https://marketplace.gohighlevel.com/docs/oauth/SandboxPIT/" },
      { label: "n8n: Webhook node", url: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook" },
    ],
    related: ["/services/workflow-automation", "/guides/gohighlevel-api", "/services/api-integrations"],
  },
  {
    kind: "guide",
    slug: "gohighlevel-api",
    eyebrow: "Guide, developers",
    title: "The GoHighLevel API: what it does and how to call it",
    metaTitle: "GoHighLevel API Guide: Auth and Rate Limits",
    description:
      "How the GoHighLevel API works: Private Integration Tokens versus OAuth, token lifetimes, rate limits, the required headers and an example request.",
    answer:
      "The GoHighLevel API is a REST API for reading and writing data such as contacts in an agency or sub-account. Internal integrations use a Private Integration Token, and public apps use OAuth 2.0. Limits are 100 requests per 10 seconds and 200,000 per day, counted per app and per location or company.",
    ...dates,
    blocks: [
      { k: "h2", text: "Which authentication method should you use?" },
      {
        k: "table",
        head: ["", "Private Integration Token", "OAuth 2.0"],
        rows: [
          ["Meant for", "Internal, single-account use", "Public or Marketplace apps"],
          ["User consent flow", "Not needed", "Needed"],
          ["Token renewal", "Rotated or regenerated manually", "Refresh token gets a new access token"],
          ["Lifetime", "No auto-refresh", "Access token one day, refresh token up to a year unless used"],
        ],
      },
      { k: "h2", text: "What does a request look like?" },
      {
        k: "code",
        label: "Request",
        text: `GET https://services.leadconnectorhq.com/contacts/CONTACT_ID
Authorization: Bearer YOUR_TOKEN
Version: 2021-07-28
Accept: application/json`,
      },
      {
        k: "code",
        label: "Response, shortened for this example",
        text: `{
  "contact": {
    "id": "CONTACT_ID",
    "locationId": "YOUR_LOCATION_ID",
    "email": "lead@example.com",
    "firstName": "Sam",
    "tags": ["from-n8n"]
  }
}`,
      },
      {
        k: "p",
        text: "Treat this as the shape of a call, and check the current reference for the exact fields of the endpoint you use.",
      },
      { k: "h2", text: "What are the rate limits?" },
      {
        k: "ul",
        items: [
          "100 requests per 10 seconds, per app and per location or company.",
          "200,000 requests per day, on the same scope.",
          "Installing on more sub-accounts does not divide the allowance, because each install gets its own budget.",
          "Sandbox and trial tokens are lower, at 25 per 10 seconds and 10,000 per day, shared across the account.",
        ],
      },
      { k: "h2", text: "What can the API not do?" },
      {
        k: "p",
        text: "Assume nothing. Not every screen in HighLevel has a matching endpoint, and the reference is the only reliable answer. Before scoping an integration, find the exact endpoint and scope for each step, and test it against a real sub-account.",
      },
      { k: "h2", text: "What about the old V1 API?" },
      {
        k: "p",
        text: "A separate public API reference for V1 is still online. Build anything new against the current Marketplace documentation instead.",
      },
    ],
    faq: [
      {
        q: "How do I watch my remaining quota?",
        a: "Read the X-RateLimit-Remaining and X-RateLimit-Daily-Remaining response headers.",
      },
      {
        q: "Can I create a Private Integration Token on a trial account?",
        a: "Yes. HighLevel made them available on sandbox and trial accounts, with lower limits.",
      },
    ],
    sources: [
      { label: "HighLevel: Rate limits", url: "https://marketplace.gohighlevel.com/docs/other/rate-limits/" },
      { label: "HighLevel: OAuth 2.0", url: "https://marketplace.gohighlevel.com/docs/Authorization/OAuth2.0/index.html" },
      { label: "HighLevel: API documentation", url: "https://help.gohighlevel.com/support/solutions/articles/48001060529-highlevel-api-documentation" },
    ],
    related: ["/services/api-integrations", "/guides/n8n-gohighlevel-integration", "/services/web-app-development"],
  },
  {
    kind: "guide",
    slug: "migrate-hubspot-to-gohighlevel",
    eyebrow: "Guide, migration",
    title: "Migrate from HubSpot to GoHighLevel",
    metaTitle: "Migrate From HubSpot to GoHighLevel",
    description:
      "HighLevel's HubSpot importer moves contacts, deals, companies, notes and tasks. What maps where, what it leaves behind, and how to run it safely.",
    answer:
      "GoHighLevel has a native HubSpot importer. It connects to your HubSpot account and moves contacts, deals, companies, notes, tasks, emails, pipelines and custom properties. Deals become opportunities. Calculated fields arrive as plain text, and recurring tasks stay behind. Test it in a non-production location first, then review the error list.",
    ...dates,
    blocks: [
      { k: "h2", text: "What maps to what?" },
      {
        k: "table",
        head: ["HubSpot", "GoHighLevel", "Notes"],
        rows: [
          ["Contacts", "Contacts", "Standard and custom properties, notes and emails"],
          ["Deals", "Opportunities", "Pipelines and stages come across"],
          ["Companies", "Companies", "Properties and associations"],
          ["Properties", "Custom fields", "Mapped by key"],
          ["Calculated fields", "Single line text", "They stop calculating"],
          ["Emails", "Emails", "Read only after import"],
        ],
      },
      { k: "h2", text: "What does not come across?" },
      {
        k: "ul",
        items: [
          "Recurring tasks",
          "Opportunities with no associated contact",
          "Notes linked to companies",
          "Some associations, because of platform limits",
          "File attachments can cause errors, so plan to re-attach them by hand",
        ],
      },
      { k: "h2", text: "How do you run the import?" },
      {
        k: "ol",
        items: [
          "Use a clean account where possible, with English as the account language.",
          "Turn on Allow duplicates for contacts and opportunities. Turn de-duplication back on afterwards.",
          "Open Import on Contacts, Companies or Opportunities, choose Import data, and connect HubSpot.",
          "Select objects. Choosing Deals also selects Contacts.",
          "Start the import, which runs in the background.",
          "Open Import details, filter by Error, download the list, fix the causes and run it again.",
        ],
      },
      {
        k: "note",
        title: "Check for field key clashes",
        text: "Custom fields map by key, so an existing field with the same key can cause errors. Avoid deleting and re-importing contacts, because restoring the deleted ones can create duplicates.",
      },
      { k: "h2", text: "What has to be rebuilt by hand?" },
      {
        k: "p",
        text: "HubSpot workflows and forms need rebuilding in HighLevel. Our [migration service](/services/crm-migration) covers this work, billed against prepaid hours.",
      },
    ],
    faq: [
      {
        q: "Does the import overwrite existing records?",
        a: "By default it adds records without overwriting existing ones.",
      },
      {
        q: "How many contacts can link to one opportunity?",
        a: "HighLevel lists up to 10 additional contacts per opportunity.",
      },
    ],
    sources: [
      {
        label: "HighLevel: Import HubSpot data",
        url: "https://help.gohighlevel.com/support/solutions/articles/155000007947-import-data-from-hubspot",
      },
    ],
    related: MIGRATION_RELATED,
  },
  {
    kind: "guide",
    slug: "migrate-activecampaign-to-gohighlevel",
    eyebrow: "Guide, migration",
    title: "Migrate from ActiveCampaign to GoHighLevel",
    metaTitle: "Migrate ActiveCampaign to GoHighLevel",
    description:
      "Move from ActiveCampaign to GoHighLevel: CSV exports for contacts and deals, email templates by share link, and what has to be rebuilt by hand.",
    answer:
      "Moving from ActiveCampaign to GoHighLevel is a CSV job. Export contacts and deals, import contacts first, then import deals as opportunities into a pipeline and stage. Email templates transfer through a share link. Landing pages, forms and automations do not transfer, so they must be documented and then rebuilt in HighLevel.",
    ...dates,
    blocks: [
      { k: "h2", text: "What maps to what?" },
      {
        k: "table",
        head: ["ActiveCampaign", "GoHighLevel", "How"],
        rows: [
          ["Contacts", "Contacts", "CSV, with fields mapped on import"],
          ["Deals", "Opportunities", "CSV, into a specific pipeline and stage"],
          ["Email templates", "Email templates", "Share link"],
          ["Automations", "Workflows", "Rebuilt by hand"],
          ["Forms", "Forms", "Rebuilt by hand"],
          ["Landing pages", "Funnels and pages", "Rebuilt by hand"],
          ["Tracking codes", "Settings", "Added again"],
        ],
      },
      { k: "h2", text: "How should the files be prepared?" },
      {
        k: "ul",
        items: [
          "Each contact needs a valid email address.",
          "Dates use YYYY-MM-DD.",
          "Files use UTF-8 encoding, with line breaks, emojis and special characters removed.",
          "Create custom fields in HighLevel first, for anything with no direct equivalent.",
          "Each deal needs a matching contact in HighLevel, so import contacts first.",
        ],
      },
      ...CSV_RULES,
      { k: "h2", text: "How should you rebuild automations?" },
      {
        k: "p",
        text: "Write each automation down first, with its triggers, actions and timing. HighLevel's triggers and actions differ, so adapt the logic rather than copying it step for step. Test each one with a real contact before you switch sending over.",
      },
    ],
    faq: [
      { q: "Do ActiveCampaign automations import?", a: "No. They are rebuilt as HighLevel workflows." },
      { q: "Which should I import first?", a: "Contacts, because each deal needs a matching contact." },
    ],
    sources: [
      {
        label: "HighLevel: ActiveCampaign migration guide",
        url: "https://help.gohighlevel.com/support/solutions/articles/155000003296-activecampaign-to-highlevel-migration-guide-",
      },
      ...CSV_SOURCES,
    ],
    related: MIGRATION_RELATED,
  },
  {
    kind: "guide",
    slug: "migrate-keap-to-gohighlevel",
    eyebrow: "Guide, migration",
    title: "Migrate from Keap to GoHighLevel",
    metaTitle: "Migrate From Keap to GoHighLevel",
    description:
      "Plan a Keap to GoHighLevel migration: export contacts, companies and opportunities to CSV, map tags and fields, and rebuild campaigns as workflows.",
    answer:
      "To move from Keap to GoHighLevel, plan on a CSV migration. We did not find a native Keap importer in HighLevel's help center when this was written. Export contacts, companies and opportunities, map fields and tags, import contacts first, then rebuild Keap campaigns as HighLevel workflows, and test each one before switching.",
    ...dates,
    blocks: [
      { k: "h2", text: "What maps to what?" },
      {
        k: "table",
        head: ["Keap", "GoHighLevel", "How"],
        rows: [
          ["Contacts", "Contacts", "CSV, fields mapped on import"],
          ["Tags", "Tags", "A column in the contact CSV, applied on import"],
          ["Companies", "Companies", "CSV"],
          ["Opportunities", "Opportunities", "CSV, into a pipeline and stage"],
          ["Campaign sequences", "Workflows", "Rebuilt by hand"],
          ["Forms and landing pages", "Forms and funnels", "Rebuilt by hand"],
        ],
      },
      { k: "h2", text: "What is the safe order of work?" },
      {
        k: "ol",
        items: [
          "List your tags, and retire the ones nothing uses.",
          "Create custom fields and pipelines in HighLevel.",
          "Import a small test file of contacts and check the result.",
          "Import all contacts, then opportunities.",
          "Rebuild campaigns as workflows, one at a time.",
          "Register [A2P](/guides/a2p-10dlc-registration-gohighlevel) if you will send SMS, before you need it.",
          "Move sending over only once the workflows pass a test.",
        ],
      },
      ...CSV_RULES,
      {
        k: "note",
        title: "Check the Keap side for yourself",
        text: "This guide is based on HighLevel's published import rules. Export options depend on your Keap plan, so confirm them in your account first.",
      },
    ],
    faq: [
      { q: "Do Keap campaigns transfer?", a: "No. We rebuild them as HighLevel workflows." },
      { q: "Can tags be applied during import?", a: "Yes. HighLevel's migration guidance applies contact tags during import." },
    ],
    sources: CSV_SOURCES,
    related: MIGRATION_RELATED,
  },
  {
    kind: "guide",
    slug: "migrate-pipedrive-to-gohighlevel",
    eyebrow: "Guide, migration",
    title: "Migrate from Pipedrive to GoHighLevel",
    metaTitle: "Migrate From Pipedrive to GoHighLevel",
    description:
      "Plan a Pipedrive to GoHighLevel migration: map people, organizations, deals and pipelines, keep the links between them, and test before moving over.",
    answer:
      "To move from Pipedrive to GoHighLevel, plan on a CSV migration. We did not find a native Pipedrive importer in HighLevel's help center when this was written. People become contacts, organizations become companies, and deals become opportunities. Rebuild pipelines first, import contacts next, and use the HighLevel Contact IDs to link opportunities.",
    ...dates,
    blocks: [
      { k: "h2", text: "What maps to what?" },
      {
        k: "table",
        head: ["Pipedrive", "GoHighLevel", "How"],
        rows: [
          ["People", "Contacts", "CSV, fields mapped on import"],
          ["Organizations", "Companies", "CSV"],
          ["Deals", "Opportunities", "CSV, needs a HighLevel Contact ID"],
          ["Pipelines and stages", "Pipelines and stages", "Created first in HighLevel"],
          ["Custom fields", "Custom fields", "Created first, on the matching object"],
          ["Automations", "Workflows", "Rebuilt by hand"],
        ],
      },
      { k: "h2", text: "Why does the order of work matter?" },
      {
        k: "p",
        text: "An opportunity-only row in HighLevel needs a Contact ID. That ID only exists once the contact has been imported. So contacts go first, then you export them from HighLevel with their IDs, then match deals to those IDs by email.",
      },
      {
        k: "ol",
        items: [
          "Create pipelines, stages and custom fields in HighLevel.",
          "Import a small test file of people, then all of them.",
          "Export contacts from HighLevel, with their Contact IDs.",
          "Match each Pipedrive deal to a Contact ID, by email.",
          "Import a small test file of deals, then the rest.",
          "Reconcile the deal count and total value per stage against Pipedrive.",
        ],
      },
      ...CSV_RULES,
      {
        k: "note",
        title: "Check the Pipedrive side for yourself",
        text: "This guide is based on HighLevel's published import rules. Confirm your export options in your own Pipedrive account first.",
      },
    ],
    faq: [
      { q: "Will my deal stages carry over?", a: "Yes, if the pipeline and stages exist in HighLevel before you import." },
      { q: "Can a bad import be undone?", a: "Not with one click, so always test a small file first." },
    ],
    sources: CSV_SOURCES,
    related: MIGRATION_RELATED,
  },
  {
    kind: "guide",
    slug: "gohighlevel-vs-in-house-hire",
    eyebrow: "Guide, hiring",
    title: "GoHighLevel help versus an in-house hire: the arithmetic",
    metaTitle: "GoHighLevel Agency vs In-House Hire Cost",
    description:
      "A full-time GoHighLevel hire compared with prepaid hours, with the arithmetic shown. Use your own salary figures, and see when a hire is the better call.",
    answer:
      "A full-time technical hire is a fixed monthly cost whether the work is there or not. Prepaid hours cost only what you buy. With an example loaded cost of $6,000 a month, a 150-hour monthly plan costs $1,950. A hire starts to make sense once the work is steady and full-time, and your systems need someone in the building.",
    ...dates,
    blocks: [
      { k: "h2", text: "What does the comparison look like?" },
      {
        k: "p",
        text: "The salary here is an example, not market data. Replace it with your own figure.",
      },
      {
        k: "table",
        head: ["", "Example hire", "Monthly plan, 50h", "Monthly plan, 150h"],
        rows: [
          ["Yearly salary", "$60,000", "None", "None"],
          ["Overhead, assumed at 20%", "$12,000", "None", "None"],
          ["Monthly cost", "$6,000", "$850", "$1,950"],
          ["Yearly cost", "$72,000", "$10,200", "$23,400"],
          ["Hours available per month", "About 173, before leave and meetings", "50", "150"],
          ["Effective cost per hour", "About $35", "$17", "$13"],
        ],
      },
      { k: "h2", text: "How do you run it with your numbers?" },
      {
        k: "ol",
        items: [
          "Take the salary and add your overhead for benefits, tools and management.",
          "Divide by 12 for the monthly cost.",
          "Estimate the technical hours you need each month, based on the last three months.",
          "Compare that cost against the [plan closest to those hours](/pricing).",
        ],
      },
      { k: "h2", text: "When is a hire the better choice?" },
      {
        k: "ul",
        items: [
          "The work fills a full-time role, every month, for the foreseeable future.",
          "You need someone in your meetings and your time zone all day.",
          "The role includes managing people, not only technical delivery.",
          "Your systems hold knowledge that should stay inside the company.",
        ],
      },
      { k: "h2", text: "When are prepaid hours the better choice?" },
      {
        k: "ul",
        items: [
          "The load swings from month to month, as agency work often does.",
          "You need several skills, and one person is unlikely to have them all.",
          "You want to try the work on a small job before committing further.",
        ],
      },
      {
        k: "note",
        title: "What this table leaves out",
        text: "A hire builds context that an outside team has to learn. Our plans do not include a dedicated engineer or a response-time target. Weigh both sides before you decide.",
      },
    ],
    faq: [
      { q: "Do monthly hours roll over?", a: "No. Monthly balances reset each billing cycle." },
      { q: "Can I cancel a monthly plan?", a: "Yes. Ask at least 24 hours before your next renewal date." },
    ],
    related: ["/pricing", "/for/agencies", "/guides/hire-gohighlevel-developer"],
  },
  {
    kind: "guide",
    slug: "hire-gohighlevel-developer",
    eyebrow: "Guide, hiring",
    title: "How to hire a GoHighLevel developer",
    metaTitle: "How to Hire a GoHighLevel Developer",
    description:
      "What to ask before you hire a GoHighLevel developer, what it costs, what expert should mean, and the warning signs in a proposal or a profile.",
    answer:
      "To hire a GoHighLevel developer, give every candidate the same small paid task, and ask how they handle failure, access and A2P. Check for a verifiable work history rather than badges alone. Published rates vary from $6 to $30 an hour, and one-time sub-account builds are quoted at $500 to $1,500.",
    ...dates,
    blocks: [
      { k: "h2", text: "What should you ask?" },
      {
        k: "ol",
        items: [
          "Show me a workflow that failed in production. How did you find out?",
          "How do you handle a contact entering the same workflow twice?",
          "What access do you need, and can you work without my password?",
          "What is your process for an A2P rejection?",
          "How do you document what you build, so someone else can take over?",
          "What happens when a task runs over your estimate?",
          "Can you show me verifiable reviews or a work history?",
        ],
      },
      { k: "h2", text: "What should expert mean?" },
      {
        k: "ul",
        items: [
          "They build error handling and alerts without being asked.",
          "They tell you when a request is a bad idea, and why.",
          "They use GoHighLevel well, and also know when it needs an API or a tool like n8n.",
          "They ask about your business process before opening the builder.",
        ],
      },
      { k: "h2", text: "What does it cost?" },
      {
        k: "p",
        text: "Our [GoHighLevel setup cost guide](/guides/gohighlevel-setup-cost) lists the published ranges with their sources. One job listing we reviewed offered $15 to $30 an hour for an intermediate builder. One guide treats under $300 for a full build as a warning sign.",
      },
      { k: "h2", text: "What are the warning signs?" },
      {
        k: "ul",
        items: [
          "A guaranteed A2P approval, which the provider does not control.",
          "A promised number of leads or a revenue figure.",
          "A request for your main login, when role-based access would do.",
          "No written scope before work starts.",
          "Reviews that cannot be traced to a platform or a person.",
        ],
      },
      { k: "h2", text: "How can you test someone cheaply?" },
      {
        k: "p",
        text: "Pay for a small, real, clearly defined job first. Our own [5-hour pack at $95](/pricing) exists for this reason. Most of the longer engagements on our record began with a small job.",
      },
      {
        k: "note",
        title: "A note on badges",
        text: "Sysora Stack is not an official HighLevel employee team, partner or certified provider. Our evidence is the [Upwork record](/case-studies).",
      },
    ],
    faq: [
      {
        q: "Should I hire a freelancer or a team?",
        a: "A freelancer can suit one skill and steady work. A team suits work across several skills or a load that changes.",
      },
      {
        q: "Should I give a developer my password?",
        a: "No. Use a role-based user with the minimum permissions the job needs.",
      },
    ],
    sources: [
      { label: "AutogenCRM: GHL experts, what they charge", url: "https://autogencrm.com/?p=3687" },
      { label: "Don't Do It Yourself: GoHighLevel VA cost", url: "https://ddiy.co/virtual-assistant-gohighlevel-cost/" },
    ],
    related: ["/guides/gohighlevel-setup-cost", "/guides/gohighlevel-vs-in-house-hire", "/case-studies"],
  },
];
