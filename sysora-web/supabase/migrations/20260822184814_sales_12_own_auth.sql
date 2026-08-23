-- ============================================================
-- Sysora auth — our own, in the sales schema
--
-- Replaces Supabase Auth. sales.staff becomes sales.users, keeping
-- the same ids so every column already pointing at a staff member
-- (assigned_to, actor_id, updated_by) stays valid.
-- ============================================================

create table sales.users (
  id                uuid primary key default gen_random_uuid(),
  email             text not null,
  email_normalized  text not null generated always as (lower(trim(email))) stored,
  password_hash     text,
  full_name         text,
  role              sales.staff_role not null default 'admin',
  is_active         boolean not null default true,
  last_login_at     timestamptz,
  -- Brute-force defence: too many misses and the account rests.
  failed_attempts   integer not null default 0,
  locked_until      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table sales.users is 'Dashboard accounts. password_hash is scrypt (salt:hash, hex) — never a plaintext password.';
comment on column sales.users.password_hash is 'Null until the person sets one through a reset link.';

create unique index users_email_key on sales.users (email_normalized);
create index users_active_idx on sales.users (is_active) where is_active;

create trigger users_set_updated_at
  before update on sales.users
  for each row execute function sales.set_updated_at();

-- Carry the existing staff across, ids intact.
insert into sales.users (id, email, full_name, role, is_active, created_at)
select user_id, coalesce(email, 'unknown@sysora.local'), full_name, role, is_active, created_at
from sales.staff;

-- ---- Sessions ----------------------------------------------

create table sales.sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references sales.users (id) on delete cascade,
  -- Only the SHA-256 of the cookie value is stored, so a database leak
  -- doesn't hand anyone a working session.
  token_hash   text not null unique,
  expires_at   timestamptz not null,
  revoked_at   timestamptz,
  ip           inet,
  user_agent   text,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

comment on table sales.sessions is 'Signed-in sessions. The cookie holds the token; we store only its hash.';

create index sessions_user_idx on sales.sessions (user_id, created_at desc);
create index sessions_live_idx on sales.sessions (expires_at) where revoked_at is null;

-- ---- Password reset / invite tokens ------------------------

create table sales.password_resets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references sales.users (id) on delete cascade,
  token_hash  text not null unique,
  purpose     text not null default 'reset' check (purpose in ('reset', 'invite')),
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

comment on table sales.password_resets is 'Single-use links for setting a password. Hashed, expiring, and burned on use.';

create index password_resets_user_idx on sales.password_resets (user_id, created_at desc);
create index password_resets_live_idx on sales.password_resets (expires_at) where used_at is null;

-- ---- Repoint the references off auth.users -----------------

alter table sales.requests  drop constraint if exists requests_assigned_to_fkey;
alter table sales.settings  drop constraint if exists settings_updated_by_fkey;
alter table sales.audit_log drop constraint if exists audit_log_actor_id_fkey;
alter table sales.customers drop constraint if exists customers_auth_user_id_fkey;

alter table sales.requests
  add constraint requests_assigned_to_fkey
  foreign key (assigned_to) references sales.users (id) on delete set null;

alter table sales.settings
  add constraint settings_updated_by_fkey
  foreign key (updated_by) references sales.users (id) on delete set null;

alter table sales.audit_log
  add constraint audit_log_actor_id_fkey
  foreign key (actor_id) references sales.users (id) on delete set null;

comment on column sales.customers.auth_user_id is 'Unused since auth moved in-house; kept for a future customer login.';

-- ---- Retire the Supabase-Auth-based access rules -----------
--
-- The dashboard no longer authenticates through PostgREST, so policies
-- keyed on auth.uid() can never match. Private tables keep RLS enabled
-- with no policy at all, which denies anon and authenticated outright;
-- the server reaches them with the service role, behind its own session
-- check. The public catalogue policies stay exactly as they were.

drop policy if exists staff_self_read           on sales.staff;
drop policy if exists staff_super_admin_write   on sales.staff;
drop policy if exists offers_staff_all          on sales.offers;
drop policy if exists settings_staff_all        on sales.settings;
drop policy if exists surveys_staff_all         on sales.surveys;
drop policy if exists survey_questions_staff_all on sales.survey_questions;
drop policy if exists customers_staff_all       on sales.customers;
drop policy if exists survey_responses_staff_all on sales.survey_responses;
drop policy if exists survey_answers_staff_all  on sales.survey_answers;
drop policy if exists requests_staff_all        on sales.requests;
drop policy if exists payments_staff_read       on sales.payments;
drop policy if exists payments_staff_write      on sales.payments;
drop policy if exists subscriptions_staff_all   on sales.subscriptions;
drop policy if exists audit_log_staff_read      on sales.audit_log;
drop policy if exists events_staff_read         on sales.events;
drop policy if exists webhook_events_super_admin_read on sales.webhook_events;

drop table sales.staff;
drop function if exists sales.is_staff();
drop function if exists sales.is_super_admin();

-- New tables are private by construction.
alter table sales.users           enable row level security;
alter table sales.sessions        enable row level security;
alter table sales.password_resets enable row level security;

revoke all on sales.users, sales.sessions, sales.password_resets from anon, authenticated;

grant all on sales.users, sales.sessions, sales.password_resets to service_role;
