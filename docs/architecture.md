# Architecture

Next.js 16 App Router on Vercel, Supabase Postgres behind it, Stripe for
payment, GoHighLevel for everything that gets emailed. One deployment
serves three audiences: the public site, the client portal, the staff
console.

## Routes

### Public
| Route | Notes |
| --- | --- |
| `/` | The sales page. Everything is sections of `src/components/sales/`. |
| `/checkout/hours` | The pack picker, three steps. Indexable, self-canonical. |
| `/checkout/[reference]` | One order's payment page. Reopens an existing order. `noindex`. |
| `/checkout/[reference]/complete` | Confirmation. Reconciles against Stripe on load, see below. |
| `/book-a-call` | GoHighLevel booking widget in an iframe. |
| `/contact` | Form, writes to `contact_messages`. |
| `/request-estimate`, `/request/[reference]` | For work too large for a pack. |
| `/terms`, `/privacy-policy` | Content from `src/content/legal/`. |

### Client portal, `/portal`
Login, overview, hours ledger, plans and hours, invoices, payment and
plan, build requests, support, password. Session cookie, role `client`.

### Staff console, `/admin`
Login, overview, operations console, clients, tickets, builds, orders,
contacts, services, plans, surveys, staff, settings. Role is one of
`bde`, `admin`, `manager`, `owner`.

### API
| Route | Caller |
| --- | --- |
| `/api/stripe/webhook` | Stripe. Needs `STRIPE_WEBHOOK_SECRET`, currently unset, see roadmap. |
| `/api/cron/abandoned-carts` | pg_cron in Supabase, every 5 minutes, bearer `CRON_SECRET`. |

## Data model

Everything lives in the `sales` schema. RLS is on with **zero policies**
and grants to `service_role` only, so nothing is reachable from a
browser. All reads and writes go through `salesDb()` on the server.

### Tables the current product uses

**Selling**: `offers`, `requests` (an order or an estimate request),
`payments`, `subscriptions`, `customers`.

**Delivery**: `hour_entitlements` (hours bought), `time_entries` (hours
spent), `tasks`, `support_tickets`, `ticket_messages`.

**Accounts**: `users` (staff and clients in one table, separated by
`role`), `sessions`, `password_resets`.

**Plumbing**: `webhooks`, `webhook_events`, `settings`, `audit_log`,
`events`, `contact_messages`, `surveys` and friends, `services`,
`service_faqs`.

### Tables that are legacy

The schema also holds an older internal sales-operations system:
`bid_sessions`, `connect_purchases`, `upwork_accounts`, `proposals`,
`revenue_targets`, `activity_targets`, `expenses`, `manual_revenue`,
`other_income`, `recurring_costs`, `spend_categories`,
`allocation_rules`, `client_settings`, and most of the 30-odd finance
views. **The hour-pack product does not read or write them.** Leave
them alone unless you are working on that system.

### The balance is derived, never stored

There is no `hours_remaining` column anywhere. `hour_entitlements` is
append-only and so is `time_entries`, and `customer_hour_balance` is a
view that subtracts one from the other. A balance that is computed
cannot drift from its own ledger, and "where did my hour go" is always
answerable from rows.

## How money becomes hours

1. **Step 2 of checkout** calls `startHourPackCheckout`. This creates
   the `customers` row and the `requests` row and opens a Stripe
   PaymentIntent, **before** the card form is shown. The order exists
   from this moment, which is what makes the abandoned-cart sweeper
   possible at all.
2. **Payment succeeds.** `markRequestPaid` runs, from either the Stripe
   webhook or the confirmation page, see the next section.
3. It marks the request paid, retires any other live PaymentIntent for
   that request, then calls `grantHoursFor`, which inserts the
   `hour_entitlements` row. A one-time pack expires 60 days out, a
   monthly plan has no expiry and resets instead.
4. Then `sendPaymentConfirmation` provisions the portal account and
   fires the webhook. See `src/lib/sales/confirmation.ts`.

### Two paths reach `markRequestPaid`, and both must be safe

The Stripe webhook is authoritative but asynchronous, and absent
entirely in local development. The confirmation page therefore also
reconciles against Stripe on load. Either can win the race, so:

- the `requests` update is conditional on the status still being unpaid,
- `hour_entitlements` has a unique index on `request_id`, so a second
  grant hits 23505 and is swallowed,
- the confirmation send **claims the row first** with a conditional
  update on `confirmation_notified_at`, and only the winner sends.

Changing any of those three will produce duplicate hours or duplicate
emails. They are tested, see `decisions.md`.

## Authentication

Hand-rolled, not Supabase Auth, because staff and clients share one
`users` table and the roles drive server-side redirects.

- scrypt, N=16384 r=8 p=1, 64-byte key, stored `scrypt$N$r$p$salt$hash`.
- Session token is random, stored as a SHA-256 hash in `sessions`, sent
  as an httpOnly sameSite=lax cookie.
- Lockout after repeated failures, counters on the `users` row.
- `requireStaff`, `requirePipeline`, `requireFinance` gate the admin.
  `requireClient` gates the portal, and sends staff to `/admin` so a
  staff session can never read a client's portal.

## Outbound webhooks

Three, all configured in **Admin, Settings**, all stored in
`sales.webhooks`, all posting flat JSON to GoHighLevel.

| Key | Fires |
| --- | --- |
| `abandoned_cart` | A checkout left unpaid past the grace period. One send per order. |
| `payment_confirmation` | A client's **first** paid order. Carries `portal_email` and the six-digit `portal_password`. |
| `hours_topped_up` | A paid order from a client who already has an account. No password. |

The payloads are flat and all strings and numbers because GoHighLevel
maps inbound JSON key by key and does not reach into nested objects.
Arrays are joined into sentences for the same reason.

A GHL inbound-trigger URL is authenticated by the id in its path and
nothing else, so it is a credential: never logged, never returned to a
browser, and kept out of `settings` because that table has a public flag.
