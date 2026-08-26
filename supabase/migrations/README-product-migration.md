# Bringing the product app into this project

Run on 2026-08-27. The Sysora product application lived in its own
Supabase project (`svpuqzrofbecmabmcevb`, "Sysora Stack Team"). It now
lives here, in the `product` schema.

## One project, three schemas

| Schema | What it is |
|---|---|
| `public` | The EMS — orgs, profiles, attendance, leave, compensation, EOD reports, credentials |
| `sales` | The website — offers, checkout, revenue, targets, activity |
| `product` | The product app — agents, teams, chat, memory, plans, billing |

`product` rather than `public` because `public` was already the EMS's
home. Two applications sharing an unprefixed namespace is how
table-name collisions start, and both have a `User`-shaped idea of a
person that means different things.

## What moved, and how

56 tables, 32 enum types, 63 foreign keys, 92 indexes, 484 rows.

The DDL was generated from the source catalogue rather than written by
hand — `pg_get_constraintdef` and `pg_get_indexdef` emit definitions
Postgres itself will accept, so the copy cannot drift from the original
through a transcription slip.

The **data** was pulled by the target directly from the source's REST
API using the `http` extension, so it never passed through an
intermediate. Correctness was then proved by fingerprint: an md5 over
`to_json` of every row of every table, ordered deterministically, taken
on both sides.

```
source b137a1ac7d67b50e779a30ddd7f08673
target b137a1ac7d67b50e779a30ddd7f08673
```

Equal, across all 55 tables — jsonb, text arrays, timestamps and the
pgvector embeddings included.

## What did NOT come across

- **Storage objects.** Five files in the source project's storage
  bucket. Those live in S3, not Postgres, and no SQL moves them. If
  `UploadedFile.fileUrl` points at the old project, those URLs still
  resolve to the old project until the files are re-uploaded.
- **`auth.users`.** Nothing to move — the source had zero rows. The app
  authenticates against its own `product."User"` table, which is why
  this migration was as simple as it was.
- **The source project.** Untouched. It is still running and still
  holds the original data; this was a copy, so switching over and
  rolling back are both still open.

## Security posture

Reproduced, not relaxed: RLS enabled on all 55 tables with **no
policies**, which denies `anon` and `authenticated` outright. The
service role bypasses RLS and is the only way in — which is what the
app was already relying on.

Supabase's own `ensure_rls` event trigger only enforces this on
`public`, so a new schema does not inherit it. Migration 05 does it
explicitly.

## Pointing the app here

The naming (`cuid` ids, `updatedAt`, a `_MemoryRelated` join table)
says Prisma, which connects over the Postgres protocol rather than
PostgREST. Two changes:

1. `DATABASE_URL` → this project.
2. Append `?schema=product` to it. Prisma then resolves every unqualified
   model to `product`, so no model needs a `@@schema` annotation.

`product` is also exposed through PostgREST (migration 05) in case any
part of the app uses the REST API.
