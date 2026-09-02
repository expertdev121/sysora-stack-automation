-- What a month costs: the commitments due in it, and what was actually paid.

-- Every charge a recurring cost is due to make, month by month, from when it
-- started until it ended (or twelve months out, for the ones still running).
--
-- A yearly plan lands in one month rather than being smeared across twelve.
-- That is the cash question — "what leaves my account in September" — and it
-- is the one you ask when paying bills. The smoothed figure is a different
-- question and gets its own view below.
create or replace view sales.recurring_cost_charges
with (security_invoker = true) as
with horizon as (
  select
    r.*,
    date_trunc('month', r.started_on)::date as first_month,
    date_trunc(
      'month',
      least(coalesce(r.ended_on, current_date + interval '12 months'),
            current_date + interval '12 months')
    )::date as last_month
  from sales.recurring_costs r
),
months as (
  select h.id, generate_series(h.first_month, h.last_month, interval '1 month')::date as month
  from horizon h
)
select
  h.id                as recurring_cost_id,
  h.name,
  h.vendor,
  h.category_id,
  h.cadence::text     as cadence,
  h.amount_inr,
  h.amount_usd,
  m.month,
  (m.month + (h.billing_day - 1) * interval '1 day')::date as due_on
from months m
join horizon h on h.id = m.id
where
  case h.cadence
    when 'monthly'   then true
    when 'quarterly' then (extract(month from m.month)::int - extract(month from h.first_month)::int) % 3 = 0
    when 'yearly'    then extract(month from m.month) = extract(month from h.first_month)
  end
  and (m.month + (h.billing_day - 1) * interval '1 day')::date >= h.started_on
  and (h.ended_on is null
       or (m.month + (h.billing_day - 1) * interval '1 day')::date <= h.ended_on);

-- One row per month: what was due, what was recorded, and the gap.
create or replace view sales.monthly_costs
with (security_invoker = true) as
with months as (
  select distinct month from sales.recurring_cost_charges
  union
  select distinct date_trunc('month', spent_on)::date from sales.expenses
),
due as (
  select c.month,
         count(*)                                          as commitments_due,
         coalesce(sum(c.amount_inr), 0)                    as committed_inr,
         count(*) filter (where c.amount_inr is null)      as committed_without_rupees,
         coalesce(sum(c.amount_usd), 0)                    as committed_usd
  from sales.recurring_cost_charges c
  group by c.month
),
paid as (
  select date_trunc('month', e.spent_on)::date            as month,
         count(*)                                          as expense_rows,
         coalesce(sum(e.amount_inr), 0)                    as spent_inr,
         count(*) filter (where e.amount_inr is null)      as spent_without_rupees,
         coalesce(sum(e.amount_inr) filter (where e.recurring_cost_id is not null), 0)
                                                           as spent_on_recurring_inr,
         count(distinct e.recurring_cost_id) filter (where e.recurring_cost_id is not null)
                                                           as commitments_paid
  from sales.expenses e
  group by 1
)
select
  m.month,
  coalesce(d.commitments_due, 0)             as commitments_due,
  coalesce(d.committed_inr, 0)               as committed_inr,
  coalesce(d.committed_usd, 0)               as committed_usd,
  coalesce(d.committed_without_rupees, 0)    as committed_without_rupees,
  coalesce(p.commitments_paid, 0)            as commitments_paid,
  coalesce(d.commitments_due, 0) - coalesce(p.commitments_paid, 0) as commitments_unpaid,
  coalesce(p.expense_rows, 0)                as expense_rows,
  coalesce(p.spent_inr, 0)                   as spent_inr,
  coalesce(p.spent_on_recurring_inr, 0)      as spent_on_recurring_inr,
  coalesce(p.spent_inr, 0) - coalesce(p.spent_on_recurring_inr, 0) as spent_one_off_inr,
  coalesce(p.spent_without_rupees, 0)        as spent_without_rupees
from months m
left join due  d on d.month = m.month
left join paid p on p.month = m.month;

-- The run rate: what the commitments average per month, with yearly and
-- quarterly plans spread rather than lumped. The planning number, as opposed
-- to the paying-bills number above.
create or replace view sales.recurring_run_rate
with (security_invoker = true) as
select
  count(*) as running,
  coalesce(sum(
    case cadence
      when 'monthly'   then amount_inr
      when 'quarterly' then amount_inr / 3
      when 'yearly'    then amount_inr / 12
    end
  ), 0)::bigint as monthly_inr,
  coalesce(sum(
    case cadence
      when 'monthly'   then amount_usd
      when 'quarterly' then amount_usd / 3
      when 'yearly'    then amount_usd / 12
    end
  ), 0)::bigint as monthly_usd,
  count(*) filter (where amount_inr is null) as without_rupees
from sales.recurring_costs
where ended_on is null;

grant select on sales.recurring_cost_charges, sales.monthly_costs, sales.recurring_run_rate
  to service_role;
