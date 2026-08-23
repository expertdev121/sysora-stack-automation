# Migrations

Every migration in the `sales` schema, in the order it was applied to the
project. Filenames carry the timestamp the Supabase migration table
records, so `supabase db push` and `supabase db reset` both agree with
what is already live.

Two things to know before editing anything here:

- **Migration 08 does not exist.** It was drafted, failed, and was
  replaced by 09. The gap is deliberate; do not renumber to close it.
- **Migrations 01–13 predate this directory.** They were applied
  directly against the project and written down afterwards, so they are
  a faithful record rather than the file that ran. From 14 onward the
  file is the source.
- **14 and 19 both replace the role enum rather than extending it.**
  `ALTER TYPE … ADD VALUE` cannot run inside a migration's transaction,
  so each new role swaps the type. Expect to do the same for the next
  one; it is not an accident to tidy up.

The project also contains `0001_schema` … `0007_credential_grants`, which
belong to the Sysora product, not this site. They are not reproduced
here — a reset from this directory rebuilds the `sales` schema only.

## Conventions

- Amounts are integers in minor units. `4900` is $49.00. Never a float.
- Aggregation lives in views with `security_invoker = true`, not in
  application code, so every reader gets the same arithmetic.
- Private tables have RLS enabled and *no policy*, which denies `anon`
  and `authenticated` outright. The server reaches them with the service
  role, behind its own session check.
- Rules that must not be forgotten are constraints, not conventions —
  see `revenue_targets_no_overlap` and `payments_one_open_per_request`,
  both of which exist because an application-level check cannot win a
  race.
