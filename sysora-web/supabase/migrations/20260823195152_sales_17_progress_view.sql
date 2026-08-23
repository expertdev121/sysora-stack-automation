-- ============================================================
-- Target progress: two disjoint revenue sources, summed.
--
-- Nothing is snapshotted. Editing, deleting or backdating an entry
-- is reflected the next time the view is read, which is why a
-- closed target's number can still move — and should.
-- ============================================================

create view sales.target_progress
with (security_invoker = true) as
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
  coalesce(stripe.amount, 0)                                as revenue_stripe,
  coalesce(manual.amount, 0)                                as revenue_manual,
  coalesce(stripe.amount, 0) + coalesce(manual.amount, 0)   as revenue_achieved,
  greatest(0, t.revenue_target - (coalesce(stripe.amount, 0) + coalesce(manual.amount, 0)))
                                                            as revenue_remaining,
  round(
    ((coalesce(stripe.amount, 0) + coalesce(manual.amount, 0))::numeric * 100)
    / t.revenue_target
  )::integer                                                as percent_complete,

  (t.ends_on - t.starts_on) + 1                             as days_total,
  case
    when current_date < t.starts_on then null
    when current_date > t.ends_on   then 0
    else (t.ends_on - current_date)
  end                                                       as days_left,

  case
    when current_date < t.starts_on then 'upcoming'
    when current_date > t.ends_on   then 'closed'
    else 'active'
  end                                                       as status,

  coalesce(manual.entries, 0)                               as manual_entries,
  coalesce(requests.count, 0)                               as requests_actual

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
) requests on true;

comment on view sales.target_progress is
  'Target versus achieved. revenue_achieved = checkout + manual, which cannot double-count because the two come from different tables.';

-- ---- Revenue that no target covers -------------------------
--
-- Without this, money earned outside every window would simply be
-- invisible on the targets page. It is reported, not dropped.

create view sales.unattributed_revenue
with (security_invoker = true) as
select
  coalesce((
    select sum(p.amount - p.amount_refunded)
    from sales.payments p
    where p.status = 'succeeded'
      and p.succeeded_at is not null
      and not exists (
        select 1 from sales.revenue_targets t
        where (p.succeeded_at at time zone 'UTC')::date between t.starts_on and t.ends_on
      )
  ), 0) as revenue_stripe,
  coalesce((
    select sum(m.amount)
    from sales.manual_revenue m
    where not exists (
      select 1 from sales.revenue_targets t
      where m.earned_on between t.starts_on and t.ends_on
    )
  ), 0) as revenue_manual;

comment on view sales.unattributed_revenue is
  'Revenue falling outside every target window, so it is never silently lost.';

grant select on sales.target_progress, sales.unattributed_revenue to service_role;
