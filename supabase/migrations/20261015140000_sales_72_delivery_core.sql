-- The delivery core: hours, work, tickets, and client logins.
--
-- The business sells prepaid hours and the terms promise a visible
-- ledger, but nothing recorded an hour anywhere. Everything below exists
-- to make that promise true and to let both dashboards read real data.
--
-- The balance is never stored. Hours granted and hours consumed are two
-- append-only tables and the balance is their difference, exposed as a
-- view. A stored balance is a number that drifts the first time an
-- insert fails halfway; a derived one cannot disagree with the ledger
-- the customer is looking at.

-- ---------------------------------------------------------------- enums

do $$ begin
  create type sales.work_kind as enum (
    'build', 'troubleshooting', 'configuration', 'cleanup',
    'data', 'call', 'meeting', 'documentation'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type sales.task_status as enum (
    'queued', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type sales.ticket_status as enum (
    'open', 'in_progress', 'waiting_on_client', 'resolved'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type sales.ticket_priority as enum ('normal', 'high', 'urgent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sales.build_stage as enum ('new', 'scoping', 'proposal_sent', 'approved');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sales.entitlement_source as enum ('pack', 'monthly', 'manual', 'goodwill');
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------- hours granted

create table if not exists sales.hour_entitlements (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references sales.customers(id) on delete cascade,
  -- The order that granted them. Null for a manual or goodwill grant.
  request_id uuid references sales.requests(id) on delete set null,
  subscription_id uuid references sales.subscriptions(id) on delete set null,
  hours numeric(8,2) not null check (hours > 0),
  /** Minor units per hour actually paid, which is what a refund is computed from. */
  rate_amount integer,
  currency char(3) not null default 'USD',
  source sales.entitlement_source not null,
  starts_at timestamptz not null default now(),
  /** One-time packs expire 60 days out; monthly cycles reset instead. */
  expires_at timestamptz,
  resets_at timestamptz,
  note text,
  created_by uuid references sales.users(id) on delete set null,
  created_at timestamptz not null default now(),
  -- A pack expires, a monthly cycle resets. Never both.
  constraint entitlement_window check (expires_at is null or resets_at is null)
);

comment on table sales.hour_entitlements is
  'Hours granted to a customer. Append-only; the balance view subtracts time_entries from this.';

create index if not exists hour_entitlements_customer_idx
  on sales.hour_entitlements (customer_id, starts_at desc);

-- ------------------------------------------------------------- the work

create table if not exists sales.tasks (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references sales.customers(id) on delete cascade,
  title text not null,
  detail text,
  status sales.task_status not null default 'queued',
  /** What we told the customer it would take, for estimate-vs-actual. */
  estimate_hours numeric(6,2) check (estimate_hours is null or estimate_hours > 0),
  assigned_to uuid references sales.users(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_customer_idx on sales.tasks (customer_id, created_at desc);
create index if not exists tasks_open_idx on sales.tasks (customer_id)
  where status not in ('done', 'cancelled');

-- ------------------------------------------------------ hours consumed

create table if not exists sales.time_entries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references sales.customers(id) on delete cascade,
  task_id uuid references sales.tasks(id) on delete set null,
  entry_date date not null default current_date,
  description text not null,
  kind sales.work_kind not null default 'build',
  /** Quarter-hour increments per the terms; the cap catches a typo'd 80. */
  hours numeric(6,2) not null check (hours > 0 and hours <= 24),
  /** Our own mistakes are logged but not billed, as the terms promise. */
  billable boolean not null default true,
  logged_by uuid references sales.users(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on column sales.time_entries.billable is
  'False for rework caused by us. Visible in the ledger, excluded from the balance.';

create index if not exists time_entries_customer_idx
  on sales.time_entries (customer_id, entry_date desc);
create index if not exists time_entries_task_idx on sales.time_entries (task_id);
/** The admin console's delivered-hours-per-day chart reads this. */
create index if not exists time_entries_date_idx on sales.time_entries (entry_date desc);

-- --------------------------------------------------------------- support

create table if not exists sales.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_seq bigint generated always as identity,
  reference text generated always as ('SUP-' || lpad(ticket_seq::text, 4, '0')) stored unique,
  customer_id uuid not null references sales.customers(id) on delete cascade,
  subject text not null,
  category text,
  priority sales.ticket_priority not null default 'normal',
  status sales.ticket_status not null default 'open',
  assigned_to uuid references sales.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tickets_open_idx on sales.support_tickets (created_at desc)
  where status <> 'resolved';
create index if not exists tickets_customer_idx
  on sales.support_tickets (customer_id, created_at desc);

create table if not exists sales.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references sales.support_tickets(id) on delete cascade,
  /** Who wrote it, so the portal can show both sides of the thread. */
  author_kind text not null check (author_kind in ('client', 'staff')),
  author_user_id uuid references sales.users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists ticket_messages_ticket_idx
  on sales.ticket_messages (ticket_id, created_at);

-- -------------------------------------------------- build request stage
--
-- Build requests already live in sales.requests with kind 'build_request'
-- — the estimate form files them there. They get a stage rather than a
-- table of their own, so the admin kanban and the existing form are the
-- same records instead of two lists that disagree.

alter table sales.requests
  add column if not exists build_stage sales.build_stage,
  add column if not exists budget_band text;

comment on column sales.requests.build_stage is
  'Kanban column for kind = build_request. Null for orders.';

create index if not exists requests_build_stage_idx
  on sales.requests (build_stage, created_at desc)
  where kind = 'build_request';

-- Existing estimates start at the left of the board rather than nowhere.
update sales.requests
   set build_stage = 'new'
 where kind = 'build_request' and build_stage is null;

-- ---------------------------------------------------------- client login
--
-- Reuses the staff auth stack — users, sessions, password_resets, the
-- lockout counters — rather than standing up a second one. A client row
-- is a user whose role is 'client' and which points at a customer.

-- The 'client' role value is added in sales_73, on its own: Postgres
-- refuses ALTER TYPE ... ADD VALUE from inside a DO block, and a new
-- enum value cannot be used in the transaction that adds it.

alter table sales.users
  add column if not exists customer_id uuid references sales.customers(id) on delete cascade;

create unique index if not exists users_customer_idx
  on sales.users (customer_id) where customer_id is not null;

-- ---------------------------------------------------------------- views

/**
 * The number both dashboards quote. Purchased minus billable used, with
 * the next expiry and reset alongside so the portal can say "resets
 * Nov 3" without a second query.
 */
create or replace view sales.customer_hour_balance as
select
  c.id as customer_id,
  coalesce(g.hours_purchased, 0)::numeric(10,2) as hours_purchased,
  coalesce(u.hours_used, 0)::numeric(10,2) as hours_used,
  (coalesce(g.hours_purchased, 0) - coalesce(u.hours_used, 0))::numeric(10,2) as hours_remaining,
  g.next_expiry,
  g.next_reset
from sales.customers c
left join (
  select customer_id,
         sum(hours) as hours_purchased,
         min(expires_at) filter (where expires_at > now()) as next_expiry,
         min(resets_at) filter (where resets_at > now()) as next_reset
  from sales.hour_entitlements
  group by customer_id
) g on g.customer_id = c.id
left join (
  select customer_id, sum(hours) as hours_used
  from sales.time_entries
  where billable
  group by customer_id
) u on u.customer_id = c.id;

comment on view sales.customer_hour_balance is
  'Derived balance. Never store this — the ledger is the source of truth.';

-- ------------------------------------------------------------- security
--
-- RLS on with no policies and service_role grants, matching every other
-- table in this schema: nothing is reachable from a browser, and every
-- read goes through the server with the service key.

alter table sales.hour_entitlements enable row level security;
alter table sales.tasks             enable row level security;
alter table sales.time_entries      enable row level security;
alter table sales.support_tickets   enable row level security;
alter table sales.ticket_messages   enable row level security;

grant select, insert, update, delete on
  sales.hour_entitlements, sales.tasks, sales.time_entries,
  sales.support_tickets, sales.ticket_messages
  to service_role, authenticated;

grant select on sales.customer_hour_balance to service_role, authenticated;
