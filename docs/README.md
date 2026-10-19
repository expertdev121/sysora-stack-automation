# Sysora Stack, developer documentation

Start here. These five files are the context a new person, or a new
Claude session, needs before touching anything.

| File | What it answers |
| --- | --- |
| [architecture.md](architecture.md) | How the site fits together. Routes, data model, auth, how money becomes hours. |
| [decisions.md](decisions.md) | Why it is built this way. Every non-obvious choice, with the reason. |
| [operations.md](operations.md) | Running it. Environment variables, webhooks, the cron sweeper, how to verify a change. |
| [roadmap.md](roadmap.md) | Where we are. What is live, what is knowingly unfinished, what is v2. |
| [content-rules.md](content-rules.md) | House style for anything a customer reads. |

## The product in three sentences

Sysora Stack sells prepaid blocks of GoHighLevel, automation and
development hours, $19 an hour down to $13 at 150 hours. A customer
buys a pack on the public site, gets a client portal account, sends
tasks into it, and watches the balance go down as work is logged
against it. Staff run delivery from an admin console in the same
application.

## The shape of the repository

```
sysora-website/
  docs/                    this documentation
  supabase/migrations/     every schema change, in order
  sysora-web/              the Next.js application
    src/app/               routes: public, /portal, /admin, /api
    src/components/        sales/, portal/, admin/, legal/, ui/
    src/content/           all customer-facing copy, as data
    src/lib/               sales/, portal/, admin/, auth/, supabase/
```

## Two conventions worth knowing immediately

**Copy lives in `src/content/`, not in components.** Headlines, FAQ
entries, legal text and checkout labels are exported objects. A copy
change is a content edit, and the component renders whatever it is
given. This exists because the copy is pulled from a design file and
changes far more often than the markup.

**Comments explain why, not what.** The code carries the reasoning for
anything surprising, in place. If a line looks wrong and has a comment,
read the comment before changing it, because several of them are
load-bearing. `decisions.md` holds the larger choices.
