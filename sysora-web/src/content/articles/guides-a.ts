import { packs } from "@/content/landing/sales";

import { CONTENT_DATE, type Article } from "./types";

/**
 * Guides, part one: compliance, cost and platform setup.
 *
 * Every platform claim here was checked against the vendor's own
 * documentation on the date shown, and the sources are listed on the
 * page. HighLevel moves menus and changes fees often, so a guide that
 * has not been re-checked should have its date left alone rather than
 * bumped. First-hand timing data is not claimed, because the task ledger
 * has none to report yet.
 */

const dates = { published: CONTENT_DATE, modified: CONTENT_DATE };

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export const guidesA: readonly Article[] = [
  {
    kind: "guide",
    slug: "a2p-10dlc-registration-gohighlevel",
    eyebrow: "Guide, compliance",
    title: "GoHighLevel A2P 10DLC registration, step by step",
    metaTitle: "GoHighLevel A2P 10DLC Registration Guide",
    description:
      "How to register an A2P 10DLC brand and campaign in GoHighLevel, what it costs, why campaigns get rejected, and how each rejection code gets fixed.",
    answer:
      "A2P 10DLC is the registration US carriers require for business SMS sent from local numbers. In GoHighLevel you register a brand, then a campaign, under Settings, Phone System, Trust Center. Both must be approved before you send. Most rejections come from consent details that do not match your website or samples.",
    ...dates,
    blocks: [
      { k: "h2", text: "What are the steps?" },
      {
        k: "ol",
        items: [
          "Open Settings, then Phone System, then Trust Center, and start from the A2P Messaging card.",
          "Answer whether the business has a Tax ID. That answer decides between the Standard and Sole Proprietor paths.",
          "Register the brand. Uploading your IRS CP-575 is optional and can pre-fill the legal name, EIN and address.",
          "Register the campaign once the brand is approved. Describe the use case, sample messages, opt-in method and consent details.",
          "Run the AI Compliance Review, fix what it flags, and submit.",
          "After approval, check that each local number shows the A2P Verified label under Settings, Phone System, Phone Numbers. Link any number that does not.",
        ],
      },
      {
        k: "note",
        title: "Brand approval is not enough",
        text: "HighLevel states that brand approval alone does not allow sending. You need an approved campaign as well.",
      },
      { k: "h2", text: "What does A2P registration cost?" },
      {
        k: "p",
        text: "These are HighLevel's listed fees, from an article last modified on September 24, 2026. HighLevel says prices can change, so check the Trust Center before you submit.",
      },
      {
        k: "table",
        head: ["Fee", "Amount"],
        rows: [
          ["One-time registration, Sole Proprietor", "$22.50"],
          ["One-time registration, Low Volume Standard", "$22.50"],
          ["One-time registration, High Volume Standard", "$64.00"],
          ["Each additional campaign under the same brand", "$15.00"],
          ["Monthly campaign, Sole Proprietor", "$2.00"],
          ["Monthly campaign, Low Volume Mixed", "$1.50"],
          ["Monthly campaign, Standard", "$10.00"],
          ["Resubmitting a rejected campaign", "No additional vetting fee"],
        ],
      },
      { k: "p", text: "Per-message carrier fees are charged on top of these." },
      { k: "h2", text: "How long does approval take?" },
      {
        k: "p",
        text: "Twilio, which publishes the most detail, says standard campaigns can take up to 5 business days and that Sole Proprietor campaigns are usually decided fastest. HighLevel adds that carrier systems may need several business days to receive updated information after approval. These are third-party figures, not commitments from us.",
      },
      {
        k: "p",
        text: "A new EIN is a common trap. HighLevel's brand guide says EINs issued in the last 15 days may be rejected, while an older LC Phone article suggests waiting longer. If your EIN is new, allow extra time.",
      },
      { k: "h2", text: "Why do campaigns get rejected?" },
      {
        k: "p",
        text: "Twilio publishes numbered rejection codes. HighLevel shows its own View required fixes screen, but the causes are the same family.",
      },
      {
        k: "table",
        head: ["Code", "Meaning", "Fix"],
        rows: [
          ["30886", "Invalid campaign description", "Make it more detailed and consistent with the use case"],
          ["30892", "URL shortener in a sample", "Use a branded short domain you own, not bit.ly or TinyURL"],
          ["30893", "Sample messages unclear or off-topic", "Use real samples, bracket templated fields, include the business name"],
          ["30909", "Message flow incomplete or unverifiable", "Describe every opt-in path, with brand, purpose, frequency, rates, STOP and HELP"],
          ["30883", "Prohibited content", "Appeal, or materially change the campaign or brand"],
          ["30884", "High spam or phishing risk", "Appeal, or materially change the campaign or brand"],
        ],
      },
      { k: "h2", text: "What should you check before submitting?" },
      {
        k: "ul",
        items: [
          "The use case, description, samples, opt-in flow, website, privacy policy and terms all agree with each other.",
          "SMS consent checkboxes are unchecked by default.",
          "SMS consent is not required to submit the form.",
          "A privacy policy and terms page are live at public URLs.",
          "The form language names your brand, the message purpose, frequency, message and data rates, and how to opt out.",
        ],
      },
    ],
    faq: [
      {
        q: "Who approves an A2P campaign?",
        a: "The Campaign Registry and the carriers. HighLevel does not make the approval decision.",
      },
      {
        q: "Do toll-free numbers use A2P 10DLC?",
        a: "No. Toll-free numbers use a separate verification process.",
      },
      {
        q: "Does resubmitting cost another vetting fee?",
        a: "No. HighLevel lists no additional vetting fee for resubmitting a rejected campaign.",
      },
    ],
    sources: [
      {
        label: "HighLevel: A2P 10DLC messaging fees",
        url: "https://help.gohighlevel.com/support/solutions/articles/155000005200-a2p-10dlc-messaging-fees-registration-monthly-and-carrier-costs",
      },
      {
        label: "HighLevel: A2P brand registration guide",
        url: "https://help.gohighlevel.com/support/solutions/articles/155000008140-registering-your-a2p-brand",
      },
      {
        label: "HighLevel: Campaign approval best practices",
        url: "https://help.gohighlevel.com/support/solutions/articles/48001229784-a2p-10dlc-campaign-approval-best-practices",
      },
      {
        label: "Twilio: Troubleshooting A2P campaigns",
        url: "https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/troubleshooting-a2p-brands/troubleshooting-and-rectifying-a2p-campaigns-1",
      },
      { label: "Twilio: Error 30909", url: "https://www.twilio.com/docs/api/errors/30909" },
    ],
    related: [
      "/services/a2p-10dlc-registration",
      "/guides/gohighlevel-missed-call-text-back",
      "/guides/gohighlevel-workflow-not-triggering",
    ],
  },
  {
    kind: "guide",
    slug: "gohighlevel-setup-cost",
    eyebrow: "Guide, pricing",
    title: "How much does GoHighLevel setup cost?",
    metaTitle: "How Much Does GoHighLevel Setup Cost?",
    description:
      "What GoHighLevel setup costs in November 2026: platform fees, published expert rates, hourly rates by region, and Sysora Stack's own rate table.",
    answer:
      "GoHighLevel setup has two costs: the platform and the labor. The platform is listed at $97, $297 or $497 a month. Published expert fees run from $500 to $1,500 for a one-time sub-account build, and hourly rates vary widely by region. Sysora Stack publishes $19 an hour down to $13.",
    ...dates,
    blocks: [
      { k: "h2", text: "What does the platform cost?" },
      {
        k: "table",
        head: ["Plan", "Monthly price"],
        rows: [
          ["Starter", "$97"],
          ["Unlimited", "$297"],
          ["Agency Pro, with SaaS Mode", "$497"],
        ],
      },
      { k: "p", text: "SMS, email and telephony usage are charged on top of the plan." },
      { k: "h2", text: "What do other providers charge for setup?" },
      {
        k: "p",
        text: "Few providers publish numbers, so this table is a snapshot of what we could find in November 2026. Each source sells these services or a related one, so treat the figures as rough.",
      },
      {
        k: "table",
        head: ["Work", "Published range", "Reported by"],
        rows: [
          ["One-time sub-account build", "$500 to $1,500", "AutogenCRM"],
          ["Ongoing management retainer", "$500 to $2,000 a month", "AutogenCRM"],
          ["Custom snapshot for resale", "$1,500 to $5,000", "AutogenCRM"],
          ["GoHighLevel VA, Philippines", "$6 to $12 an hour", "Don't Do It Yourself"],
          ["GoHighLevel VA, Latin America", "$8 to $15 an hour", "Don't Do It Yourself"],
          ["GoHighLevel VA, Eastern Europe", "$12 to $25 an hour", "Don't Do It Yourself"],
        ],
      },
      { k: "h2", text: "What does Sysora Stack charge?" },
      {
        k: "p",
        text: "One-time packs and monthly plans use the same seven prices. We publish them because a price you have to book a call for is hard to compare.",
      },
      {
        k: "table",
        head: ["Hours", "Price", "Rate per hour"],
        rows: packs.map((p) => [`${p.hours}`, money(p.price), `$${p.rate}`]),
      },
      { k: "h2", text: "Why do quotes differ so much?" },
      {
        k: "ul",
        items: [
          "A fixed-price quote includes the provider's guess about overruns.",
          "A VA rate buys task execution, and an expert rate buys decisions as well.",
          "An existing account costs more to audit than an empty one costs to start.",
          "A2P registration, migrations and integrations are often priced separately.",
        ],
      },
      { k: "h2", text: "How do you estimate your own project?" },
      {
        k: "ol",
        items: [
          "List the tasks, not the outcome.",
          "Ask for a written estimate per task, in hours.",
          "Ask what happens when a task overruns the estimate.",
          "Ask whether unused time comes back to you.",
        ],
      },
      {
        k: "p",
        text: "If you want a number on your own list, [request an estimate](/request-estimate) before you pay anything.",
      },
    ],
    faq: [
      {
        q: "What is the cheapest way to start with Sysora Stack?",
        a: "The 5-hour pack, at $95.",
      },
      {
        q: "Is HighLevel's own platform fee included in those hours?",
        a: "No. Your subscription and usage fees stay on your own account.",
      },
    ],
    sources: [
      { label: "AutogenCRM: GHL experts, what they charge", url: "https://autogencrm.com/?p=3687" },
      {
        label: "Don't Do It Yourself: GoHighLevel VA cost",
        url: "https://ddiy.co/virtual-assistant-gohighlevel-cost/",
      },
      { label: "RSLA: GoHighLevel pricing 2026", url: "https://rsla.io/blog/go-high-level-pricing" },
    ],
    related: ["/pricing", "/guides/gohighlevel-vs-in-house-hire", "/guides/hire-gohighlevel-developer"],
  },
  {
    kind: "guide",
    slug: "gohighlevel-snapshots",
    eyebrow: "Guide, GoHighLevel",
    title: "GoHighLevel snapshots: what they carry and what breaks",
    metaTitle: "GoHighLevel Snapshots: What Breaks on Import",
    description:
      "What a GoHighLevel snapshot includes, what it leaves behind, how load differs from push, and a checklist for auditing one before you import it.",
    answer:
      "A GoHighLevel snapshot copies a sub-account's configuration, such as workflows, funnels, calendars and custom fields, into another sub-account. It does not copy contacts, conversations, Stripe connections, phone numbers or domains. Most breakage comes from those missing connections, and from pushing an update that overwrites edits made by hand.",
    ...dates,
    blocks: [
      { k: "h2", text: "What does a snapshot include?" },
      {
        k: "ul",
        items: [
          "Workflows, triggers and emails",
          "Funnels, forms and calendars",
          "Custom fields and custom values",
          "Membership content, services and webinars",
          "Custom objects, with their fields and supported associations",
        ],
      },
      { k: "h2", text: "What does a snapshot leave behind?" },
      {
        k: "ul",
        items: [
          "Contacts, appointments and conversations",
          "Reputation data",
          "Stripe connections and other integrations",
          "Phone number ownership, routing and carrier registration",
          "Published domains. Imported funnels and websites arrive as drafts.",
        ],
      },
      { k: "h2", text: "How is loading different from pushing an update?" },
      {
        k: "table",
        head: ["Action", "What happens"],
        rows: [
          ["New sub-account from a snapshot", "Nothing to overwrite, so no conflicts"],
          ["Loading into an existing sub-account", "Adds items, and conflicts ask you to Override or Skip"],
          ["Pushing an update", "Overwrites existing assets, and manual edits to them are reverted"],
        ],
      },
      {
        k: "note",
        title: "Not a backup",
        text: "HighLevel warns that loading a snapshot is not a backup or a one-click undo. Loading the same snapshot twice can also create conflicts or duplicates.",
      },
      { k: "h2", text: "How do you audit a snapshot before importing it?" },
      {
        k: "ol",
        items: [
          "Import it into an empty test sub-account first.",
          "List every workflow and check which ones are published.",
          "Check every action that needs a connection, such as payments, phone, email or an integration.",
          "Search emails and messages for another business's name, link or number.",
          "Reconnect domains and publish funnels, then submit one test lead through the whole path.",
          "Check custom object limits. HighLevel says an import that would exceed the limit creates no custom objects at all.",
        ],
      },
      { k: "h2", text: "Why does a workflow go quiet after import?" },
      {
        k: "p",
        text: "Usually a missing connection or a draft state. Our [workflow troubleshooting guide](/guides/gohighlevel-workflow-not-triggering) walks through the checks in order.",
      },
    ],
    faq: [
      { q: "Do snapshots copy contacts?", a: "No. Snapshots do not move contact records." },
      {
        q: "Does a snapshot register A2P for the new sub-account?",
        a: "No. Carrier registration does not transfer, so each sending sub-account needs its own.",
      },
    ],
    sources: [
      {
        label: "HighLevel: Pushing and loading snapshot updates",
        url: "https://help.gohighlevel.com/support/solutions/articles/48000982587-pushing-loading-snapshot-updates-to-client-accounts",
      },
      {
        label: "HighLevel: Create a sub-account from a snapshot",
        url: "https://help.gohighlevel.com/support/solutions/articles/155000005762-create-a-new-sub-account-using-snapshot",
      },
      {
        label: "HighLevel: How to import snapshots",
        url: "https://help.gohighlevel.com/support/solutions/articles/155000007995-how-to-import-snapshots-in-highlevel",
      },
      {
        label: "HighLevel: Custom objects with snapshots",
        url: "https://help.gohighlevel.com/support/solutions/articles/155000004922-creating-custom-objects-using-snapshots",
      },
    ],
    related: [
      "/services/gohighlevel-setup-and-rebuild",
      "/guides/gohighlevel-saas-mode-setup",
      "/for/agencies",
    ],
  },
  {
    kind: "guide",
    slug: "gohighlevel-saas-mode-setup",
    eyebrow: "Guide, GoHighLevel",
    title: "GoHighLevel SaaS mode setup",
    metaTitle: "GoHighLevel SaaS Mode Setup Guide",
    description:
      "How to configure GoHighLevel SaaS mode: plan requirements, the Stripe connection, the SaaS Configurator, V1 versus V2, rebilling and bulk activation.",
    answer:
      "GoHighLevel SaaS mode lets an agency sell the platform as its own subscription product. You connect a payment provider at the agency level, build plans in the SaaS Configurator, then add those plans to a pricing page. Rebilling with a markup is listed as a feature of the $497 Agency Pro plan.",
    ...dates,
    blocks: [
      { k: "h2", text: "What do you need first?" },
      {
        k: "ul",
        items: [
          "The Agency Pro plan, listed at $497 a month",
          "An Agency Admin role, which the setup requires",
          "A connected payment provider",
          "A snapshot for each plan you intend to sell",
        ],
      },
      { k: "h2", text: "What are the setup steps?" },
      {
        k: "ol",
        items: [
          "In the agency account, connect Stripe under Settings, Stripe Integration.",
          "Build your plans in the configurator, with pricing, trials, credits and snapshots.",
          "Add the plans to a pricing and signup page in an agency sub-account.",
          "Run one test signup from start to finish, including the card and the snapshot load.",
        ],
      },
      { k: "h2", text: "What is the difference between V1 and V2?" },
      {
        k: "table",
        head: ["", "SaaS V1", "SaaS V2"],
        rows: [
          ["System of record", "Stripe", "HighLevel"],
          ["Payment providers", "Stripe only", "Also NMI, Square and Authorize.net"],
          ["Extra requirement", "None listed", "An Agency Sub-Account with a payment provider set up"],
        ],
      },
      { k: "h2", text: "How does rebilling work?" },
      {
        k: "p",
        text: "New sub-accounts created by SaaS mode get rebilling with a markup by default. For existing clients it is set per sub-account, under Agency View, Sub-Accounts, Manage Client, Rebilling.",
      },
      { k: "h2", text: "Can you switch on SaaS mode in bulk?" },
      {
        k: "p",
        text: "HighLevel's guided activation has conditions. You need the $497 plan, Smart Prompts for SaaS Enablement switched on in Labs, more than 10 sub-accounts, and at least one sub-account not on SaaS. Accounts with no card on file get locked until the client adds one, so warn clients first.",
      },
    ],
    faq: [
      {
        q: "Can I use a processor other than Stripe?",
        a: "Yes, with SaaS V2. HighLevel lists NMI, Square and Authorize.net.",
      },
      {
        q: "Does each SaaS client still need A2P registration?",
        a: "Yes, if the sub-account sends SMS to US numbers.",
      },
    ],
    sources: [
      {
        label: "HighLevel: Getting started with the SaaS Configurator",
        url: "https://help.gohighlevel.com/support/solutions/articles/155000008015",
      },
      { label: "HighLevel: SaaS Mode", url: "https://www.gohighlevel.com/saas-mode" },
      {
        label: "HighLevel: Rebilling, reselling and wallets",
        url: "https://help.gohighlevel.com/support/solutions/articles/155000002095-rebilling-reselling-and-wallets-explained",
      },
      {
        label: "HighLevel: Bulk SaaS activation",
        url: "https://help.gohighlevel.com/support/solutions/articles/155000005614-how-to-enable-saas-mode-for-multiple-sub-accounts-in-bulk",
      },
    ],
    related: [
      "/guides/gohighlevel-snapshots",
      "/guides/a2p-10dlc-registration-gohighlevel",
      "/for/agencies",
    ],
  },
  {
    kind: "guide",
    slug: "gohighlevel-missed-call-text-back",
    eyebrow: "Guide, GoHighLevel",
    title: "GoHighLevel missed call text back setup",
    metaTitle: "GoHighLevel Missed Call Text Back Setup",
    description:
      "Set up missed call text back in GoHighLevel: the Call Status trigger, filters, the SMS step, re-entry settings, A2P requirements and how to test it.",
    answer:
      "Missed call text back in GoHighLevel is a workflow. It starts on the Call Status trigger, filtered to inbound calls that ended as busy or not answered, then sends one SMS asking how you can help. The number needs A2P registration first, and Allow Re-entry must be on or repeat callers get nothing.",
    ...dates,
    blocks: [
      { k: "h2", text: "How do you set it up?" },
      {
        k: "ol",
        items: [
          "Confirm your sending number is linked to an approved [A2P campaign](/guides/a2p-10dlc-registration-gohighlevel).",
          "Create a new workflow and add the Call Status trigger.",
          "Filter it to inbound calls with a status such as busy or not answered.",
          "Add a Send SMS action with your message.",
          "Turn on Allow Re-entry in the workflow settings.",
          "Publish the workflow. A draft does not trigger.",
          "Call the number from a phone that is not already a contact, let it ring out, and confirm the text arrives.",
        ],
      },
      {
        k: "note",
        title: "Check the options in your account",
        text: "HighLevel's Call Status article is older than most of its help center, so confirm the status names on your own screen.",
      },
      { k: "h2", text: "What should the text say?" },
      {
        k: "code",
        label: "Example message",
        text: "Hi, this is {{location.name}}. Sorry we missed your call. What can we help you with? Reply STOP to opt out.",
      },
      {
        k: "p",
        text: "Keep it to one question. The goal is a reply a person can pick up, not a sales message.",
      },
      { k: "h2", text: "Why does it not fire for repeat callers?" },
      {
        k: "p",
        text: "A new qualifying call does not automatically re-enroll a contact. Allow Re-entry decides that, and a contact still active in the workflow cannot re-enter. Keep this workflow short so that contacts finish it.",
      },
      { k: "h2", text: "How do you know whether it is working?" },
      {
        k: "ul",
        items: [
          "Stats View shows Attempted, Matched and Unmatched counts for the trigger.",
          "Enrollment History shows whether the contact entered.",
          "Execution Logs show whether the SMS step ran or failed.",
        ],
      },
      {
        k: "p",
        text: "If the workflow stays quiet, use the [troubleshooting guide](/guides/gohighlevel-workflow-not-triggering).",
      },
    ],
    faq: [
      {
        q: "Will this bring in more leads?",
        a: "No. It answers the leads you already get, and lead volume depends on your market and your offer.",
      },
      {
        q: "Does it need A2P registration?",
        a: "Yes, for SMS sent from a US local number.",
      },
    ],
    sources: [
      {
        label: "HighLevel: Call Status trigger",
        url: "https://help.gohighlevel.com/support/solutions/articles/155000002552-workflow-trigger-call-status",
      },
      {
        label: "HighLevel: Call Details trigger",
        url: "https://help.gohighlevel.com/support/solutions/articles/48001212511-workflow-trigger-call-details",
      },
      {
        label: "HighLevel: Workflow settings overview",
        url: "https://help.gohighlevel.com/support/solutions/articles/48001239875-workflow-settings-overview",
      },
    ],
    related: ["/for/local-business", "/guides/gohighlevel-workflow-not-triggering", "/services/workflow-automation"],
  },
  {
    kind: "guide",
    slug: "gohighlevel-workflow-not-triggering",
    eyebrow: "Guide, troubleshooting",
    title: "GoHighLevel workflow not triggering: a diagnostic path",
    metaTitle: "GoHighLevel Workflow Not Triggering? Fix It",
    description:
      "Why a GoHighLevel workflow does not trigger, checked in order: publish state, Stats View, trigger filters, Allow Re-entry, logs, and failed actions.",
    answer:
      "When a GoHighLevel workflow does not trigger, check in this order. Confirm it is published. Open Stats View to see whether the trigger is matching. Compare the record against each filter. Check Allow Re-entry. Then read Enrollment History and Execution Logs to find out whether the contact entered and which step failed.",
    ...dates,
    blocks: [
      { k: "h2", text: "Step 1: Is the workflow published?" },
      { k: "p", text: "Draft workflows do not trigger or act. Check this first, because it takes seconds." },
      { k: "h2", text: "Step 2: What does Stats View show?" },
      {
        k: "table",
        head: ["Stats View shows", "It means", "Go to"],
        rows: [
          ["Attempted is zero", "The event is not reaching the trigger", "Step 3"],
          ["Attempted rises, Matched does not", "Filters are rejecting the record", "Step 4"],
          ["Matched rises, no enrollment", "The contact may be blocked from entering", "Step 5"],
          ["Enrolled, but nothing happens", "A later step skipped or failed", "Step 6"],
        ],
      },
      { k: "h2", text: "Step 3: Is it the right trigger?" },
      {
        k: "p",
        text: "Make sure the event happens in this sub-account and that you picked the trigger for that event. A form trigger will not fire for a survey, for example. Trigger the event once yourself while watching the counts.",
      },
      { k: "h2", text: "Step 4: Which filter is rejecting the record?" },
      {
        k: "p",
        text: "Compare the actual record against every filter, one at a time. Remove filters until it matches, then add them back. The last one you add is the culprit.",
      },
      { k: "h2", text: "Step 5: Is re-entry blocking it?" },
      {
        k: "p",
        text: "This is the most common cause on call-based workflows. Allow Re-entry decides whether a contact can enter again, and even then a contact can only re-enter after finishing the workflow or being removed. HighLevel notes that appointment and invoice triggers bypass the setting.",
      },
      { k: "p", text: "Test with a fresh contact to rule out earlier enrollment." },
      { k: "h2", text: "Step 6: Which step failed?" },
      {
        k: "p",
        text: "Open Enrollment History and Execution Logs for that contact. They show whether any later step was skipped or failed. For SMS steps, check [A2P registration](/guides/a2p-10dlc-registration-gohighlevel) next. For steps that depend on a connection, check whether the connection survived a [snapshot import](/guides/gohighlevel-snapshots).",
      },
      { k: "h2", text: "When should you stop and ask for help?" },
      {
        k: "p",
        text: "When several workflows contact the same person, or when nobody knows why a workflow exists. Tracing that kind of account is the job. It comes out of [prepaid hours](/pricing), and we scope it first.",
      },
    ],
    faq: [
      {
        q: "Why does it work in test mode but not live?",
        a: "Test with a real event and a fresh contact, then compare the two in Execution Logs.",
      },
      {
        q: "Can a contact re-enter while still in the workflow?",
        a: "No. A contact who is still active cannot re-enter.",
      },
    ],
    sources: [
      {
        label: "HighLevel: Workflow Builder walkthrough",
        url: "https://help.gohighlevel.com/support/solutions/articles/155000001254-workflow-builder-walkthrough",
      },
      {
        label: "HighLevel: Workflow settings overview",
        url: "https://help.gohighlevel.com/support/solutions/articles/48001239875-workflow-settings-overview",
      },
      {
        label: "HighLevel: Getting started with workflows",
        url: "https://help.gohighlevel.com/support/solutions/articles/155000002288-getting-started-with-workflows",
      },
    ],
    related: [
      "/services/workflow-automation",
      "/guides/gohighlevel-missed-call-text-back",
      "/guides/gohighlevel-snapshots",
    ],
  },
];
