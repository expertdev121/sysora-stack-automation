-- ============================================================
-- Sales targets — a monthly number to aim at, and how we're doing
-- against it. Super admin territory: admins never see revenue.
-- ============================================================

create table sales.targets (
  id              uuid primary key default gen_random_uuid(),
  -- Always the first of the month; the unique index keeps one row per month.
  period_start    date not null,
  revenue_target  integer not null default 0 check (revenue_target >= 0),
  requests_target integer check (requests_target is null or requests_target >= 0),
  notes           text,
  created_by      uuid references sales.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint targets_period_is_month_start check (period_start = date_trunc('month', period_start)::date)
);

comment on table sales.targets is 'Monthly sales targets. revenue_target is in minor units, like every other amount.';

create unique index targets_period_key on sales.targets (period_start);
create index targets_recent_idx on sales.targets (period_start desc);

create trigger targets_set_updated_at
  before update on sales.targets
  for each row execute function sales.set_updated_at();

alter table sales.targets enable row level security;
revoke all on sales.targets from anon, authenticated;
grant all on sales.targets to service_role;

-- ---- Progress ----------------------------------------------

create view sales.target_progress
with (security_invoker = true) as
with months as (
  select date_trunc('month', d)::date as period_start
  from generate_series(
    date_trunc('month', now()) - interval '11 months',
    date_trunc('month', now()),
    interval '1 month'
  ) as d
)
select
  m.period_start,
  coalesce(t.revenue_target, 0)   as revenue_target,
  t.requests_target,
  t.notes,
  coalesce((
    select sum(p.amount - p.amount_refunded)
    from sales.payments p
    where p.status = 'succeeded'
      and p.succeeded_at >= m.period_start
      and p.succeeded_at < (m.period_start + interval '1 month')
  ), 0) as revenue_actual,
  (
    select count(*)
    from sales.requests r
    where r.created_at >= m.period_start
      and r.created_at < (m.period_start + interval '1 month')
  ) as requests_actual,
  (
    select count(*)
    from sales.payments p
    where p.status = 'succeeded'
      and p.succeeded_at >= m.period_start
      and p.succeeded_at < (m.period_start + interval '1 month')
  ) as payments_actual
from months m
left join sales.targets t on t.period_start = m.period_start
order by m.period_start desc;

comment on view sales.target_progress is 'Twelve months of target versus actual revenue, requests and payments.';

grant select on sales.target_progress to service_role;

-- Seed the current month so the page has something to edit.
insert into sales.targets (period_start, revenue_target, requests_target)
values (date_trunc('month', now())::date, 0, null)
on conflict (period_start) do nothing;
