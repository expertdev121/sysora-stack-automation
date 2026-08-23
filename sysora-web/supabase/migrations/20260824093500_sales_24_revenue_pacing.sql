-- ============================================================
-- Give the lag measure the same pacing vocabulary as the lead
-- measures.
--
-- The scoreboard puts revenue and activity side by side and asks
-- one question of both: are we winning? If "behind" were computed
-- in SQL for activities and in TypeScript for revenue, the two
-- halves of the same sentence would drift apart the first time
-- somebody adjusted the threshold. One rule, stated twice in the
-- same language, over two different tables.
--
-- Dropped and recreated rather than replaced: the new columns sit
-- among the existing ones, and CREATE OR REPLACE cannot reorder.
-- ============================================================

drop view if exists sales.target_progress;

create view sales.target_progress
with (security_invoker = true) as
with base as (
  select
    t.id,
    t.name,
    t.starts_on,
    t.ends_on,
    t.revenue_target,
    t.requests_target,
    t.currency,
    t.notes,
    t.created_by,
    t.created_at,

    -- Checkout revenue. The UTC cast is explicit so a payment near
    -- midnight always lands on the same calendar day.
    coalesce(stripe.amount, 0)                              as revenue_stripe,
    coalesce(manual.amount, 0)                              as revenue_manual,
    coalesce(stripe.amount, 0) + coalesce(manual.amount, 0) as revenue_achieved,

    (t.ends_on - t.starts_on) + 1                           as days_total,
    least(
      (t.ends_on - t.starts_on) + 1,
      greatest(0, (current_date - t.starts_on) + 1)
    )                                                       as days_elapsed,

    case
      when current_date < t.starts_on then null
      when current_date > t.ends_on   then 0
      else (t.ends_on - current_date)
    end                                                     as days_left,

    -- Days still available, today included. Never below one while the
    -- window is open, because days_left is zero on the final day and
    -- dividing by it would fail exactly when the number matters most.
    case
      when current_date < t.starts_on then (t.ends_on - t.starts_on) + 1
      when current_date > t.ends_on   then 0
      else (t.ends_on - current_date) + 1
    end                                                     as days_remaining,

    case
      when current_date < t.starts_on then 'upcoming'
      when current_date > t.ends_on   then 'closed'
      else 'active'
    end                                                     as status,

    coalesce(manual.entries, 0)                             as manual_entries,
    coalesce(requests.count, 0)                             as requests_actual

  from sales.revenue_targets t

  left join lateral (
    select sum(p.amount - p.amount_refunded) as amount
    from sales.payments p
    where p.status = 'succeeded'
      and p.succeeded_at is not null
      and (p.succeeded_at at time zone 'UTC')::date between t.starts_on and t.ends_on
  ) stripe on true

  left join lateral (
    select sum(m.amount) as amount, count(*) as entries
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
  greatest(0, revenue_target - revenue_achieved)                          as revenue_remaining,
  round(revenue_achieved::numeric * 100 / revenue_target)::integer        as percent_complete,
  round(revenue_target::numeric * days_elapsed / days_total)::integer     as expected_by_today,
  case
    when revenue_achieved >= revenue_target then 0
    when days_remaining <= 0                then 0
    else ceil((revenue_target - revenue_achieved)::numeric / days_remaining)::integer
  end                                                                     as required_per_day,
  case
    when revenue_achieved >= revenue_target then 'done'
    when status = 'upcoming'                then 'upcoming'
    when status = 'closed'                  then 'missed'
    when revenue_achieved >= round(revenue_target::numeric * days_elapsed / days_total) then 'on_track'
    when revenue_achieved >= round(revenue_target::numeric * days_elapsed / days_total) * 0.9 then 'at_risk'
    else 'behind'
  end                                                                     as pace
from base;

comment on view sales.target_progress is
  'Target versus achieved. revenue_achieved = checkout + manual, which cannot double-count because the two come from different tables. Pacing columns match sales.activity_progress exactly.';

grant select on sales.target_progress to service_role;
