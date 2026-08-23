-- ============================================================
-- Fold manual revenue into the headline daily figures, so the
-- overview stat and a target's achieved number agree for the same
-- window instead of quietly disagreeing.
--
-- Dropped and recreated rather than replaced: the new columns sit
-- before revenue_minor, and CREATE OR REPLACE cannot reorder them.
-- ============================================================

drop view if exists sales.daily_metrics;

create view sales.daily_metrics
with (security_invoker = true) as
select
  d::date as day,
  (select count(*) from sales.customers c
    where c.created_at >= d and c.created_at < d + interval '1 day') as new_customers,
  (select count(*) from sales.requests r
    where r.created_at >= d and r.created_at < d + interval '1 day') as requests,
  (select count(*) from sales.survey_responses s
    where s.created_at >= d and s.created_at < d + interval '1 day') as survey_starts,
  (select count(*) from sales.survey_responses s
    where s.completed_at >= d and s.completed_at < d + interval '1 day') as survey_completions,
  (select count(*) from sales.payments p
    where p.succeeded_at >= d and p.succeeded_at < d + interval '1 day') as payments,

  coalesce((select sum(p.amount - p.amount_refunded) from sales.payments p
    where p.succeeded_at >= d and p.succeeded_at < d + interval '1 day'), 0) as revenue_stripe,

  coalesce((select sum(m.amount) from sales.manual_revenue m
    where m.earned_on = d::date), 0) as revenue_manual,

  -- What the dashboard shows: both sources, no double-counting.
  coalesce((select sum(p.amount - p.amount_refunded) from sales.payments p
    where p.succeeded_at >= d and p.succeeded_at < d + interval '1 day'), 0)
  + coalesce((select sum(m.amount) from sales.manual_revenue m
    where m.earned_on = d::date), 0) as revenue_minor

from generate_series(
  date_trunc('day', now()) - interval '89 days',
  date_trunc('day', now()),
  interval '1 day'
) as d;

comment on view sales.daily_metrics is
  'Last 90 days. revenue_minor is checkout plus manual, matching what targets count.';

grant select on sales.daily_metrics to service_role;
