# Operations

## Environment variables

Set in Vercel, production target. `.env.local` mirrors them for local
development and is gitignored.

| Variable | Purpose | State |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project | set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | unused in practice, RLS blocks everything | set |
| `SUPABASE_SERVICE_ROLE_KEY` | every server read and write | set |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Payment Element | set, **test mode** |
| `STRIPE_SECRET_KEY` | PaymentIntents | set, **test mode** |
| `STRIPE_WEBHOOK_SECRET` | verifies Stripe's callback | **not set**, see roadmap |
| `CRON_SECRET` | bearer for the sweeper endpoint | set, pg_cron holds the match |
| `ABANDONED_CART_GRACE_MINUTES` | minutes before a cart counts abandoned | 30 |
| `NEXT_PUBLIC_SITE_URL` | canonical origin for server-built links | set |
| `GHL_ABANDONED_CART_WEBHOOK_URL` | legacy fallback for the cart hook | set, superseded by the database |

Local development needs `SUPABASE_SERVICE_ROLE_KEY` filled in or every
page that touches data throws. It ships empty.

## Webhooks

Configured at **Admin, Settings, Outbound webhooks**. Paste a
GoHighLevel inbound-webhook URL and press **Send test and save**. The
URL is stored only if GoHighLevel accepts the payload.

| Key | Status |
| --- | --- |
| `abandoned_cart` | live |
| `payment_confirmation` | live |
| `hours_topped_up` | **no URL, v2** |

### If a test says it sent but nothing appears in GoHighLevel

A 200 from GHL means the request was accepted, not that you will see it.
Check, in this order:

1. **Arm the trigger.** In the workflow, open the Inbound Webhook
   trigger and press *Fetch Sample Request*, then send the test again.
   Requests that arrive when it is not listening still run the workflow
   but never show up as mappable sample data.
2. **Is the workflow published?** A draft accepts the webhook, returns
   the same 200, and runs nothing.
3. **Execution logs**, not the trigger panel. GHL returns an execution
   id in its response body.

### Fields the confirmation payload carries

`event`, `account_created`, `portal_email`, `portal_password`,
`portal_login_url`, plus contact fields, `reference`, `package`,
`hours`, `billing`, `amount_formatted`, `rate_per_hour_formatted`,
`card_brand`, `card_last4`, `receipt_url`, `hours_expire_at`,
`paid_at`, `portal_url`, `order_url`. 29 in all.

`portal_password` is filled only when `account_created` is true. In a
**test** payload it is always `000000`, which is deliberately not a
working password.

## The abandoned-cart sweeper

pg_cron job 1, `*/5 * * * *`, posts to `/api/cron/abandoned-carts` with
the bearer secret. A healthy run answers:

```json
{"ok":true,"grace_minutes":30,"candidates":0,"sent":0,"failed":0,"skipped":0}
```

Check recent runs:

```sql
select to_char(created,'Mon DD HH24:MI') as at, status_code, left(content,120)
from net._http_response order by created desc limit 10;
```

It only picks rows that are `kind = 'hour_pack'`, `status =
'awaiting_payment'`, unpaid, never notified, under 5 attempts, older
than the grace period, and not `source = 'portal'`.

**Manual step while `STRIPE_WEBHOOK_SECRET` is unset:** a customer who
pays but never reaches the confirmation page stays `awaiting_payment`
and will be nudged. Remove payers from the GHL sequence by hand until
the Stripe webhook is wired.

## Accounts

Staff and clients share `sales.users`, separated by `role`. Roles in
increasing reach: `bde`, `admin`, `manager`, `owner`, plus `client` for
the portal.

Passwords are not in this repository. To set one, generate the hash
with the application's own `hashPassword` rather than by hand, so the
scrypt parameters and the stored format cannot drift, then update
`password_hash` and clear `failed_attempts` and `locked_until`.

## Verifying a change

```bash
npm run verify     # typecheck, lint, test, build. All four must pass.
npm run test       # just the tests
npm run test:watch # while working
```

GitHub Actions runs exactly `verify` on every push and every pull
request, in `.github/workflows/ci.yml`. A red run means the commit is
not fit to go live.

### What the tests cover

They are in `sysora-web/tests/` and run in about a second, with no
database and no secrets.

- **content-rules** enforces the house style on `src/content`: no
  em-dashes, no semicolons in prose, no banned words. Client quotations
  are detected by their surrounding quote marks and exempted.
- **offer** checks the pack table prices itself correctly, that rates
  only fall as packs grow, that the FAQ has no empty or duplicate
  entries, and that the **24-hour cancellation notice appears in all
  four places that describe cancelling**. Those four contradicted each
  other once.
- **routes** builds the route list from the app directory and asserts
  every internal `href` in `src` resolves to one, that checkout links
  use only the published shape, and that nothing links to a deleted
  page. Migrations must carry a timestamp prefix.
- **webhooks** pins the payload field lists for both hooks, asserts the
  payloads stay flat because GoHighLevel will not read nested objects,
  checks the password is sent only on the order that creates the
  account, and covers the URL validator including the loopback,
  link-local and metadata hosts it has to refuse.

The suite was mutation-checked when written: breaking the cancellation
copy, adding an em-dash, linking a deleted page and mis-pricing a pack
each produced a failure.

### Still true, and not covered by tests

- `npx tsc --noEmit` then `npm run build` before every push.
- **Measure, do not eyeball.** When matching a design, compare computed
  styles and section heights rather than screenshots. Screenshots have
  been misleading more than once; a 48px container difference and a
  wrong border colour both survived visual review and were caught by
  measurement.
- For copy sweeps, check the **rendered HTML of the live page**, not the
  source. Source greps hit code comments and miss template-generated
  text.
- Race conditions and locks are testable directly in SQL with a `do`
  block, which is how the confirmation claim was verified.

## Deployment

Today: push to `main`, Vercel builds and promotes to production. CI runs
the same checks in parallel but **does not block the deploy yet**.

Migrations are applied to Supabase separately and committed to
`supabase/migrations/` with a matching filename, so the directory is the
history even though it is not the mechanism.

### Turning on the gate

`.github/workflows/deploy.yml` already runs the checks on every push to
`main` and has a deploy job behind them. That job is switched off, so
there is never a window where neither Vercel nor Actions is deploying.
Three settings and one commit turn it on.

1. **Create a Vercel token.** Vercel, Account Settings, Tokens. Scope it
   to the team that owns the project.
2. **Add three repository secrets** at GitHub, Settings, Secrets and
   variables, Actions:

   | Secret | Value |
   | --- | --- |
   | `VERCEL_TOKEN` | the token from step 1 |
   | `VERCEL_ORG_ID` | `team_OeiME6VcOi2sMXmVuu5tRI71` |
   | `VERCEL_PROJECT_ID` | `prj_I3PzPZ7ajkQDpuKt0HbbUIlHS5dw` |

3. **Add a repository variable** on the same page, Variables tab:
   `DEPLOY_VIA_ACTIONS` = `true`. This is what un-skips the deploy job.
4. **Stop Vercel deploying on its own**, or every push deploys twice.
   Add `vercel.json` at the repository root:

   ```json
   { "git": { "deploymentEnabled": { "main": false } } }
   ```

Do step 4 last. Between steps 3 and 4 both deploy, which is wasteful but
harmless. Doing 4 first stops deploys entirely until the rest is done.

To undo any of it, delete `vercel.json` and Vercel resumes.

### After it is on

A push to `main` runs typecheck, lint, tests and build. If any fail, the
deploy job never starts and production keeps running the previous
version. If they pass, Actions pulls the Vercel project's own
environment, builds, deploys, then checks the homepage answers 200.

Secrets stay where they are. `vercel pull` fetches the project's
environment variables at deploy time, so the Supabase and Stripe keys
never pass through GitHub. The only new credential is the Vercel token.

### Known warning

The runner reports that `actions/checkout@v4` and `actions/setup-node@v4`
target Node 20, which is deprecated, and runs them on Node 24 anyway.
Runs succeed. Bump both to `@v5` when convenient.
