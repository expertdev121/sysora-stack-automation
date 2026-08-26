# Sysora Stack

Two applications and one database.

| Folder | What it is | Port |
|---|---|---|
| [`sysora-web`](sysora-web) | The public site — landing page, checkout, and the pipeline dashboard at `/admin` | 3000 |
| [`sysora-sales`](sysora-sales) | Money — revenue, targets, spend, and the activity that produces them | 3100 |
| [`supabase`](supabase/migrations) | The schemas all of it reads and writes | — |

## One thing in one place

| | owns |
|---|---|
| The EMS (separate app) | People, attendance, leave, and **submitting the end-of-day report** |
| `sysora-web` | The website, the checkout, and the request pipeline |
| `sysora-sales` | Revenue, targets, spend, and **reading** the daily activity |

Each of those used to have a copy of something another one owned —
three end-of-day forms, two target editors, two catalogues of what to
count. They now have one each, which is why no two screens can disagree
about a number.

### How a bid becomes target progress

```
profiles → eod_reports → eod_metrics → work_metrics ← sales.activity_targets
```

A BDE files one report saying two bids and fourteen Connects. Those rows
are the only place that fact exists; `sales.activity_progress` reads
them. Nothing is copied into the sales schema, so nothing can drift.

Only profiles whose job is `bde` count toward sales targets — one
predicate in one view, easy to widen later.

The schema sits at the top level rather than inside either app, because
neither owns it. Revenue targets aggregate over payments, and payments
are created by the website's checkout — so the money and the site that
earns it cannot live in separate databases without inventing a network
boundary in the middle of a single query.

## Who sees what

Accounts are shared: one row in `sales.users`, one password, a separate
session cookie per app because cookies are scoped to an origin.

| | sysora-web `/admin` | sysora-sales |
|---|---|---|
| bde | the daily report, nothing else | — |
| admin | the pipeline, no revenue | — |
| manager | the pipeline plus revenue | everything |
| owner | everything | everything |

Roles, invitations and activity assignments are managed in one place —
`sysora-web` → Team. Two apps that can both create logins is two places
to get it wrong.

## Running them

```bash
npm --prefix sysora-web run dev     # http://localhost:3000
npm --prefix sysora-sales run dev   # http://localhost:3100
```

Each app needs its own `.env.local` with the Supabase URL and the
service-role key. Both are gitignored; the service-role key bypasses RLS
and must never reach a browser.
