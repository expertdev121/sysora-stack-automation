-- ============================================================
-- The lead measures, as data.
--
-- Upwork bids, LinkedIn outreach and emails are rows, not columns
-- and not an enum, because the list will grow. Adding the fourth
-- kind of outreach must be a form submission, never a migration.
--
-- Types are deactivated, never deleted — same as offers and
-- surveys. A type with history behind it has to keep existing or
-- every scoreboard that counted it starts lying.
-- ============================================================

create table sales.activity_types (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  label       text not null,
  -- What the end-of-day form actually asks. Kept with the type so
  -- the wording is editable without touching the form.
  question    text not null,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint activity_types_slug_format check (slug ~ '^[a-z][a-z0-9_]*$'),
  constraint activity_types_label_present check (length(trim(label)) > 0),
  constraint activity_types_question_present check (length(trim(question)) > 0)
);

comment on table sales.activity_types is
  'Configurable lead measures. Deactivate rather than delete: history refers to these rows.';

create index activity_types_order_idx on sales.activity_types (sort_order) where is_active;

create trigger activity_types_set_updated_at
  before update on sales.activity_types
  for each row execute function sales.set_updated_at();

alter table sales.activity_types enable row level security;
revoke all on sales.activity_types from anon, authenticated;
grant all on sales.activity_types to service_role;

insert into sales.activity_types (slug, label, question, sort_order) values
  ('upwork_bids',       'Upwork bids',       'How many Upwork bids did you submit?',        10),
  ('linkedin_outreach', 'LinkedIn outreach', 'How many people did you reach on LinkedIn?',  20),
  ('emails_sent',       'Emails sent',       'How many outreach emails did you send?',      30);

-- ---- Who does what -----------------------------------------
--
-- An assignment decides two things: which questions a person's
-- end-of-day form asks, and which lead measures they see. A BDE
-- assigned to bidding is asked about bids and nothing else.
--
-- Cascade on both sides: an assignment is a current arrangement,
-- not a record of anything. Deleting one deletes no history.

create table sales.user_activities (
  user_id          uuid not null references sales.users (id) on delete cascade,
  activity_type_id uuid not null references sales.activity_types (id) on delete cascade,
  assigned_by      uuid references sales.users (id) on delete set null,
  created_at       timestamptz not null default now(),
  primary key (user_id, activity_type_id)
);

comment on table sales.user_activities is
  'Which lead measures a person is responsible for. Drives their EOD form and their scoreboard.';

create index user_activities_type_idx on sales.user_activities (activity_type_id);

alter table sales.user_activities enable row level security;
revoke all on sales.user_activities from anon, authenticated;
grant all on sales.user_activities to service_role;
