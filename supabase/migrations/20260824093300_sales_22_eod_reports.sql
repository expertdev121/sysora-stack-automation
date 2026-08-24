-- ============================================================
-- The end-of-day report.
--
-- One per person per day, and the database says so. Phase 1
-- settled this argument with payments_one_open_per_request: a rule
-- that must not break under two browser tabs is a constraint, not
-- a check in a server action.
--
-- Attribution is by date alone, exactly like sales.manual_revenue.
-- No target id is stored, so backdating a report moves its counts
-- to the right target by itself, and a report can never be
-- orphaned by someone editing a target's window.
-- ============================================================

create table sales.eod_reports (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references sales.users (id) on delete cascade,
  -- The day the work happened, not the day it was typed in.
  reported_on  date not null,
  notes        text,
  submitted_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint eod_reports_one_per_day unique (user_id, reported_on)
);

comment on table sales.eod_reports is
  'One end-of-day report per person per day. Counts live in sales.eod_entries.';
comment on column sales.eod_reports.reported_on is
  'Not constrained against the future here: current_date is not immutable, and a person east of UTC legitimately reports a date the server has not reached. The server action bounds it instead.';

create index eod_reports_day_idx on sales.eod_reports (reported_on desc);
create index eod_reports_user_idx on sales.eod_reports (user_id, reported_on desc);

create trigger eod_reports_set_updated_at
  before update on sales.eod_reports
  for each row execute function sales.set_updated_at();

-- ---- The counts --------------------------------------------
--
-- A zero is a row. Absence is not zero: a day nobody reported is a
-- gap in the record, and a scoreboard that quietly reads it as
-- zero is telling you something it does not know.

create table sales.eod_entries (
  id               uuid primary key default gen_random_uuid(),
  report_id        uuid not null references sales.eod_reports (id) on delete cascade,
  activity_type_id uuid not null references sales.activity_types (id) on delete restrict,
  count            integer not null check (count >= 0),
  constraint eod_entries_one_per_type unique (report_id, activity_type_id)
);

comment on table sales.eod_entries is
  'How many of one activity a person did on one day. Zero is meaningful; a missing row is not zero.';

create index eod_entries_type_idx on sales.eod_entries (activity_type_id);

alter table sales.eod_reports enable row level security;
alter table sales.eod_entries enable row level security;
revoke all on sales.eod_reports, sales.eod_entries from anon, authenticated;
grant all on sales.eod_reports, sales.eod_entries to service_role;
