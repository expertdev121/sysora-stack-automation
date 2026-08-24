-- ============================================================
-- Sysora sales schema — core
-- ============================================================

create schema if not exists sales;

comment on schema sales is 'Sysora marketing site: leads, surveys, orders, payments and tracking.';

create type sales.staff_role as enum ('admin', 'super_admin');
create type sales.offer_kind as enum ('build_request', 'systems_review', 'systems_team');
create type sales.billing_interval as enum ('one_time', 'month', 'year');
create type sales.survey_kind as enum ('pre_checkout', 'post_payment', 'build_request', 'custom');

create type sales.question_type as enum (
  'short_text', 'long_text', 'email', 'phone', 'url', 'number',
  'single_select', 'multi_select', 'boolean', 'scale', 'date', 'file'
);

create type sales.response_status as enum ('in_progress', 'completed', 'abandoned');

create type sales.request_status as enum (
  'draft', 'submitted', 'awaiting_payment', 'paid', 'in_review',
  'scoped', 'proposal_sent', 'accepted', 'declined', 'cancelled',
  'refunded', 'completed'
);

create type sales.payment_status as enum (
  'requires_payment_method', 'requires_action', 'processing',
  'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded'
);

create type sales.subscription_status as enum (
  'incomplete', 'trialing', 'active', 'past_due', 'paused', 'cancelled', 'unpaid'
);

-- ---- Shared helpers ----------------------------------------

create or replace function sales.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function sales.set_updated_at is 'BEFORE UPDATE trigger: stamps updated_at.';

-- ---- Staff (admin dashboard access) ------------------------

create table sales.staff (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  role        sales.staff_role not null default 'admin',
  full_name   text,
  email       text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table sales.staff is 'Who may use the admin dashboard. Membership here is the authorisation source of truth.';

create index staff_active_idx on sales.staff (is_active) where is_active;

create trigger staff_set_updated_at
  before update on sales.staff
  for each row execute function sales.set_updated_at();

-- Security-definer so RLS policies can call these without recursing
-- into sales.staff's own policies.
create or replace function sales.is_staff()
returns boolean
language sql
stable
security definer
set search_path = sales, pg_temp
as $$
  select exists (
    select 1 from sales.staff where user_id = auth.uid() and is_active
  );
$$;

create or replace function sales.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = sales, pg_temp
as $$
  select exists (
    select 1 from sales.staff
    where user_id = auth.uid() and is_active and role = 'super_admin'
  );
$$;

comment on function sales.is_staff is 'True when the caller is an active staff member.';
comment on function sales.is_super_admin is 'True when the caller is an active super admin.';

-- ---- Settings ----------------------------------------------

create table sales.settings (
  key         text primary key,
  value       jsonb not null,
  label       text,
  description text,
  is_public   boolean not null default false,
  updated_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table sales.settings is 'Editable site configuration: calendar link, booking link, support email, feature toggles.';
comment on column sales.settings.is_public is 'Public settings may be read by anonymous visitors; private ones only by staff.';

create index settings_public_idx on sales.settings (is_public) where is_public;

create trigger settings_set_updated_at
  before update on sales.settings
  for each row execute function sales.set_updated_at();

-- ---- Audit log ---------------------------------------------

create table sales.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references auth.users (id) on delete set null,
  actor_email text,
  action      text not null,
  entity      text not null,
  entity_id   text,
  before      jsonb,
  after       jsonb,
  ip          inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);

comment on table sales.audit_log is 'Every write a staff member makes through the dashboard.';

create index audit_log_created_idx on sales.audit_log (created_at desc);
create index audit_log_entity_idx on sales.audit_log (entity, entity_id);
create index audit_log_actor_idx on sales.audit_log (actor_id, created_at desc);
