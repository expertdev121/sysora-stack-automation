# Sysora Web

Next.js 16 (App Router) + React 19 + Tailwind v4.

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Where things live

```
src/
  app/                    routes — page.tsx is the landing page
  components/
    layout/               SiteHeader, SiteFooter, StickyCtaBar, ScrollReveal, PageShell
    sections/             one component per landing-page section, in page order
    ui/                   Button, Eyebrow, Icon, Logo — the shared primitives
  content/landing/        all copy, reviews, pricing and FAQ data (typed)
  config/site.ts          every route and CTA destination
  lib/cn.ts               className joiner
```

**Editing copy** never means touching a component: every string on the landing
page lives in `src/content/landing/*.ts`. Adding a client review is one entry in
`reviews.ts`; changing where a CTA points is one line in `config/site.ts`.

**Adding a page**: wrap the body in `PageShell` (header, hero band, footer) and
add its route to `config/site.ts`.

## Design system

The tokens from the Sysora design system live in `src/app/globals.css`:

- `@theme static` maps them into Tailwind namespaces — `bg-mint-500`,
  `text-ink-900`, `shadow-glow-btn`, `font-display`, and so on.
- A plain `:root` block keeps the original variable names (`--accent`,
  `--border-default`, `--glow-btn`) because gradients and component styles
  reference them directly.
- `@layer base` holds the element defaults, so utility classes always win.

**Fonts** (via `next/font/google`, self-hosted): Geist for body and UI, Geist
Mono for numbers and data, Lato for `h1`/`h2`, Roboto for `h3`–`h6`, and Space
Grotesk for the wordmark.

**Breakpoints**: the design uses `max-width` queries at 520 / 640 / 700 / 860 /
980px. Tailwind's built-in `max-*` variant compiles to `not (min-width: N)`,
which excludes N itself, so `globals.css` defines inclusive `to-520:` …
`to-980:` variants instead. They are declared widest-first so the narrower
query always wins.

## Notes on the port

The page is a port of the Sysora sales-page design. Layout, type and spacing
match the source within a pixel at every breakpoint, with two deliberate
differences:

1. **Buttons use `line-height: normal` everywhere.** In the source, CTAs
   rendered as `<a>` inherited a 1.65 line-height (58px tall at `lg`) while
   those rendered as `<button>` used `normal` (53px) — the same control at two
   different heights. All of them are now 53px, matching the design system's own
   `--control-h-lg: 52px`. To restore the source's anchor height, drop
   `leading-[normal]` from `src/components/ui/Button.tsx`.
2. **The header has a mobile menu.** Below 860px the source simply dropped the
   nav links, leaving phones with no navigation.

The founder card's avatar is a placeholder: drop a headshot in `public/` and set
`founder.avatar` in `src/content/landing/proof.ts`.

## Sales flow

```
/systems-review   pre-checkout survey  ─┐
/systems-team     pre-checkout survey  ─┼─→  /checkout/SYS-000042   embedded payment
/build-request    intake survey (free) ─┘         │
                                                  ↓
                                    /checkout/SYS-000042/complete   post-payment intake
                                                  ↓
                                        /request/SYS-000042         status page
```

Every question on those pages is a row in `sales.survey_questions` — nothing
is hardcoded. Editing a question in the database changes the form on the next
request; the survey pages are `force-dynamic` for exactly that reason.

Answers snapshot the question's key, label and type at submission, so
rewording or deleting a question never corrupts an old submission.

### Payments

Stripe's Payment Element is embedded in `/checkout/[reference]` — the customer
never leaves the site. Card details go from the browser straight into Stripe's
iframe, so they never touch our server or database; we store only the brand and
last four that Stripe hands back.

`/api/stripe/webhook` is the authoritative "this was paid" signal. It records
every event in `sales.webhook_events`, which is unique on `(provider, event_id)`
— a replayed event is a no-op rather than a double credit.

The confirmation page **also** reconciles against Stripe directly, so the flow
never hangs waiting on a webhook that is slow or (locally, without
`stripe listen`) never arrives. Both paths call the same `markRequestPaid`,
which only moves a request out of an unpaid state, so they cannot double-apply.

A request may have **at most one payment in flight**, enforced by the
`payments_one_open_per_request` unique index rather than by an application
check — two concurrent renders of the checkout page would otherwise each
create a PaymentIntent. When a request is paid, any other open intent is
cancelled, so the same request can never be charged twice.

**With no Stripe keys set, checkout runs in simulation mode**: the payment step
completes without charging, so the rest of the flow stays testable. It refuses
to run when `NODE_ENV=production`.

### Setup

```bash
cp .env.example .env.local   # then fill in the blanks
```

`SUPABASE_SERVICE_ROLE_KEY` is required — without it the flow pages render a
setup notice instead of the form. Stripe keys are optional until you want to
take real money.

Testing webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Schema

The `sales` schema lives in the `Sysora Stack Automation` Supabase project
(`xulhgkrsqpodlokzpbig`). Money is stored in **minor units** as integers —
`4900` is $49.00. Every migration is in
[`supabase/migrations`](supabase/migrations); read the README there before
adding one.

Two things are easy to miss when pointing this at a fresh Supabase project,
because neither is part of the table definitions:

1. **Expose the schema.** PostgREST only serves the schemas it is told about,
   so a non-`public` schema answers `Invalid schema: sales` until you add it
   (Dashboard → Settings → API → Exposed schemas, or the
   `sales_09_expose_schema` migration).
2. **Grant `service_role`.** It bypasses RLS but still needs ordinary table
   privileges — see `sales_10_service_role_grants`.

## Dashboard

`/admin` — staff only. Signing in is not enough: the account must also be active
in `sales.users`, and every page asks a guard before it reads anything.

| Page | What it does |
|---|---|
| Overview | 30-day revenue, requests, survey completion, contacts, latest requests |
| Requests | Filter by open / type / assigned to me; open one to read every answer |
| Request detail | Change status, assign an owner, keep internal notes, see payments and receipts |
| Contacts | Everyone who ever gave us an email, searchable, with request counts |
| Plans | Edit the three offers — price, tagline, live/off |
| Questions | Edit the live forms; changes appear on the public site immediately |
| Settings | Booking link, calendar link, contact email, checkout copy |
| Today | Anyone: the end-of-day report, and the activity targets you're assigned to |
| Scoreboard | Manager and owner: revenue and activity for the running period, side by side |
| Targets | Manager and owner: revenue targets, their activity targets, and revenue from outside the checkout |
| Daily reports | Manager and owner: every report, and filing or fixing one on someone's behalf |
| Activities | Owner only: which activities exist and what the daily form asks |
| Team | Owner only: invite staff, set roles, assign activities, deactivate accounts |

Every write goes through a server action that records who did it in
`sales.audit_log`. Staff can read that log but not write to it — audit rows are
only ever created by the service role, so they can't be doctored from the UI.

### Auth

Authentication is ours, in `sales.users` / `sales.sessions` /
`sales.password_resets` — not Supabase Auth.

- Passwords are hashed with **scrypt** (memory-hard), stored as
  `scrypt$N$r$p$salt$hash`. The cost parameters travel with the hash, so they
  can be raised later without invalidating anyone's password.
- The session cookie holds a 256-bit random token; the database stores only its
  SHA-256. A leaked table therefore contains nothing you can log in with. The
  cookie is httpOnly, sameSite=lax, and secure outside development.
- A wrong password and an unknown account return the **same** message, and an
  unknown address still pays the cost of a hash — so the form can't be used to
  work out who has an account.
- Eight failures locks the account for fifteen minutes.
- Set-password links are single-use, stored hashed, and expire. Setting a
  password revokes every other session for that account.

Because the dashboard no longer authenticates through PostgREST, the private
tables have **no RLS policy at all**, which denies `anon` and `authenticated`
outright. The server reaches them with the service role, behind
`requireStaff()`. That check is now the only thing standing between a request
and the data, so every dashboard page must call it before reading anything. The
public catalogue policies — offers, active surveys, public settings — are
unchanged.

**Adding staff**: Team → invite. You get a one-time link to pass on, and the
invitee sets their own password. Nobody, including an owner, ever types someone
else's password.

**Roles**: four levels. The line between admin and manager is money; the line
below admin is the pipeline.

| | bde | admin | manager | owner |
|---|---|---|---|---|
| End-of-day report, own activity | ✓ | ✓ | ✓ | ✓ |
| Requests, contacts, answers, assignment, status, notes | — | ✓ | ✓ | ✓ |
| Questions and settings | — | ✓ | ✓ | ✓ |
| Plans | — | read only | read only | edit |
| Revenue, amounts, payments, receipts | — | — | ✓ | ✓ |
| Revenue targets, activity targets, manual revenue | — | — | ✓ | ✓ |
| Everyone's activity; fixing an old report | — | — | ✓ | ✓ |
| Deleting a target | — | — | — | ✓ |
| Activities, team, assignments | — | — | — | ✓ |

An admin sees no company finances anywhere: no revenue figure, no amount
column, no payments card. Finance data isn't merely hidden in the markup — the
payments query doesn't run for an admin, and `/admin/targets` and
`/admin/staff` redirect rather than render. The server actions behind pricing,
targets and revenue call `requireFinance()` or `requireOwner()`, so a crafted
request fails too.

A **BDE** is narrower still: one page. Every other dashboard route redirects to
`/admin/today`. That needed a new guard — until this role existed, having a
session was all the pipeline pages asked for — so they and their server actions
now call `requirePipeline()` rather than `requireStaff()`.

Capabilities are named rather than compared inline: `canSeeFinances(role)`,
`canManagePricing(role)`, `canManageTeam(role)`, `canDeleteTarget(role)`. They
live in `src/lib/admin/roles.ts` — a plain module, so client components can ask
the same questions — while the redirecting guards live in
`src/lib/admin/auth.ts`, which is `server-only`. The predicates decide what to
**render**; the guards decide what to **serve**. Widening a permission is one
edit in `roles.ts`.

An owner can't step themselves down — that would lock the last one out.

## Revenue and targets

A **target** is a revenue goal over a date range: a name, a start, an end, and
an amount. Any length — a week, a quarter, a campaign. Windows may not overlap,
and the database enforces that with an exclusion constraint rather than an
application check somebody can forget. Because each day belongs to at most one
target, "achieved" and "remaining" have exactly one meaning.

Two things count toward a target, and they cannot double-count because they
come from different tables:

- **Checkout revenue** — succeeded Stripe payments, net of refunds, whose
  success date falls inside the window.
- **Manual revenue** — Upwork and other outside clients, entered by hand with a
  client name, a source, an amount, and the date it was earned.

Manual entries carry no target id. Attribution is by date alone, so moving a
target's window re-attributes the money automatically and an entry is never
orphaned. Money earned outside every window isn't lost either — the targets
page reports it as revenue no target covers.

Nothing is snapshotted. Editing, deleting or backdating an entry shows up the
next time the page is read, which is why a closed target's number can still
move — and should, because the truth about last quarter can change.

A target's status is derived from today's date, never stored: upcoming, active,
closed. There is no job to run and no state to go stale.

One thing the schema can't decide for you: if a client pays through the
checkout *and* you also record them by hand, that money is counted twice.
Adding an entry whose client name matches an existing contact shows a warning,
but it is advisory — only you know whether it is the same money.

## Lead measures

Revenue is a **lag measure**. By the time it moves, the week that produced it is
over and there is nothing left to do about it. The activities that produce it —
Upwork bids, LinkedIn outreach, emails — are **lead measures**: things somebody
can still change on a Tuesday morning. Both halves sit on `/admin/scoreboard`,
and the verdict at the top comes from the worse of the two.

Activities are rows in `sales.activity_types`, not an enum and not columns.
Adding the fourth kind of outreach is a form submission under **Activities**,
never a migration. They are retired rather than deleted, because reports and
targets point at them.

**Targets are shared, assignments are personal.** A revenue target carries one
number per activity — 100 Upwork bids for the period, not 100 each. Everyone
assigned to that activity works the same number and sees the same progress,
with their own contribution shown underneath. Who is assigned to what is set
per person under **Team**, and it decides two things: which questions their
daily form asks, and which lead measures they can see.

**The end-of-day report** is one row per person per day, enforced by
`eod_reports_one_per_day` rather than by a check some second browser tab can
race. Saving the same day again edits it; every edit writes an audit row with
before and after. Anyone may fix their own today and yesterday — older days go
through **Daily reports**, so a number that changes a week later has a name
against it.

Some deliberate choices:

- **A zero is a row; a missing day is not zero.** The scoreboard reports "3 of
  7 days covered" and names the gaps. Treating silence as zero would make the
  totals look like measurements when they're guesses.
- **Attribution is by date**, exactly like manual revenue. A report carries no
  target id, so backdating moves it to the right target by itself, and work on
  a day no target covers shows up as unattributed rather than vanishing.
- **Pacing is calendar-day**, matching how a target already counts its days.
  `required_per_day = remaining ÷ days_remaining`, where `days_remaining`
  includes today and never drops below one — `days_left` is *zero* on the final
  day, and dividing by it would fail exactly when the number matters most.
- **The pace rule lives in SQL, once per view.** `activity_progress` and
  `target_progress` compute `expected_by_today`, `required_per_day` and `pace`
  the same way, so "behind" means one thing on a page that shows both.
- **Dates come from the browser.** The server runs on UTC; somebody in IST
  filing at 01:00 is on a date UTC hasn't reached, and defaulting to the
  server's day would file their Tuesday as Monday.

## Deploying to Vercel

The Next.js app lives in `sysora-web/`, not at the repository root, so the
Vercel project needs **Root Directory = `sysora-web`** (Settings → General).
Pointed at the root, Vercel finds no `package.json` and the build fails before
it starts.

Environment variables to set (Settings → Environment Variables):

| Variable | |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret** — the app cannot read anything without it |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | public |
| `STRIPE_SECRET_KEY` | **secret** |
| `STRIPE_WEBHOOK_SECRET` | **secret**, from the webhook endpoint you add in Stripe |
| `NEXT_PUBLIC_SITE_URL` | your domain, e.g. `https://sysora.com` |

Leave `ALLOW_SIMULATED_PAYMENTS` unset in production — simulated payments
refuse to run there anyway, but there is no reason to define it.

`NEXT_PUBLIC_SITE_URL` only matters on a custom domain: without it the app
falls back to Vercel's own deployment URL, so generated invite links never
point at localhost.

Point the Stripe webhook at `https://your-domain/api/stripe/webhook` and paste
its signing secret into `STRIPE_WEBHOOK_SECRET`.

The database is not in this repository — the `sales` schema is applied
directly to Supabase, so a new environment needs those migrations replayed
against its own project.
