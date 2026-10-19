# Decisions

Why the code is the way it is. Newest first. If something looks wrong,
check here before changing it.

---

## Portal accounts are created at payment, with a six-digit code
**19 October 2026**

A paid order provisions the client's portal login and the confirmation
webhook carries the credentials, so GoHighLevel can email them.

The code is six digits because it gets read out on calls. That is below
the site's own ten-character minimum, so it cannot be where a client
stays: new accounts are flagged `must_change_password`, every portal
page shows a banner until it is replaced, and `/portal/password` is the
route off it. Changing it requires the current password, so an open
session on a shared machine cannot lock the owner out.

The clear password exists for the length of one function call, comes
from the CSPRNG, and is never stored or logged.

**Repeat buyers are never reset.** A second order routes to the
`hours_topped_up` webhook with `account_created: false` and an empty
password, so the email is a top-up note. The lookup checks customer and
email in two separate queries rather than one PostgREST `.or()`, because
that filter is a string grammar where a comma starts a new condition and
an email address should not be handed to a parser unescaped.

## Webhook URLs are tested before they are saved
**18 October 2026**

The admin pastes a URL and the only button sends a real payload first.
Nothing is written until GoHighLevel answers 2xx.

A stored URL that has never worked is worse than no URL, because the
cart sweeper reports success while posting into a void. A failed test
records the failure and leaves whatever is already saved alone.

The test payloads are built by the **same functions the live sends use**,
so they cannot drift. Only the inputs are invented, and the contact is
the signed-in staff member, so the test exercises the workflow and the
email rather than proving a URL returns 200.

URLs live in `sales.webhooks`, not `settings`, because `settings` has an
`is_public` flag and a UI that can flip it. A credential should not be
one checkbox away from the public API. The input rejects anything that
is not public https, loopback, link-local, `.internal` and bare IPs
included, so a pasted address cannot turn the settings page into a way
to probe the deployment's own network.

## Portal orders are excluded from the abandoned-cart sweeper
**15 October 2026**

Buying hours inside the portal creates an ordinary `requests` row, so the
sweeper picked it up like any other cart. A signed-in client who changed
their mind on the plans page would receive lead-nurture copy written for
a stranger. The sweeper now excludes `metadata->>source = 'portal'`.

## The dashboards use mint borders and the ink scale
**15 October 2026**

The dashboard designs use `--line-mint` (#D4EDD9) and `--line-mint-2`
(#EDF2EE) for every border, and `--ink-900` / `--ink-600` for text, not
the marketing site's `--line-slate` and `--text-heading`. Measured off
the design: 60 mint borders, 8 faint mint, zero slate.

## Checkout creates the order before the card form
**15 October 2026**

Step 2 writes the customer and the order and opens the PaymentIntent.
This is what makes the abandoned-cart sequence possible: a customer who
closes the tab at the card step has already left a complete row. The
resume link uses the published `/checkout/hours?hours=&billing=` shape
rather than the per-order URL.

## The sweeper is pg_cron, not Vercel Cron
**15 October 2026**

Vercel's Hobby plan runs cron once a day, and a nudge a day late is not
a nudge. pg_cron in Supabase posts to `/api/cron/abandoned-carts` every
five minutes with a bearer secret.

Why a sweeper and not a timer at checkout: the request that would hold
the timer is the one that ends when the customer leaves. State in the
database outlives the visit, a `setTimeout` in a serverless function
does not.

## The hour balance is a view
**15 October 2026**

`hour_entitlements` and `time_entries` are both append-only and
`customer_hour_balance` subtracts one from the other. No stored total
means no drift between the number and its own ledger, and the terms
promise the client can audit every entry.

## Authentication is hand-rolled, not Supabase Auth
**earlier**

Staff and clients are one `users` table separated by `role`, and the
roles drive server-side redirects. scrypt for hashes, SHA-256 of a
random token for sessions. `requireClient` sends staff to `/admin`
rather than letting a staff session read a client portal.

## RLS on, zero policies
**earlier**

Every table in the `sales` schema has RLS enabled and no policies at
all, with grants to `service_role` only. Nothing is reachable from a
browser even if an anon key leaks. All access goes through the server.

## One offer, and the old catalogue is gone
**15 October 2026**

`/services` and its nine children, `/about`, `/systems-review`,
`/systems-team` and `/build-request` sold a different business at
different prices. They 308 to `/` or `/request-estimate` and the source
is deleted. Canonicals previously pointed at `sysora.com`, a parked
domain that is for sale, which handed any ranking to someone else.
