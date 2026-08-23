-- ============================================================
-- Lead measures attached to a revenue target.
--
-- "$1,000 between the 1st and the 10th" is the lag measure — it
-- reports what already happened. "100 Upwork bids" is the lead
-- measure: the thing a person can actually do something about on
-- a Tuesday morning. One revenue target carries as many of them
-- as you like.
--
-- One shared number per activity, not a number per person. Three
-- BDEs bidding against the same 100 see the same 100 and the same
-- progress; who contributed what is a separate question, answered
-- by sales.activity_progress_by_user.
-- ============================================================

create table sales.activity_targets (
  id                uuid primary key default gen_random_uuid(),
  revenue_target_id uuid not null references sales.revenue_targets (id) on delete cascade,
  -- restrict, not cascade: a type being counted somewhere cannot be
  -- deleted out from under the count. Deactivate it instead.
  activity_type_id  uuid not null references sales.activity_types (id) on delete restrict,
  target_count      integer not null check (target_count > 0),
  created_by        uuid references sales.users (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint activity_targets_one_per_type unique (revenue_target_id, activity_type_id)
);

comment on table sales.activity_targets is
  'A lead measure on a revenue target: how many of this activity the team owes inside the window.';
comment on column sales.activity_targets.target_count is
  'Shared across everyone assigned to the activity, not divided between them.';

create index activity_targets_target_idx on sales.activity_targets (revenue_target_id);

create trigger activity_targets_set_updated_at
  before update on sales.activity_targets
  for each row execute function sales.set_updated_at();

alter table sales.activity_targets enable row level security;
revoke all on sales.activity_targets from anon, authenticated;
grant all on sales.activity_targets to service_role;
