import type { LegalDoc } from "./types";

/**
 * Privacy Policy, from the design file of the same name.
 *
 * Section 14 promises a "Last updated" date at the top, which the design
 * itself never filled in — `updated` is that date, and it has to move
 * whenever the policy does.
 */
export const privacy: LegalDoc = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  lead: "How Sysora Stack collects, uses, shares and protects personal information.",
  updated: "15 October 2026",
  tocTitle: "On this page",
  backToTop: "Back to top",
  intro: [
    {
      k: "p",
      text: "This Privacy Policy explains how Sysora Stack (“Sysora Stack,” “we,” “us,” “our”), collects, uses, shares and protects personal information when you visit sysorastack.com, purchase our services, or communicate with us.",
    },
    {
      k: "p",
      lead: "Questions, requests or complaints:",
      text: " {{mail}}",
    },
  ],
  sections: [
    {
      id: "s-1",
      n: "01",
      title: "Two different roles we play",
      blocks: [
        { k: "p", text: "This distinction matters, so it comes first." },
        {
          k: "note",
          title: "When you are our customer",
          text: "We control the personal information you give us directly, such as your name, work email and billing details. This policy describes how we handle it.",
        },
        {
          k: "note",
          title: "When we work inside your systems",
          text: "Such as your GoHighLevel account, your CRM or your automation platform, we process personal information that belongs to you and relates to your leads, clients and customers. We handle that data on your instructions and only to perform the work you asked for. We do not use it for our own purposes, we do not add it to our own marketing lists, and we do not sell it. You remain responsible for having a lawful basis to collect and process that data, and for providing your own privacy notice to the people it describes.",
        },
      ],
    },
    {
      id: "s-2",
      n: "02",
      title: "Information we collect",
      blocks: [
        { k: "h3", title: "Information you give us" },
        {
          k: "ul",
          items: [
            "Identity and contact details, including name, business name, email address, phone number and mailing address",
            "Account and onboarding information, including which platforms you use, what you need built, your time zone, and who is authorized to approve work",
            "Billing information processed through Stripe, including the last four digits of your card, card brand, expiry and billing address. We never receive or store your full card number or CVC.",
            "Support and project communications, including chat messages, tickets, emails and notes from calls",
            "Any credentials or access you choose to grant us for your platforms",
          ],
        },
        { k: "h3", title: "Information collected automatically" },
        {
          k: "p",
          text: "When you visit the Site, our hosting provider records standard server log data such as IP address, browser type, device type, referring page, and pages visited, for security and basic operation.",
        },
        {
          k: "p",
          text: "As of the effective date of this policy, the Site does not run analytics, advertising pixels, session recording, or third-party marketing trackers. If we add them, we will update this policy and, where required, obtain consent before they load.",
        },
        { k: "h3", title: "Information from others" },
        {
          k: "p",
          text: "We may receive your information from a freelance platform or marketplace if you engage us there, from a colleague who refers you, or from a publicly available business source such as your company website.",
        },
        {
          k: "p",
          text: "We do not knowingly collect sensitive personal information such as government ID numbers, health information, precise geolocation, or biometric data, and we ask you not to send it to us.",
        },
      ],
    },
    {
      id: "s-3",
      n: "03",
      title: "How we use information",
      blocks: [
        { k: "p", text: "We use personal information to:" },
        {
          k: "ul",
          items: [
            "Deliver the services you purchased, including building, fixing and maintaining your systems",
            "Create and manage your account, track your hour balance, and provide your hours ledger",
            "Process payments, renewals, refunds and chargebacks through Stripe",
            "Respond to chat messages, tickets, calls and emails",
            "Send service and transactional messages, including receipts, renewal notices, balance alerts and policy updates",
            "Send marketing emails or SMS where you have opted in, and only until you opt out",
            "Protect our systems and yours against fraud, abuse and unauthorized access",
            "Keep business records and meet legal, tax and accounting obligations",
          ],
        },
        {
          k: "p",
          text: "For customers in the United Kingdom or European Economic Area, our legal bases are performance of a contract, our legitimate interests in operating and securing the business, your consent for marketing, and compliance with legal obligations.",
        },
      ],
    },
    {
      id: "s-4",
      n: "04",
      title: "We do not sell your personal information",
      blocks: [
        {
          k: "formula",
          text: "We do not sell personal information, and we do not share it for cross-context behavioral advertising.",
        },
        {
          k: "p",
          text: "We do not sell personal information, and we do not share it for cross-context behavioral advertising, as those terms are defined under the California Consumer Privacy Act and similar state laws. We have not done so in the preceding 12 months. We do not sell or share the personal information of anyone under 16.",
        },
      ],
    },
    {
      id: "s-5",
      n: "05",
      title: "When we disclose information",
      blocks: [
        { k: "p", text: "We disclose personal information only in these situations:" },
        {
          k: "p",
          lead: "Service providers who help us operate.",
          text: " These vendors are bound by contract to use the information only to provide services to us. Our current categories and providers:",
        },
        {
          k: "table",
          head: ["Purpose", "Provider"],
          rows: [
            ["Payment processing", "Stripe, Inc."],
            ["Email, calendar and document storage", "Google LLC (Google Workspace)"],
            ["Internal communication and ticketing", "Slack Technologies, Notion Labs"],
            ["Project and task tracking", "Atlassian (Jira)"],
            [
              "Platforms we work in on your behalf",
              "GoHighLevel, and the automation and hosting tools you use, including n8n, Zapier, Make, Twilio and Supabase where applicable",
            ],
            ["Website hosting", "Our website hosting provider"],
          ],
        },
        {
          k: "p",
          text: "Where a task involves an AI-assisted workflow, data may pass through an AI model provider. We will tell you before AI processing touches your customer records, and we do not enable training on your data where the provider offers a setting to prevent it.",
        },
        {
          k: "p",
          lead: "Legal and safety.",
          text: " We may disclose information when required by law, subpoena, or valid government request, or to protect our rights, our customers, or the public.",
        },
        {
          k: "p",
          lead: "Business transfer.",
          text: " If Sysora Stack is involved in a merger, acquisition or sale of assets, information may transfer as part of that transaction, subject to this policy.",
        },
        {
          k: "p",
          text: "We do not disclose your information to data brokers, advertisers, or any party for their own marketing.",
        },
      ],
    },
    {
      id: "s-6",
      n: "06",
      title: "Where your information is processed",
      blocks: [
        {
          k: "p",
          text: "Sysora Stack operates as a United States-facing business and these Terms are governed by US law. Our delivery team works across multiple time zones, including shifts outside the United States, and authorized personnel may access information from those locations in order to provide round-the-clock support and delivery.",
        },
        {
          k: "p",
          text: "All personnel are bound by written confidentiality obligations and access is limited to those who need it to perform the work. Where personal information of UK or EEA residents is transferred outside those regions, we rely on Standard Contractual Clauses or another lawful transfer mechanism.",
        },
      ],
    },
    {
      id: "s-7",
      n: "07",
      title: "How we protect information",
      blocks: [
        {
          k: "p",
          text: "We use access controls and least-privilege permissions, role-based or delegated platform access instead of shared passwords wherever a platform supports it, encrypted storage for credentials, encrypted connections for data in transit, multi-factor authentication on company accounts, and prompt revocation of access when an engagement ends or a team member leaves.",
        },
        {
          k: "p",
          text: "No method of transmission or storage is completely secure, and we cannot guarantee absolute security. If a breach affects your personal information, we will notify you and any required regulator within the timeframes the law requires.",
        },
      ],
    },
    {
      id: "s-8",
      n: "08",
      title: "How long we keep information",
      blocks: [
        {
          k: "table",
          head: ["Data", "Retention"],
          rows: [
            ["Account and contact records", "Duration of the relationship plus 3 years"],
            ["Billing and tax records", "7 years, as required for tax and accounting"],
            ["Support tickets and project communications", "3 years after the engagement ends"],
            [
              "Credentials and access to your platforms",
              "Deleted or revoked within 30 days of engagement end, or sooner on request",
            ],
            [
              "Marketing contacts",
              "Until you opt out, plus a suppression record so we do not contact you again",
            ],
          ],
        },
      ],
    },
    {
      id: "s-9",
      n: "09",
      title: "Your privacy rights",
      blocks: [
        { k: "p", text: "Depending on where you live, you may have the right to:" },
        {
          k: "ul",
          items: [
            "Know what personal information we hold about you and how we use it",
            "Access a copy of it, or receive it in a portable format",
            "Correct inaccurate information",
            "Delete your information, subject to our legal retention obligations",
            "Opt out of sale, sharing, targeted advertising and certain profiling, none of which we currently do",
            "Limit the use of sensitive personal information, which we do not knowingly collect",
            "Not be discriminated against for exercising any of these rights",
          ],
        },
        {
          k: "p",
          text: "These rights are available to residents of California, Virginia, Colorado, Connecticut, Texas, Utah, Oregon, Montana, Florida, Delaware, Iowa, Nebraska, New Hampshire, New Jersey, Tennessee, Minnesota, Maryland, Indiana, Kentucky, Rhode Island and other states as their laws come into effect, and to residents of the United Kingdom and EEA under applicable law.",
        },
        {
          k: "p",
          lead: "How to exercise them.",
          text: " Email {{mail}} with the subject line “Privacy Request” and tell us which right you are exercising. We will verify your identity by matching the details you provide against our records, and we may ask for additional confirmation if the request concerns deletion.",
        },
        {
          k: "p",
          lead: "Timing.",
          text: " We respond within 45 days, and we may extend by a further 45 days where permitted, with notice to you.",
        },
        {
          k: "p",
          lead: "Authorized agents.",
          text: " You may use an authorized agent, with written authorization that we can verify.",
        },
        {
          k: "p",
          lead: "Appeals.",
          text: " If we deny your request, you may appeal by replying to our decision with the subject line “Privacy Appeal.” We will respond within 45 days with our decision and the reasons. If we deny the appeal, you may contact your state attorney general. UK and EEA residents may lodge a complaint with their supervisory authority.",
        },
        {
          k: "p",
          lead: "Requests about data in a client’s system.",
          text: " If your personal information sits in a system we manage for one of our customers, we will refer your request to that customer, who controls the data, and support them in responding.",
        },
      ],
    },
    {
      id: "s-10",
      n: "10",
      title: "Marketing, email and SMS",
      blocks: [
        {
          k: "p",
          text: "We send marketing messages only to people who have asked for them. Every marketing email includes an unsubscribe link. Where we send SMS, you opt in separately, message and data rates may apply, you can reply STOP to stop and HELP for help, and we honor opt-outs promptly.",
        },
        {
          k: "p",
          text: "Transactional messages about your account, your hour balance, your renewals and your active work are not marketing, and they continue while your account is active.",
        },
      ],
    },
    {
      id: "s-11",
      n: "11",
      title: "Cookies and tracking",
      blocks: [
        {
          k: "p",
          text: "The Site uses only the cookies required to make it function and to keep it secure. We do not currently use advertising, analytics or session-recording cookies. Checkout pages hosted by Stripe set their own cookies, governed by Stripe’s privacy policy.",
        },
        {
          k: "p",
          text: "Because we do not conduct targeted advertising or sell personal information, there is currently nothing for a Global Privacy Control or Do Not Track signal to opt you out of. If that changes, we will honor those signals as required by law and update this policy.",
        },
      ],
    },
    {
      id: "s-12",
      n: "12",
      title: "Children",
      blocks: [
        {
          k: "p",
          text: "Our services are for businesses and are not directed to anyone under 18. We do not knowingly collect personal information from children. If you believe a child has provided us information, contact {{mail}} and we will delete it.",
        },
      ],
    },
    {
      id: "s-13",
      n: "13",
      title: "Third-party sites",
      blocks: [
        {
          k: "p",
          text: "Our Site and our deliverables may link to third-party services. We are not responsible for their privacy practices, and their policies govern their handling of your information.",
        },
      ],
    },
    {
      id: "s-14",
      n: "14",
      title: "Changes to this policy",
      blocks: [
        {
          k: "p",
          text: "We may update this policy. The “Last updated” date at the top shows the most recent version. For material changes, we will notify active customers by email at least 30 days before the change takes effect.",
        },
      ],
    },
    {
      id: "s-15",
      n: "15",
      title: "Contact us",
      blocks: [
        {
          k: "table",
          head: ["Channel", "Detail"],
          rows: [
            ["Email", "{{mail}}"],
            ["Entity", "Sysora Stack"],
          ],
        },
      ],
    },
  ],
};
