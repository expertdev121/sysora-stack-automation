-- ============================================================
-- The scoreboard arithmetic.
--
-- Same posture as sales.target_progress: nothing is stored, so
-- correcting a report on Friday fixes Tuesday's number the next
-- time anyone looks.
--
-- One trap worth naming. sales.target_progress defines days_left
-- as ends_on - current_date, which is ZERO on the final day.
-- Dividing "how many are left" by that would fail on exactly the
-- day the number matters most, so days_remaining adds today back
-- in and never goes below one while the window is open.
-- ============================================================

create view sales.activity_progress
with (security_invoker = true) as
with base as (
  select
    a.id                                        as activity_target_id,
    t.id                                        as revenue_target_id,
    t.name                                      as target_name,
    t.starts_on,
    t.ends_on,
    ty.id                                       as activity_type_id,
    ty.slug,
    ty.label,
    ty.question,
    ty.sort_order,
    ty.is_active                                as type_is_active,
    a.target_count,
    coalesce(done.total, 0)::integer            as achieved,
    coalesce(done.contributors, 0)::integer     as contributors,

    (t.ends_on - t.starts_on) + 1               as days_total,
    least(
      (t.ends_on - t.starts_on) + 1,
      greatest(0, (current_date - t.starts_on) + 1)
    )                                           as days_elapsed,

    case
      when current_date < t.starts_on then null
      when current_date > t.ends_on   then 0
      else t.ends_on - current_date
    end                                         as days_left,

    -- Days still available to work in, today included.
    case
      when current_date < t.starts_on then (t.ends_on - t.starts_on) + 1
      when current_date > t.ends_on   then 0
      else (t.ends_on - current_date) + 1
    end                                         as days_remaining,

    case
      when current_date < t.starts_on then 'upcoming'
      when current_date > t.ends_on   then 'closed'
      else 'active'
    end                                         as status

  from sales.activity_targets a
  join sales.revenue_targets t on t.id = a.revenue_target_id
  join sales.activity_types ty on ty.id = a.activity_type_id
  left join lateral (
    select sum(e.count) as total, count(distinct r.user_id) as contributors
    from sales.eod_entries e
    join sales.eod_reports r on r.id = e.report_id
    where e.activity_type_id = a.activity_type_id
      and r.reported_on between t.starts_on and t.ends_on
  ) done on true
)
select
  base.*,
  greatest(0, target_count - achieved)                                as remaining,
  round(achieved::numeric * 100 / target_count)::integer              as percent_complete,
  -- Straight-line pace: where a team that never varied would be today.
  round(target_count::numeric * days_elapsed / days_total)::integer   as expected_by_today,
  case
    when achieved >= target_count then 0
    when days_remaining <= 0      then 0
    else ceil((target_count - achieved)::numeric / days_remaining)::integer
  end                                                                 as required_per_day,
  case
    when achieved >= target_count then 'done'
    when status = 'upcoming'      then 'upcoming'
    when status = 'closed'        then 'missed'
    when achieved >= round(target_count::numeric * days_elapsed / days_total) then 'on_track'
    when achieved >= round(target_count::numeric * days_elapsed / days_total) * 0.9 then 'at_risk'
    else 'behind'
  end                                                                 as pace
from base;

comment on view sales.activity_progress is
  'One lead measure on one target: achieved, remaining, the pace it needs, and whether it is keeping it.';

-- ---- Who contributed what ----------------------------------

create view sales.activity_progress_by_user
with (security_invoker = true) as
select
  t.id                        as revenue_target_id,
  ty.id                       as activity_type_id,
  ty.slug,
  ty.label,
  u.id                        as user_id,
  u.full_name,
  u.email,
  u.role,
  sum(e.count)::integer       as achieved,
  count(*)::integer           as days_reported,
  max(r.reported_on)          as last_reported_on
from sales.eod_entries e
join sales.eod_reports r  on r.id = e.report_id
join sales.users u        on u.id = r.user_id
join sales.activity_types ty on ty.id = e.activity_type_id
join sales.revenue_targets t on r.reported_on between t.starts_on and t.ends_on
group by t.id, ty.id, ty.slug, ty.label, u.id, u.full_name, u.email, u.role;

comment on view sales.activity_progress_by_user is
  'The same counts as activity_progress, broken out by person. Deactivated staff still appear: they did the work.';

-- ---- Work that no target covers ----------------------------
--
-- The mirror of sales.unattributed_revenue. Effort spent outside
-- every window is still effort; it is reported, not discarded.

create view sales.unattributed_activity
with (security_invoker = true) as
select
  ty.id                  as activity_type_id,
  ty.slug,
  ty.label,
  sum(e.count)::integer  as achieved,
  count(*)::integer      as entries
from sales.eod_entries e
join sales.eod_reports r on r.id = e.report_id
join sales.activity_types ty on ty.id = e.activity_type_id
where not exists (
  select 1 from sales.revenue_targets t
  where r.reported_on between t.starts_on and t.ends_on
)
group by ty.id, ty.slug, ty.label;

comment on view sales.unattributed_activity is
  'Activity on days no target window covers, so it is never silently lost.';

-- ---- The report list ---------------------------------------

create view sales.eod_report_overview
with (security_invoker = true) as
select
  r.id,
  r.user_id,
  u.full_name,
  u.email,
  u.role,
  r.reported_on,
  r.notes,
  r.submitted_at,
  r.updated_at,
  coalesce(sum(e.count), 0)::integer as total_count,
  count(e.id)::integer               as entry_count
from sales.eod_reports r
join sales.users u on u.id = r.user_id
left join sales.eod_entries e on e.report_id = r.id
group by r.id, r.user_id, u.full_name, u.email, u.role;

comment on view sales.eod_report_overview is
  'Flattened end-of-day reports for the dashboard list.';

grant select on
  sales.activity_progress,
  sales.activity_progress_by_user,
  sales.unattributed_activity,
  sales.eod_report_overview
to service_role;
