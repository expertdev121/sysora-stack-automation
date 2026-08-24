-- ============================================================
-- Revenue from clients who never touch the checkout — Upwork and
-- other outside sources — recorded by hand.
--
-- Attribution works exactly like a Stripe payment: by date. There
-- is no target_id, so moving a target's window re-attributes the
-- money automatically and an entry is never orphaned.
-- ============================================================

create type sales.revenue_source as enum ('upwork', 'off_source', 'other');

create table sales.manual_revenue (
  id           uuid primary key default gen_random_uuid(),
  client_name  text not null,
  source       sales.revenue_source not null default 'other',
  description  text,
  amount       integer not null check (amount > 0),
  currency     char(3) not null default 'USD',
  -- The date the money counts for. Defaults to today; editable, so
  -- backdating an entry moves it into the right target.
  earned_on    date not null default current_date,
  created_by   uuid references sales.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint manual_revenue_client_name_present check (length(trim(client_name)) > 0),
  -- Summing mixed currencies produces a meaningless number, so the
  -- schema refuses them rather than quietly adding them up.
  constraint manual_revenue_currency_supported check (currency = 'USD')
);

comment on table sales.manual_revenue is
  'Revenue from outside the checkout. Counts toward a target by earned_on.';

create index manual_revenue_earned_idx on sales.manual_revenue (earned_on desc);
create index manual_revenue_source_idx on sales.manual_revenue (source);
create index manual_revenue_client_idx on sales.manual_revenue (client_name);

create trigger manual_revenue_set_updated_at
  before update on sales.manual_revenue
  for each row execute function sales.set_updated_at();

alter table sales.manual_revenue enable row level security;
revoke all on sales.manual_revenue from anon, authenticated;
grant all on sales.manual_revenue to service_role;
