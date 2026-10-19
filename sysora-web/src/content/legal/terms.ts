import type { LegalDoc } from "./types";

/**
 * Terms and Conditions, from the design file of the same name.
 *
 * The rate table here is the same seven packages the landing page sells.
 * It is written out rather than generated from `packs` on purpose: this
 * is the contractual record of what was offered, and it should not
 * silently change because a price changed on the sales page.
 */
export const terms: LegalDoc = {
  eyebrow: "Legal",
  title: "Terms and Conditions",
  lead: "These Terms govern your purchase and use of Sysora Stack services.",
  updated: "19 October 2026",
  tocTitle: "On this page",
  backToTop: "Back to top",
  intro: [
    {
      k: "p",
      text: "These Terms and Conditions (“Terms”) govern your purchase and use of services from Sysora Stack (“Sysora Stack,” “we,” “us,” “our”). By purchasing hours, submitting a project request, or using any part of our services or website at sysorastack.com (the “Site”), you agree to these Terms. If you are agreeing on behalf of a company, you confirm that you have authority to bind that company, and “you” means that company.",
    },
    {
      k: "p",
      text: "If you do not agree to these Terms, do not purchase or use the services.",
    },
  ],
  sections: [
    {
      id: "s-1",
      n: "01",
      title: "What Sysora Stack provides",
      blocks: [
        {
          k: "p",
          text: "Sysora Stack is a technical delivery team. We perform GoHighLevel implementation, automation work in tools such as n8n, Zapier and Make, API and webhook integrations, website and funnel builds, custom application development, and related technical support, on a prepaid hourly basis.",
        },
        {
          k: "p",
          text: "We are an independent service provider. We are not an employee, agent, partner, reseller, or certified or endorsed partner of HighLevel, Inc. or of any other platform we work in, unless a separate written agreement says otherwise. Platform names are used only to describe the work we perform.",
        },
      ],
    },
    {
      id: "s-2",
      n: "02",
      title: "Accounts and eligibility",
      blocks: [
        {
          k: "p",
          text: "You must be at least 18 years old and able to form a binding contract. You agree to provide accurate business, contact and billing information and to keep it current. You are responsible for all activity under your account and for keeping your login credentials secure.",
        },
      ],
    },
    {
      id: "s-3",
      n: "03",
      title: "Prepaid hours, packages and pricing",
      blocks: [
        { k: "h3", n: "3.1", title: "Approved packages" },
        {
          k: "p",
          text: "Services are sold as prepaid blocks of technical service hours, available as a one-time purchase or as a monthly recurring plan, at the following prices in United States dollars.",
        },
        {
          k: "table",
          head: ["Hours", "Price (USD)", "Effective rate"],
          rows: [
            ["5", "$95", "$19/hour"],
            ["10", "$190", "$19/hour"],
            ["25", "$450", "$18/hour"],
            ["50", "$850", "$17/hour"],
            ["75", "$1,125", "$15/hour"],
            ["100", "$1,400", "$14/hour"],
            ["150", "$1,950", "$13/hour"],
          ],
        },
        { k: "h3", n: "3.2", title: "How tiers apply" },
        {
          k: "p",
          text: "Each order is priced at the tier you select for that order. A previous larger purchase does not discount a later smaller purchase, and no rate from a previous order carries forward automatically. Requirements above 150 hours, or work that falls outside the published packages, receive a custom written estimate.",
        },
        { k: "h3", n: "3.3", title: "Validity and reset" },
        {
          k: "p",
          text: "One-time hour packs are valid for 60 days from the date of purchase. Unused hours expire at the end of that 60-day period and are not refunded after expiry, except where a refund was properly requested before expiry under Section {{s:7|7}}.",
        },
        {
          k: "p",
          text: "Monthly plan hours reset at the start of each billing cycle. Unused hours do not roll over into the next cycle.",
        },
        { k: "h3", n: "3.4", title: "Time tracking and billable work" },
        {
          k: "p",
          text: "Work is tracked against your purchased balance in increments of 15 minutes, rounded up to the nearest increment per task. Billable work includes technical diagnosis, troubleshooting, configuration, builds, revisions, testing, data migration, deployment, maintenance, scheduled calls, meetings, project coordination, and technical documentation prepared at your request.",
        },
        {
          k: "p",
          text: "We provide a record of hours consumed on request and will not knowingly perform work beyond your available balance without your approval. If a task is likely to exceed your balance, we will tell you before continuing.",
        },
        {
          k: "p",
          text: "Time estimates are estimates. We do not guarantee that a specific task will be completed inside a specific number of hours unless the scope has been reviewed in writing and we have stated otherwise.",
        },
        {
          k: "p",
          text: "Onboarding, submitting a task and receiving a scope estimate do not consume hours. Hours start being consumed when we begin the work you approved.",
        },
      ],
    },
    {
      id: "s-4",
      n: "04",
      title: "Support",
      blocks: [
        {
          k: "p",
          text: "Sysora Stack provides 24 hours a day, 7 days a week human chat and ticket reception, acknowledgment, initial triage and routing, at no additional charge with any active package. A real person receives and reviews your request.",
        },
        {
          k: "p",
          text: "Everything beyond intake and routing consumes purchased hours, including scheduled calls, live troubleshooting, diagnosis, implementation and all other technical work.",
        },
        {
          k: "p",
          text: "We do not promise a specific response time, resolution time, uptime, dedicated personnel, or unlimited calls or development, unless a separate written service agreement states otherwise.",
        },
      ],
    },
    {
      id: "s-5",
      n: "05",
      title: "Billing, renewal and cancellation",
      blocks: [
        { k: "h3", n: "5.1", title: "Payment" },
        {
          k: "p",
          text: "Payment is processed by Stripe, Inc. By purchasing, you also agree to Stripe’s applicable terms. We do not receive or store your full payment card number. Prices are in US dollars and exclude any applicable sales, use, GST, VAT or similar taxes, which are your responsibility unless we are required to collect them.",
        },
        { k: "h3", n: "5.2", title: "Monthly plans" },
        {
          k: "p",
          text: "Monthly plans renew automatically on the same calendar day each month, at the then-current price for your package, until cancelled. By purchasing a monthly plan you authorize recurring charges to your payment method.",
        },
        { k: "h3", n: "5.3", title: "Cancellation" },
        {
          k: "p",
          text: "You may cancel a monthly plan at any time by contacting {{mail}} at least 24 hours before your next renewal date. Cancellation stops future renewals. It does not retroactively refund prior billing cycles. Unused hours in the current paid cycle may be eligible for refund under Section {{s:7|7}} if requested before the cycle resets.",
        },
        { k: "h3", n: "5.4", title: "Failed payments" },
        {
          k: "p",
          text: "If a payment fails, we may suspend work and access to your hour balance until payment is resolved. Repeated failed payment may result in cancellation of the plan. Your purchased hours are not forfeited by a failed payment, and access is restored when the payment is resolved. The 60-day validity period on a one-time pack is not extended by a suspension.",
        },
        { k: "h3", n: "5.5", title: "Price changes" },
        {
          k: "p",
          text: "We may change package prices. Changes apply to new orders and to monthly renewals occurring at least 30 days after we notify you by email. Your current paid cycle is not affected.",
        },
      ],
    },
    {
      id: "s-6",
      n: "06",
      title: "What is not included",
      blocks: [
        {
          k: "p",
          text: "Unless a written quote expressly says otherwise, your purchased hours cover Sysora Stack labor only. The following are excluded and remain your responsibility:",
        },
        {
          k: "ul",
          items: [
            "Third-party software subscriptions and platform licensing, including GoHighLevel, n8n, Zapier, Make and similar tools",
            "Messaging, telephony and email usage fees, including SMS, voice, and email sending costs",
            "AI model and API usage fees",
            "Hosting, domain registration, SSL and infrastructure charges",
            "Paid plugins, templates, stock assets and external tools",
            "Taxes, bank charges and currency conversion costs",
          ],
        },
        {
          k: "p",
          text: "Where carrier or provider registration is involved, including A2P 10DLC messaging registration, we can assist with submission and configuration. Approval is granted by the carrier or provider, not by Sysora Stack, and we do not guarantee approval, timing, or throughput.",
        },
      ],
    },
    {
      id: "s-7",
      n: "07",
      title: "Unused-hours refund guarantee",
      blocks: [
        {
          k: "note",
          title: "Not happy with our work?",
          text: "Get a refund for your unused hours.",
        },
        {
          k: "p",
          text: "If you are dissatisfied, you may request a refund of prepaid hours you have not used. The refund is calculated as follows:",
        },
        {
          k: "formula",
          text: "Refund = unused hours × (actual price paid ÷ hours purchased)",
        },
        {
          k: "p",
          text: "Examples: a 10-hour $190 pack with 3 hours used refunds 7 × $19, which is $133. A 50-hour $850 pack with 12 hours used refunds 38 × $17, which is $646. A 150-hour $1,950 pack with 40 hours used refunds 110 × $13, which is $1,430.",
        },
        { k: "p", text: "Conditions of this guarantee:" },
        {
          k: "ul",
          items: [
            "The request must be made before your one-time pack reaches its 60-day expiry, or before your current monthly cycle resets.",
            "Hours already worked and logged are not refundable under this guarantee.",
            "Third-party subscriptions, usage fees, taxes and independently billed expenses are not refundable.",
            "For monthly plans, we refund the unused portion of the current paid cycle only. Prior cycles are not refunded retroactively.",
            "Refunds are returned to the original payment method. Posting times depend on your bank and card issuer and are outside our control.",
          ],
        },
        {
          k: "p",
          text: "Refunds are not available for work already performed where we have suspended or terminated an engagement under Section 9.",
        },
        {
          k: "p",
          text: "This is an unused-hours guarantee. It is not a full money-back guarantee and it does not refund completed work.",
        },
        {
          k: "p",
          text: "To request a refund, contact {{mail}}. We will pause new billable work on the affected package, provide an itemized record of hours used and unused, confirm the refundable amount, and process the eligible refund. If you dispute logged time, we will review it against the task record with you. We do not deduct additional time from a balance after a refund request has been made.",
        },
      ],
    },
    {
      id: "s-8",
      n: "08",
      title: "Your responsibilities",
      blocks: [
        {
          k: "p",
          text: "To deliver the work, we need things only you can provide. You agree to:",
        },
        {
          k: "ul",
          items: [
            "Grant us the access required to perform the work, including accounts, subaccounts, API keys and administrative permissions, and confirm you have the right and authority to grant that access, including on behalf of your own clients",
            "Provide account access through delegated or role-based user access where the platform supports it, rather than shared credentials, and rotate any credential shared with us when the engagement ends",
            "Supply content, assets, approvals and decisions needed to complete tasks",
            "Respond to scope and approval requests in reasonable time",
            "Maintain your own backups of business-critical data and systems",
            "Comply with all laws applicable to your use of the systems we build, including the Telephone Consumer Protection Act, CAN-SPAM, carrier messaging rules, and any consent requirements for contacting your leads and customers",
          ],
        },
        {
          k: "p",
          text: "Delays caused by missing access, content or approvals may extend timelines. Time already spent waiting on blocked work is not billed.",
        },
      ],
    },
    {
      id: "s-9",
      n: "09",
      title: "Acceptable use",
      blocks: [
        {
          k: "p",
          text: "You may not use our services or anything we build to send unsolicited messages in violation of law or carrier policy, to distribute malware, to collect data without a lawful basis, to operate or support fraudulent, deceptive or illegal activity, or to infringe anyone’s intellectual property rights. We may suspend or terminate work immediately if we reasonably believe this section has been breached, and no refund is owed for work already performed in that case.",
        },
      ],
    },
    {
      id: "s-10",
      n: "10",
      title: "Intellectual property",
      blocks: [
        {
          k: "p",
          lead: "Your materials.",
          text: " You keep ownership of everything you provide, including your content, data, brand assets and accounts.",
        },
        {
          k: "p",
          lead: "Deliverables.",
          text: " On full payment for the hours used to produce them, you own the custom configurations, workflows, funnels, code and documentation we build specifically for you.",
        },
        {
          k: "p",
          lead: "Our materials.",
          text: " We keep ownership of everything we bring to the work that was not created exclusively for you, including our internal tooling, reusable code libraries, snapshot templates, frameworks, methods and general know-how. We grant you a perpetual, non-exclusive, worldwide license to use those materials to the extent they are embedded in your deliverables.",
        },
        {
          k: "p",
          lead: "Open source and third-party components.",
          text: " Some deliverables include third-party or open source components licensed separately by their owners. Those licenses govern those components.",
        },
        {
          k: "p",
          lead: "Portfolio.",
          text: " We will not publish your name, logo or project details as a case study without your written permission.",
        },
      ],
    },
    {
      id: "s-11",
      n: "11",
      title: "Confidentiality",
      blocks: [
        {
          k: "p",
          text: "Each party agrees to keep the other’s non-public business and technical information confidential, to use it only to perform or receive the services, and to protect it with at least reasonable care. This does not apply to information that is public through no fault of the receiving party, was already known without a duty of confidence, or is required to be disclosed by law, in which case we will give you notice where legally permitted.",
        },
        {
          k: "p",
          text: "Our obligations regarding personal data are described in our {{privacy|Privacy Policy}}.",
        },
      ],
    },
    {
      id: "s-12",
      n: "12",
      title: "Term and termination",
      blocks: [
        {
          k: "p",
          text: "These Terms apply from your first purchase until all packages are expired, used or refunded.",
        },
        {
          k: "p",
          text: "Either party may terminate for convenience with written notice. On termination, unused hours are handled under Section {{s:3|3.3}} and Section {{s:7|7}}. Either party may terminate immediately for material breach that remains uncured 10 days after written notice.",
        },
        {
          k: "p",
          text: "On termination, we will return or delete credentials we hold for your systems, provide any deliverable materials in our possession, and stop work. Sections {{s:7|7}}, {{s:10|10}}, {{s:11|11}}, {{s:13|13}}, {{s:14|14}}, {{s:15|15}} and {{s:17|17}} survive termination.",
        },
      ],
    },
    {
      id: "s-13",
      n: "13",
      title: "Disclaimers",
      blocks: [
        {
          k: "p",
          text: "The services are provided on an “as is” and “as available” basis. To the fullest extent permitted by law, we disclaim all warranties, express or implied, including implied warranties of merchantability, fitness for a particular purpose, title and non-infringement.",
        },
        {
          k: "p",
          text: "We do not warrant that third-party platforms will remain available, compatible, or free of defects, that automations will run without interruption when a third-party platform changes its behavior or API, or that any particular business outcome will result from the work. We make no guarantee of lead volume, conversion rate, revenue, deliverability, carrier approval, search ranking, uptime, or regulatory compliance for your business.",
        },
      ],
    },
    {
      id: "s-14",
      n: "14",
      title: "Limitation of liability",
      blocks: [
        {
          k: "p",
          text: "To the fullest extent permitted by law, neither party is liable for indirect, incidental, special, consequential, exemplary or punitive damages, or for lost profits, lost revenue, lost data or business interruption, even if advised of the possibility.",
        },
        {
          k: "p",
          text: "Our total aggregate liability arising out of or relating to these Terms or the services is limited to the total amount you paid to Sysora Stack in the 12 months immediately before the event giving rise to the claim.",
        },
        {
          k: "p",
          text: "These limits do not apply to your payment obligations, to either party’s breach of Section {{s:11|11}}, or to liability that cannot be limited under applicable law.",
        },
      ],
    },
    {
      id: "s-15",
      n: "15",
      title: "Indemnification",
      blocks: [
        {
          k: "p",
          text: "You will defend, indemnify and hold harmless Sysora Stack and its personnel from any third-party claim arising out of your content or data, your use of the systems we build, your messaging or marketing practices, your breach of Section {{s:8|8}} or Section {{s:9|9}}, or your lack of authority to grant access to any account.",
        },
        {
          k: "p",
          text: "We will defend, indemnify and hold harmless you from any third-party claim that a deliverable created exclusively by us infringes that party’s intellectual property rights, excluding claims arising from your materials, your instructions, or third-party components.",
        },
      ],
    },
    {
      id: "s-16",
      n: "16",
      title: "Force majeure",
      blocks: [
        {
          k: "p",
          text: "Neither party is liable for failure or delay caused by events beyond reasonable control, including platform outages, API changes by third parties, internet or telecommunications failure, natural disaster, government action, or labor disruption.",
        },
      ],
    },
    {
      id: "s-17",
      n: "17",
      title: "Governing law and dispute resolution",
      blocks: [
        { k: "h3", n: "17.1", title: "Governing law" },
        {
          k: "p",
          text: "These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law rules. The United Nations Convention on Contracts for the International Sale of Goods does not apply.",
        },
        { k: "h3", n: "17.2", title: "Informal resolution first" },
        {
          k: "p",
          text: "Before filing any claim, you agree to contact {{mail}} with a written description of the dispute and to allow 30 days for good-faith resolution.",
        },
        { k: "h3", n: "17.3", title: "Binding arbitration and class waiver" },
        {
          k: "p",
          text: "If the dispute is not resolved, it will be settled by binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules, before one arbitrator, conducted remotely by video conference unless both parties agree to an in-person hearing. Judgment on the award may be entered in any court of competent jurisdiction.",
        },
        {
          k: "p",
          text: "You and Sysora Stack each waive the right to a jury trial and the right to participate in a class, collective or representative action. Claims may be brought only in an individual capacity.",
        },
        {
          k: "p",
          text: "Either party may bring an individual claim in small claims court instead, if it qualifies.",
        },
        { k: "h3", n: "17.4", title: "Arbitration opt-out" },
        {
          k: "p",
          text: "You may opt out of Section {{s:17|17.3}} by emailing {{mail}} within 30 days of your first purchase, with your name and the words “arbitration opt-out.” Opting out does not affect any other part of these Terms.",
        },
      ],
    },
    {
      id: "s-18",
      n: "18",
      title: "General",
      blocks: [
        {
          k: "p",
          lead: "Independent contractor.",
          text: " Nothing here creates an employment, partnership, joint venture or agency relationship.",
        },
        {
          k: "p",
          lead: "Non-solicitation.",
          text: " During an engagement and for 12 months after it ends, you agree not to directly solicit or hire personnel introduced to you through Sysora Stack without our written consent.",
        },
        {
          k: "p",
          lead: "Assignment.",
          text: " You may not assign these Terms without our written consent. We may assign them to an affiliate or in connection with a merger or sale of assets.",
        },
        {
          k: "p",
          lead: "Notices.",
          text: " Legal notices to Sysora Stack go to {{mail}}. Notices to you go to the email address on your account.",
        },
        {
          k: "p",
          lead: "Changes.",
          text: " We may update these Terms. Material changes take effect 30 days after we post the updated version and notify active customers by email. Continued use after that date means you accept the change. The version in effect at the time of your purchase governs that purchase.",
        },
        {
          k: "p",
          lead: "Severability and waiver.",
          text: " If a provision is held unenforceable, the rest remains in effect. Failure to enforce a provision is not a waiver of it.",
        },
        {
          k: "p",
          lead: "Entire agreement.",
          text: " These Terms, the {{privacy|Privacy Policy}}, and any written quote or statement of work signed by both parties are the entire agreement between us, and they replace any prior proposal or understanding. If a signed statement of work conflicts with these Terms, the statement of work controls for that engagement.",
        },
        {
          k: "p",
          lead: "Contact.",
          text: " {{mail}}",
        },
      ],
    },
  ],
};
