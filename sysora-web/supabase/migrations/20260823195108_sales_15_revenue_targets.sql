-- ============================================================
-- Targets become date ranges of any length rather than calendar
-- months. A target runs from starts_on to ends_on inclusive; any
-- revenue earned inside that window counts toward it.
-- ============================================================

drop view if exists sales.target_progress;

alter table sales.targets rename to revenue_targets;

alter table sales.revenue_targets add column name text;
alter table sales.revenue_targets add column starts_on date;
alter table sales.revenue_targets add column ends_on date;
alter table sales.revenue_targets add column currency char(3) not null default 'USD';

-- Existing monthly rows become full-month ranges.
update sales.revenue_targets
set starts_on = period_start,
    ends_on   = (period_start + interval '1 month' - interval '1 day')::date,
    name      = coalesce(name, to_char(period_start, 'FMMonth YYYY'));

-- Placeholder rows with no actual target would fail the > 0 check
-- below and carry no information worth migrating.
delete from sales.revenue_targets where revenue_target = 0;

alter table sales.revenue_targets alter column starts_on set not null;
alter table sales.revenue_targets alter column ends_on set not null;

drop index if exists sales.targets_period_key;
drop index if exists sales.targets_recent_idx;
alter table sales.revenue_targets drop constraint if exists targets_period_is_month_start;
alter table sales.revenue_targets drop column period_start;

alter table sales.revenue_targets
  add constraint revenue_targets_dates_ordered check (ends_on >= starts_on);

alter table sales.revenue_targets
  add constraint revenue_targets_amount_positive check (revenue_target > 0);

-- Overlap is prevented by the database, not by an application check
-- somebody can forget: any date belongs to at most one target, so
-- "achieved" and "remaining" have exactly one meaning.
alter table sales.revenue_targets
  add constraint revenue_targets_no_overlap
  exclude using gist (daterange(starts_on, ends_on, '[]') with &&);

create index revenue_targets_window_idx on sales.revenue_targets (starts_on, ends_on);

comment on table sales.revenue_targets is
  'A revenue goal over an arbitrary date range. Windows may not overlap.';
comment on column sales.revenue_targets.revenue_target is
  'Minor units, like every other amount in this schema.';
comment on column sales.revenue_targets.requests_target is
  'Optional secondary goal, kept from the monthly version.';
