-- ============================================================
-- Where the money came from, what it cost to get, and what that
-- leaves.
--
-- Two ledgers and two economics views. The ledgers are per-row on
-- purpose: "where is revenue coming from" is a question with a
-- different answer depending on how you slice it, and a view that
-- pre-aggregated one way would only force the next question to be
-- answered somewhere else.
-- ============================================================

create view sales.revenue_ledger
with (security_invoker = true) as
select
  p.id,
  'checkout'::text                                   as stream,
  coalesce(o.slug, 'checkout')                       as source_key,
  coalesce(o.name, 'Checkout')                       as source_label,
  coalesce(c.company_name, c.full_name, c.email)     as client,
  (p.amount - p.amount_refunded)                     as amount,
  p.currency,
  (p.succeeded_at at time zone 'UTC')::date          as earned_on,
  p.created_at
from sales.payments p
join sales.customers c on c.id = p.customer_id
left join sales.offers o on o.id = p.offer_id
where p.status = 'succeeded'
  and p.succeeded_at is not null
  and (p.amount - p.amount_refunded) > 0

union all

select
  m.id,
  'manual'::text,
  m.source::text,
  case m.source
    when 'upwork'     then 'Upwork'
    when 'off_source' then 'Off source'
    else 'Other'
  end,
  m.client_name,
  m.amount,
  m.currency,
  m.earned_on,
  m.created_at
from sales.manual_revenue m;

comment on view sales.revenue_ledger is
  'Every pound of revenue as one row, whichever door it came through. Slice by stream, source or client.';

create view sales.spend_ledger
with (security_invoker = true) as
select
  s.id,
  s.spent_on,
  s.amount,
  s.currency,
  s.description,
  c.slug            as category_key,
  c.label           as category_label,
  c.is_acquisition,
  a.id              as activity_type_id,
  a.label           as activity_label,
  s.created_by,
  s.created_at
from sales.acquisition_spend s
join sales.spend_categories c on c.id = s.category_id
left join sales.activity_types a on a.id = s.activity_type_id;

comment on view sales.spend_ledger is
  'Spend with its category and, where tagged, the lead measure it bought.';

-- ---- What a period actually earned -------------------------

create view sales.target_economics
with (security_invoker = true) as
select
  t.id                                        as revenue_target_id,
  t.name,
  t.starts_on,
  t.ends_on,
  tp.status,
  tp.revenue_target,
  tp.revenue_achieved,
  tp.percent_complete,
  coalesce(sp.total, 0)                       as spend_total,
  coalesce(sp.acquisition, 0)                 as spend_acquisition,
  tp.revenue_achieved - coalesce(sp.total, 0) as net,

  -- Null rather than zero when nothing was spent: "we made 4x" and
  -- "we spent nothing" are different statements, and a zero here
  -- would read as the first.
  case
    when coalesce(sp.total, 0) = 0 then null
    else round(tp.revenue_achieved::numeric / sp.total, 2)
  end                                         as return_multiple,

  coalesce(clients.n, 0)                      as paying_clients,
  case
    when coalesce(clients.n, 0) = 0 then null
    else (coalesce(sp.acquisition, 0) / clients.n)::integer
  end                                         as cost_per_client,

  coalesce(leads.n, 0)                        as new_contacts,
  case
    when coalesce(leads.n, 0) = 0 then null
    else (coalesce(sp.acquisition, 0) / leads.n)::integer
  end                                         as cost_per_contact

from sales.revenue_targets t
join sales.target_progress tp on tp.id = t.id

left join lateral (
  select
    sum(s.amount)                                                  as total,
    sum(s.amount) filter (where c.is_acquisition)                  as acquisition
  from sales.acquisition_spend s
  join sales.spend_categories c on c.id = s.category_id
  where s.spent_on between t.starts_on and t.ends_on
) sp on true

-- Distinct clients who paid inside the window, counting a checkout
-- customer and a hand-entered client name as one each.
left join lateral (
  select count(*) as n from (
    select distinct coalesce(c.company_name, c.full_name, c.email) as who
    from sales.payments p
    join sales.customers c on c.id = p.customer_id
    where p.status = 'succeeded'
      and p.succeeded_at is not null
      and (p.succeeded_at at time zone 'UTC')::date between t.starts_on and t.ends_on
    union
    select distinct m.client_name
    from sales.manual_revenue m
    where m.earned_on between t.starts_on and t.ends_on
  ) everyone
) clients on true

left join lateral (
  select count(*) as n
  from sales.customers c
  where (c.created_at at time zone 'UTC')::date between t.starts_on and t.ends_on
) leads on true;

comment on view sales.target_economics is
  'Revenue against what it cost to win: net, return multiple, and cost per client for one target window.';

-- ---- What each lead measure costs --------------------------

create view sales.activity_economics
with (security_invoker = true) as
select
  ap.revenue_target_id,
  ap.activity_type_id,
  ap.label,
  ap.target_count,
  ap.achieved,
  coalesce(sp.total, 0) as spend,
  case
    when ap.achieved = 0 then null
    else round(coalesce(sp.total, 0)::numeric / ap.achieved, 2)
  end                   as cost_per_unit
from sales.activity_progress ap
left join lateral (
  select sum(s.amount) as total
  from sales.acquisition_spend s
  where s.activity_type_id = ap.activity_type_id
    and s.spent_on between ap.starts_on and ap.ends_on
) sp on true;

comment on view sales.activity_economics is
  'Spend tagged to a lead measure, divided by what it bought. Cost per bid, in other words.';

-- ---- The trend line ----------------------------------------
--
-- Six months at daily grain. Separate from daily_metrics, which
-- counts funnel events; this one is only about money and is the
-- source for the charts.

create view sales.daily_money
with (security_invoker = true) as
select
  d::date as day,
  coalesce((
    select sum(p.amount - p.amount_refunded) from sales.payments p
    where p.status = 'succeeded'
      and (p.succeeded_at at time zone 'UTC')::date = d::date
  ), 0)::integer as revenue_checkout,
  coalesce((
    select sum(m.amount) from sales.manual_revenue m where m.earned_on = d::date
  ), 0)::integer as revenue_manual,
  coalesce((
    select sum(p.amount - p.amount_refunded) from sales.payments p
    where p.status = 'succeeded'
      and (p.succeeded_at at time zone 'UTC')::date = d::date
  ), 0)::integer
  + coalesce((
    select sum(m.amount) from sales.manual_revenue m where m.earned_on = d::date
  ), 0)::integer as revenue,
  coalesce((
    select sum(s.amount) from sales.acquisition_spend s where s.spent_on = d::date
  ), 0)::integer as spend
from generate_series(
  date_trunc('day', now()) - interval '179 days',
  date_trunc('day', now()),
  interval '1 day'
) as d;

comment on view sales.daily_money is
  'Six months of revenue and spend at daily grain, for the charts.';

grant select on
  sales.revenue_ledger,
  sales.spend_ledger,
  sales.target_economics,
  sales.activity_economics,
  sales.daily_money
to service_role;
