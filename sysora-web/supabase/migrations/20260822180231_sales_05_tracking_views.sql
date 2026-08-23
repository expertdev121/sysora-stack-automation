-- ============================================================
-- Sysora sales schema — tracking and reporting
-- ============================================================

create table sales.events (
  id           bigint generated always as identity primary key,
  name         text not null,
  occurred_at  timestamptz not null default now(),
  session_id   text,
  customer_id  uuid references sales.customers (id) on delete set null,
  request_id   uuid references sales.requests (id) on delete set null,
  survey_id    uuid references sales.surveys (id) on delete set null,
  path         text,
  referrer     text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_term     text,
  utm_content  text,
  device_type  text,
  country      text,
  ip           inet,
  user_agent   text,
  properties   jsonb not null default '{}'::jsonb
);

comment on table sales.events is 'Append-only behavioural log: page views, CTA clicks, survey steps, checkout stages.';
comment on column sales.events.name is 'Dotted event name, e.g. page.view, cta.click, survey.step, checkout.started.';

create index events_occurred_brin_idx on sales.events using brin (occurred_at);
create index events_name_time_idx on sales.events (name, occurred_at desc);
create index events_customer_idx on sales.events (customer_id, occurred_at desc) where customer_id is not null;
create index events_session_idx on sales.events (session_id, occurred_at) where session_id is not null;
create index events_campaign_idx on sales.events (utm_source, utm_campaign, occurred_at desc) where utm_source is not null;
create index events_properties_idx on sales.events using gin (properties jsonb_path_ops);

-- ---- Dashboard views ---------------------------------------

create view sales.request_overview
with (security_invoker = true) as
select
  r.id, r.reference, r.kind, r.status, r.amount, r.currency, r.title,
  r.submitted_at, r.paid_at, r.scheduled_call_at, r.assigned_to, r.created_at,
  c.id as customer_id, c.email as customer_email, c.full_name as customer_name,
  c.company_name as customer_company,
  o.slug as offer_slug, o.name as offer_name,
  p.status as payment_status, p.succeeded_at as payment_succeeded_at,
  pre.status as pre_survey_status, post.status as post_survey_status
from sales.requests r
join sales.customers c on c.id = r.customer_id
join sales.offers o on o.id = r.offer_id
left join lateral (
  select status, succeeded_at from sales.payments
  where request_id = r.id
  order by (status = 'succeeded') desc, created_at desc
  limit 1
) p on true
left join sales.survey_responses pre on pre.id = r.pre_response_id
left join sales.survey_responses post on post.id = r.post_response_id;

comment on view sales.request_overview is 'Flattened request list for the admin dashboard.';

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
  (select coalesce(sum(p.amount - p.amount_refunded), 0) from sales.payments p
    where p.succeeded_at >= d and p.succeeded_at < d + interval '1 day') as revenue_minor
from generate_series(
  date_trunc('day', now()) - interval '89 days',
  date_trunc('day', now()),
  interval '1 day'
) as d;

comment on view sales.daily_metrics is 'Last 90 days: signups, requests, survey funnel and revenue per day.';
