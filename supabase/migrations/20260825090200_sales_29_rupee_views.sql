-- ============================================================
-- Every view, rebuilt for two currencies.
--
-- One rule throughout: a target counts money in its own currency
-- and nothing else. An INR target sums the rupee figures; a USD
-- target sums the dollar ones. Nothing is converted, so a number
-- on screen is always a number somebody actually typed or was
-- actually paid.
--
-- The cost of that honesty is that money can be missing — a
-- Stripe payment that hasn't settled has no rupee figure yet. So
-- every view that counts in rupees also reports what it could not
-- count. A total with a visible hole beats a total that quietly
-- guessed.
-- ============================================================

drop view if exists sales.target_economics;
drop view if exists sales.activity_economics;
drop view if exists sales.daily_money;
drop view if exists sales.spend_ledger;
drop view if exists sales.revenue_ledger;
drop view if exists sales.unattributed_revenue;
drop view if exists sales.target_progress;

-- ---- The ledgers -------------------------------------------

create view sales.revenue_ledger
with (security_invoker = true) as
select
  p.id,
  'checkout'::text                                   as stream,
  coalesce(o.slug, 'checkout')                       as source_key,
  coalesce(o.name, 'Checkout')                       as source_label,
  coalesce(c.company_name, c.full_name, c.email)     as client,
  (p.amount - p.amount_refunded)                     as amount_usd,
  p.amount_inr,
  p.settled_on,
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
  m.amount_usd,
  m.amount_inr,
  null::date,
  m.earned_on,
  m.created_at
from sales.manual_revenue m;

comment on view sales.revenue_ledger is
  'Every pound of revenue as one row, in both currencies. amount_inr is null where the rupees are not known yet.';

create view sales.expense_ledger
with (security_invoker = true) as
select
  e.id,
  e.spent_on,
  e.amount_usd,
  e.amount_inr,
  e.description,
  e.paid_to,
  c.slug            as category_key,
  c.label           as category_label,
  c.is_acquisition,
  a.id              as activity_type_id,
  a.label           as activity_label,
  e.created_by,
  e.created_at
from sales.expenses e
join sales.spend_categories c on c.id = e.category_id
left join sales.activity_types a on a.id = e.activity_type_id;

comment on view sales.expense_ledger is
  'Every cost with its category and, for salaries, who was paid.';

-- ---- Target progress ---------------------------------------

create view sales.target_progress
with (security_invoker = true) as
with base as (
  select
    t.id,
    t.name,
    t.level,
    t.starts_on,
    t.ends_on,
    t.revenue_target,
    t.requests_target,
    t.currency,
    t.notes,
    t.is_locked,
    t.created_by,
    t.created_at,

    -- Counted in the target's own currency. Never converted.
    case when t.currency = 'INR'
      then coalesce(stripe.inr, 0)
      else coalesce(stripe.usd, 0)
    end                                                       as revenue_stripe,
    case when t.currency = 'INR'
      then coalesce(manual.inr, 0)
      else coalesce(manual.usd, 0)
    end                                                       as revenue_manual,

    -- What the total could not include, and what it is worth in
    -- the currency it does have, so the hole has a size.
    case when t.currency = 'INR'
      then coalesce(stripe.missing_rows, 0) + coalesce(manual.missing_rows, 0)
      else 0
    end                                                       as unconverted_rows,
    case when t.currency = 'INR'
      then coalesce(stripe.missing_usd, 0) + coalesce(manual.missing_usd, 0)
      else 0
    end                                                       as unconverted_usd,

    (t.ends_on - t.starts_on) + 1                             as days_total,
    least(
      (t.ends_on - t.starts_on) + 1,
      greatest(0, (current_date - t.starts_on) + 1)
    )                                                         as days_elapsed,
    case
      when current_date < t.starts_on then null
      when current_date > t.ends_on   then 0
      else (t.ends_on - current_date)
    end                                                       as days_left,
    case
      when current_date < t.starts_on then (t.ends_on - t.starts_on) + 1
      when current_date > t.ends_on   then 0
      else (t.ends_on - current_date) + 1
    end                                                       as days_remaining,
    case
      when current_date < t.starts_on then 'upcoming'
      when current_date > t.ends_on   then 'closed'
      else 'active'
    end                                                       as status,

    coalesce(manual.entries, 0)                               as manual_entries,
    coalesce(requests.count, 0)                               as requests_actual

  from sales.revenue_targets t

  left join lateral (
    select
      sum(p.amount - p.amount_refunded)                                     as usd,
      sum(p.amount_inr)                                                     as inr,
      count(*) filter (where p.amount_inr is null)                          as missing_rows,
      sum(p.amount - p.amount_refunded) filter (where p.amount_inr is null) as missing_usd
    from sales.payments p
    where p.status = 'succeeded'
      and p.succeeded_at is not null
      and (p.succeeded_at at time zone 'UTC')::date between t.starts_on and t.ends_on
  ) stripe on true

  left join lateral (
    select
      sum(m.amount_usd)                                     as usd,
      sum(m.amount_inr)                                     as inr,
      count(*)                                              as entries,
      count(*) filter (where m.amount_inr is null)          as missing_rows,
      sum(m.amount_usd) filter (where m.amount_inr is null) as missing_usd
    from sales.manual_revenue m
    where m.earned_on between t.starts_on and t.ends_on
  ) manual on true

  left join lateral (
    select count(*) as count
    from sales.requests r
    where (r.created_at at time zone 'UTC')::date between t.starts_on and t.ends_on
  ) requests on true
)
select
  base.*,
  revenue_stripe + revenue_manual                                          as revenue_achieved,
  greatest(0, revenue_target - (revenue_stripe + revenue_manual))          as revenue_remaining,
  round((revenue_stripe + revenue_manual)::numeric * 100 / revenue_target)::integer
                                                                           as percent_complete,
  round(revenue_target::numeric * days_elapsed / days_total)::bigint       as expected_by_today,
  case
    when (revenue_stripe + revenue_manual) >= revenue_target then 0
    when days_remaining <= 0                                 then 0
    else ceil((revenue_target - (revenue_stripe + revenue_manual))::numeric / days_remaining)::bigint
  end                                                                      as required_per_day,
  case
    when (revenue_stripe + revenue_manual) >= revenue_target then 'done'
    when status = 'upcoming'                                 then 'upcoming'
    when status = 'closed'                                   then 'missed'
    when (revenue_stripe + revenue_manual) >= round(revenue_target::numeric * days_elapsed / days_total) then 'on_track'
    when (revenue_stripe + revenue_manual) >= round(revenue_target::numeric * days_elapsed / days_total) * 0.9 then 'at_risk'
    else 'behind'
  end                                                                      as pace
from base;

comment on view sales.target_progress is
  'Target versus achieved, counted in the target''s own currency. unconverted_rows says how much is missing because its rupee figure is not known yet.';

-- ---- Revenue no target covers ------------------------------

create view sales.unattributed_revenue
with (security_invoker = true) as
select
  coalesce((
    select sum(p.amount - p.amount_refunded)
    from sales.payments p
    where p.status = 'succeeded' and p.succeeded_at is not null
      and not exists (
        select 1 from sales.revenue_targets t
        where t.level = 'sprint'
          and (p.succeeded_at at time zone 'UTC')::date between t.starts_on and t.ends_on
      )
  ), 0) as revenue_stripe,
  coalesce((
    select sum(m.amount_usd)
    from sales.manual_revenue m
    where not exists (
      select 1 from sales.revenue_targets t
      where t.level = 'sprint'
        and m.earned_on between t.starts_on and t.ends_on
    )
  ), 0) as revenue_manual;

comment on view sales.unattributed_revenue is
  'Revenue outside every SPRINT window. The annual target covers the whole year, so measuring against it would always be zero.';

-- ---- What a period earned against what it cost -------------

create view sales.target_economics
with (security_invoker = true) as
select
  t.id                                        as revenue_target_id,
  t.name,
  t.level,
  t.starts_on,
  t.ends_on,
  tp.status,
  tp.currency,
  tp.revenue_target,
  tp.revenue_achieved,
  tp.percent_complete,
  coalesce(sp.total, 0)                       as spend_total,
  coalesce(sp.acquisition, 0)                 as spend_acquisition,
  coalesce(sp.unconverted_rows, 0)            as spend_unconverted_rows,
  tp.revenue_achieved - coalesce(sp.total, 0) as net,
  case
    when coalesce(sp.total, 0) = 0 then null
    else round(tp.revenue_achieved::numeric / sp.total, 2)
  end                                         as return_multiple,
  coalesce(clients.n, 0)                      as paying_clients,
  case
    when coalesce(clients.n, 0) = 0 then null
    else (coalesce(sp.acquisition, 0) / clients.n)::bigint
  end                                         as cost_per_client,
  coalesce(leads.n, 0)                        as new_contacts,
  case
    when coalesce(leads.n, 0) = 0 then null
    else (coalesce(sp.acquisition, 0) / leads.n)::bigint
  end                                         as cost_per_contact
from sales.revenue_targets t
join sales.target_progress tp on tp.id = t.id

-- Spend counted in the same currency as the target it sits under,
-- so net is a subtraction of like from like.
left join lateral (
  select
    sum(case when t.currency = 'INR' then e.amount_inr else e.amount_usd end)  as total,
    sum(case when t.currency = 'INR' then e.amount_inr else e.amount_usd end)
      filter (where c.is_acquisition)                                          as acquisition,
    count(*) filter (
      where (t.currency = 'INR' and e.amount_inr is null)
         or (t.currency = 'USD' and e.amount_usd is null)
    )                                                                          as unconverted_rows
  from sales.expenses e
  join sales.spend_categories c on c.id = e.category_id
  where e.spent_on between t.starts_on and t.ends_on
) sp on true

left join lateral (
  select count(*) as n from (
    select distinct coalesce(c.company_name, c.full_name, c.email) as who
    from sales.payments p
    join sales.customers c on c.id = p.customer_id
    where p.status = 'succeeded' and p.succeeded_at is not null
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
  'Revenue beside what it cost, both in the target''s currency: net, return multiple, cost per client.';

-- ---- Cost per bid ------------------------------------------

create view sales.activity_economics
with (security_invoker = true) as
select
  ap.revenue_target_id,
  ap.activity_type_id,
  ap.label,
  ap.target_count,
  ap.achieved,
  coalesce(sp.inr, 0) as spend_inr,
  coalesce(sp.usd, 0) as spend_usd,
  case
    when ap.achieved = 0 then null
    else round(coalesce(sp.inr, 0)::numeric / ap.achieved, 2)
  end                 as cost_per_unit_inr
from sales.activity_progress ap
left join lateral (
  select sum(e.amount_inr) as inr, sum(e.amount_usd) as usd
  from sales.expenses e
  where e.activity_type_id = ap.activity_type_id
    and e.spent_on between ap.starts_on and ap.ends_on
) sp on true;

comment on view sales.activity_economics is
  'Spend tagged to a lead measure, divided by what it bought. Cost per bid, in rupees.';

-- ---- The trend line ----------------------------------------

create view sales.daily_money
with (security_invoker = true) as
select
  d::date as day,
  coalesce((
    select sum(p.amount_inr) from sales.payments p
    where p.status = 'succeeded' and (p.succeeded_at at time zone 'UTC')::date = d::date
  ), 0)::bigint as revenue_checkout,
  coalesce((
    select sum(m.amount_inr) from sales.manual_revenue m where m.earned_on = d::date
  ), 0)::bigint as revenue_manual,
  coalesce((
    select sum(p.amount_inr) from sales.payments p
    where p.status = 'succeeded' and (p.succeeded_at at time zone 'UTC')::date = d::date
  ), 0)::bigint
  + coalesce((
    select sum(m.amount_inr) from sales.manual_revenue m where m.earned_on = d::date
  ), 0)::bigint as revenue,
  coalesce((
    select sum(e.amount_inr) from sales.expenses e where e.spent_on = d::date
  ), 0)::bigint as spend
from generate_series(
  date_trunc('day', now()) - interval '179 days',
  date_trunc('day', now()),
  interval '1 day'
) as d;

comment on view sales.daily_money is
  'Six months of rupees at daily grain, for the charts. Anything without a rupee figure is simply absent — see target_progress.unconverted_rows.';

grant select on
  sales.revenue_ledger,
  sales.expense_ledger,
  sales.target_progress,
  sales.unattributed_revenue,
  sales.target_economics,
  sales.activity_economics,
  sales.daily_money
to service_role;
