-- What a connect costs, where they went, and how the budget is burning.

-- The blended rate and the running balance.
--
-- One row, always. Rate is total cash over total connects acquired, free
-- grants included — because a free connect genuinely lowers what the average
-- one cost you, and pretending otherwise overstates acquisition cost.
create or replace view sales.connect_position
with (security_invoker = true) as
with bought as (
  select
    coalesce(sum(connects), 0)                                   as connects_acquired,
    coalesce(sum(connects) filter (where is_free), 0)             as connects_free,
    coalesce(sum(amount_inr), 0)                                  as paid_inr,
    coalesce(sum(amount_usd), 0) + coalesce(sum(tax_usd), 0)      as paid_usd,
    coalesce(sum(tax_usd), 0)                                     as tax_usd
  from sales.connect_purchases
),
used as (
  select
    coalesce(sum(connects_spent), 0)    as connects_spent,
    coalesce(sum(connects_refunded), 0) as connects_refunded,
    count(*)                            as proposals
  from sales.proposals
)
select
  b.connects_acquired,
  b.connects_free,
  b.connects_acquired - b.connects_free as connects_bought,
  b.paid_inr,
  b.paid_usd,
  b.tax_usd,
  u.connects_spent,
  u.connects_refunded,
  u.proposals,
  -- Refunded connects return to the balance.
  b.connects_acquired - u.connects_spent + u.connects_refunded as connects_left,
  -- Paise per connect. Null rather than zero when nothing has been bought —
  -- "no rate yet" and "free" are different facts.
  case when b.connects_acquired > 0
       then b.paid_inr::numeric / b.connects_acquired
  end as rate_inr,
  case when b.connects_acquired > 0
       then b.paid_usd::numeric / b.connects_acquired
  end as rate_usd
from bought b cross join used u;

-- A day of bidding: proposals, connects, and what those connects cost.
create or replace view sales.acquisition_daily
with (security_invoker = true) as
select
  p.submitted_on                                   as day,
  count(*)                                         as proposals,
  coalesce(sum(p.connects_spent), 0)               as connects_spent,
  coalesce(sum(p.connects_refunded), 0)            as connects_refunded,
  -- Net of refunds: a connect that came back was not spent.
  round((coalesce(sum(p.connects_spent), 0) - coalesce(sum(p.connects_refunded), 0))
        * coalesce((select rate_inr from sales.connect_position), 0))::bigint as connects_cost_inr,
  count(*) filter (where p.outcome = 'hired')      as won
from sales.proposals p
group by p.submitted_on;

-- Budget against actual, per target window.
--
-- Two things are spent winning work: connects, and everything filed under an
-- acquisition category (job boards, ads, outreach tools). Both count. Connects
-- are the half that moves daily as bids go out.
create or replace view sales.acquisition_progress
with (security_invoker = true) as
select
  t.id                as revenue_target_id,
  t.name,
  t.level::text       as level,
  t.starts_on,
  t.ends_on,
  t.currency,
  t.acquisition_budget,

  coalesce(c.connects_cost_inr, 0)  as connects_cost_inr,
  coalesce(c.connects_spent, 0)     as connects_spent,
  coalesce(c.proposals, 0)          as proposals,
  coalesce(c.won, 0)                as proposals_won,

  coalesce(e.other_inr, 0)          as other_acquisition_inr,
  coalesce(e.unconverted_rows, 0)   as other_rows_without_rupees,

  coalesce(c.connects_cost_inr, 0) + coalesce(e.other_inr, 0) as spent_inr,

  case when t.acquisition_budget is not null
       then greatest(t.acquisition_budget
                     - coalesce(c.connects_cost_inr, 0) - coalesce(e.other_inr, 0), 0)
  end as remaining_inr,

  case when t.acquisition_budget > 0
       then round(((coalesce(c.connects_cost_inr, 0) + coalesce(e.other_inr, 0))::numeric
                   / t.acquisition_budget) * 100)
  end as percent_used,

  -- Straight-line expectation, so "behind on spend" is answerable. Unlike a
  -- cost budget, underspending here usually means bids are not going out.
  case when t.acquisition_budget is not null and t.ends_on >= t.starts_on
       then round(t.acquisition_budget::numeric
                  * least(greatest((current_date - t.starts_on + 1), 0), (t.ends_on - t.starts_on + 1))
                  / (t.ends_on - t.starts_on + 1))
  end as expected_by_today_inr,

  -- Cost of one job won, in this window.
  case when coalesce(c.won, 0) > 0
       then round((coalesce(c.connects_cost_inr, 0) + coalesce(e.other_inr, 0))::numeric / c.won)
  end as cost_per_win_inr,

  case when coalesce(c.proposals, 0) > 0
       then round((coalesce(c.won, 0)::numeric / c.proposals) * 100, 1)
  end as win_rate_percent

from sales.revenue_targets t

left join lateral (
  select
    sum(d.connects_cost_inr)  as connects_cost_inr,
    sum(d.connects_spent)     as connects_spent,
    sum(d.proposals)          as proposals,
    sum(d.won)                as won
  from sales.acquisition_daily d
  where d.day between t.starts_on and t.ends_on
) c on true

left join lateral (
  select
    sum(x.amount_inr)                              as other_inr,
    count(*) filter (where x.amount_inr is null)   as unconverted_rows
  from sales.expenses x
  join sales.spend_categories sc on sc.id = x.category_id
  where sc.is_acquisition
    and x.spent_on between t.starts_on and t.ends_on
) e on true;

grant select on sales.connect_position, sales.acquisition_daily, sales.acquisition_progress
  to service_role;
