@AGENTS.md

# Sysora Stack

**Read `../docs/README.md` before changing anything.** It indexes five
files that carry the context this repository does not make obvious:

- `docs/architecture.md`, how it fits together and which tables are
  legacy
- `docs/decisions.md`, why the non-obvious code is the way it is
- `docs/operations.md`, environment, webhooks, the cron sweeper, how to
  verify
- `docs/roadmap.md`, what is live, what is knowingly unfinished, what
  is v2 and must not be "fixed" by accident
- `docs/content-rules.md`, the house style for anything a customer
  reads

## The short version

Prepaid GoHighLevel and automation hours, sold on a one-page site, with
a client portal and a staff console in the same Next.js application.
Supabase Postgres, Stripe, and GoHighLevel for every email.

## Four things that will bite you

1. **Customer copy lives in `src/content/`, not in components.** It is
   pulled from a design file and changes constantly.
2. **The hour balance is a view over two append-only tables.** Never
   add a stored total.
3. **Two code paths mark an order paid** and both must stay idempotent.
   The locks are deliberate, see `docs/decisions.md`.
4. **Customer-facing copy has hard style rules**, including no
   em-dashes and a banned-word list. See `docs/content-rules.md`.

## Before you push

```bash
npm run verify
```

Typecheck, lint, test, build. GitHub Actions runs the same command on
every push, and a red run means the commit is not fit to go live.

For what the tests do not cover, measure rather than eyeball: computed
styles for design work, rendered HTML for copy sweeps, SQL for anything
concurrent.
