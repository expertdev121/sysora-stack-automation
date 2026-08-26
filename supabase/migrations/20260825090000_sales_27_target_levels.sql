-- ============================================================
-- Two kinds of target: the year, and the sprint inside it.
--
-- Until now no two targets could share a day — one exclusion
-- constraint over the whole table. That is the right rule for
-- sprints, and it makes an annual target impossible: a financial
-- year overlaps every sprint inside it by definition.
--
-- So the rule becomes per level. A day belongs to at most one
-- annual target AND at most one sprint. Each counts the same money
-- through its own lens; neither can double-count within itself.
-- ============================================================

-- Postgres refuses to change the type of a column a view selects
-- ("cannot alter type of a column used by a view or rule"), and
-- target_progress reads revenue_target. Both come back in migration 29,
-- which rebuilds every view for two currencies — these three run as one
-- unit and the schema is only briefly without them.
drop view if exists sales.target_economics;
drop view if exists sales.target_progress;

create type sales.target_level as enum ('annual', 'sprint');

alter table sales.revenue_targets
  add column level sales.target_level not null default 'sprint';

comment on column sales.revenue_targets.level is
  'annual: the financial year, set once. sprint: a push inside it.';

-- ₹60,00,000 is 600,000,000 paise. A 4-byte integer stops at
-- 2,147,483,647 — about ₹21.4 crore — which is close enough to a
-- real number to be worth removing now rather than discovering on
-- the day somebody types one too many zeros.
alter table sales.revenue_targets
  alter column revenue_target type bigint;

-- ---- The lock ----------------------------------------------
--
-- "This will never change" should be enforced, not promised. The
-- server action refuses edits to a locked row's amount and dates;
-- unlocking is owner-only and audited.

alter table sales.revenue_targets
  add column is_locked boolean not null default false;

comment on column sales.revenue_targets.is_locked is
  'A locked target refuses edits to its amount and dates. Owner-only to unlock, and audited.';

-- ---- Overlap, per level ------------------------------------
--
-- Two partial exclusion constraints rather than one constraint
-- including `level with =`, which would need the btree_gist
-- extension for equality on an enum inside a GiST index. Same
-- guarantee, one fewer dependency.

alter table sales.revenue_targets drop constraint revenue_targets_no_overlap;

alter table sales.revenue_targets
  add constraint revenue_targets_no_overlap_sprint
  exclude using gist (daterange(starts_on, ends_on, '[]') with &&)
  where (level = 'sprint');

alter table sales.revenue_targets
  add constraint revenue_targets_no_overlap_annual
  exclude using gist (daterange(starts_on, ends_on, '[]') with &&)
  where (level = 'annual');

create index revenue_targets_level_idx on sales.revenue_targets (level, starts_on desc);
