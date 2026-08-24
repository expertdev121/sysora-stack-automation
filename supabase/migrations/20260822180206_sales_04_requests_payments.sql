-- ============================================================
-- Sysora sales schema — requests, payments, subscriptions
-- ============================================================

create table sales.requests (
  id                    uuid primary key default gen_random_uuid(),
  request_seq           bigint not null generated always as identity,
  reference             text not null unique
                        generated always as ('SYS-' || lpad(request_seq::text, 6, '0')) stored,
  customer_id           uuid not null references sales.customers (id) on delete restrict,
  offer_id              uuid not null references sales.offers (id) on delete restrict,
  kind                  sales.offer_kind not null,
  status                sales.request_status not null default 'submitted',
  amount                integer not null default 0 check (amount >= 0),
  currency              char(3) not null default 'USD',
  pre_response_id       uuid references sales.survey_responses (id) on delete set null,
  post_response_id      uuid references sales.survey_responses (id) on delete set null,
  title                 text,
  summary               text,
  internal_notes        text,
  assigned_to           uuid references auth.users (id) on delete set null,
  booking_url           text,
  scheduled_call_at     timestamptz,
  submitted_at          timestamptz not null default now(),
  paid_at               timestamptz,
  completed_at          timestamptz,
  utm_source            text,
  utm_medium            text,
  utm_campaign          text,
  referrer              text,
  metadata              jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint requests_paid_has_time check (status <> 'paid' or paid_at is not null)
);

comment on table sales.requests is 'One row per thing a customer asked us for: a build request, a $49 review, a systems-team enquiry.';
comment on column sales.requests.reference is 'Human-facing id, e.g. SYS-000042.';
comment on column sales.requests.amount is 'Minor units, snapshotted at submission.';

create index requests_customer_idx on sales.requests (customer_id, created_at desc);
create index requests_status_idx on sales.requests (status, created_at desc);
create index requests_kind_idx on sales.requests (kind, created_at desc);
create index requests_assigned_idx on sales.requests (assigned_to) where assigned_to is not null;
create index requests_created_idx on sales.requests (created_at desc);
create index requests_open_idx on sales.requests (status, submitted_at desc)
  where status in ('submitted', 'awaiting_payment', 'paid', 'in_review', 'scoped', 'proposal_sent');

create trigger requests_set_updated_at
  before update on sales.requests
  for each row execute function sales.set_updated_at();

alter table sales.survey_responses
  add constraint survey_responses_request_fk
  foreign key (request_id) references sales.requests (id) on delete set null;

-- ---- Payments ----------------------------------------------

create table sales.payments (
  id                   uuid primary key default gen_random_uuid(),
  request_id           uuid references sales.requests (id) on delete set null,
  customer_id          uuid not null references sales.customers (id) on delete restrict,
  offer_id             uuid references sales.offers (id) on delete set null,
  provider             text not null default 'stripe',
  provider_intent_id   text,
  provider_charge_id   text,
  provider_customer_id text,
  status               sales.payment_status not null default 'requires_payment_method',
  amount               integer not null check (amount >= 0),
  amount_refunded      integer not null default 0 check (amount_refunded >= 0),
  currency             char(3) not null default 'USD',
  payment_method_type  text,
  card_brand           text,
  card_last4           char(4),
  receipt_url          text,
  failure_code         text,
  failure_message      text,
  succeeded_at         timestamptz,
  refunded_at          timestamptz,
  metadata             jsonb not null default '{}'::jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint payments_refund_within_amount check (amount_refunded <= amount),
  constraint payments_succeeded_has_time check (status <> 'succeeded' or succeeded_at is not null)
);

comment on table sales.payments is 'Payment attempts. No card data is ever stored here — only the brand and last four the provider returns.';

create unique index payments_intent_key on sales.payments (provider, provider_intent_id)
  where provider_intent_id is not null;
create index payments_customer_idx on sales.payments (customer_id, created_at desc);
create index payments_request_idx on sales.payments (request_id);
create index payments_status_idx on sales.payments (status, created_at desc);
create index payments_succeeded_idx on sales.payments (succeeded_at desc) where status = 'succeeded';

create trigger payments_set_updated_at
  before update on sales.payments
  for each row execute function sales.set_updated_at();

-- ---- Subscriptions -----------------------------------------

create table sales.subscriptions (
  id                        uuid primary key default gen_random_uuid(),
  customer_id               uuid not null references sales.customers (id) on delete restrict,
  offer_id                  uuid not null references sales.offers (id) on delete restrict,
  request_id                uuid references sales.requests (id) on delete set null,
  provider                  text not null default 'stripe',
  provider_subscription_id  text,
  status                    sales.subscription_status not null default 'incomplete',
  amount                    integer not null check (amount >= 0),
  currency                  char(3) not null default 'USD',
  billing_interval          sales.billing_interval not null default 'month',
  current_period_start      timestamptz,
  current_period_end        timestamptz,
  cancel_at_period_end      boolean not null default false,
  cancelled_at              timestamptz,
  started_at                timestamptz,
  metadata                  jsonb not null default '{}'::jsonb,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

comment on table sales.subscriptions is 'Recurring retainers. Mirrors the provider; the provider stays the source of truth.';

create unique index subscriptions_provider_key on sales.subscriptions (provider, provider_subscription_id)
  where provider_subscription_id is not null;
create index subscriptions_customer_idx on sales.subscriptions (customer_id, created_at desc);
create index subscriptions_status_idx on sales.subscriptions (status);
create index subscriptions_renewal_idx on sales.subscriptions (current_period_end)
  where status in ('active', 'trialing', 'past_due');

create trigger subscriptions_set_updated_at
  before update on sales.subscriptions
  for each row execute function sales.set_updated_at();

-- ---- Webhook inbox -----------------------------------------

create table sales.webhook_events (
  id            uuid primary key default gen_random_uuid(),
  provider      text not null default 'stripe',
  event_id      text not null,
  event_type    text not null,
  payload       jsonb not null,
  received_at   timestamptz not null default now(),
  processed_at  timestamptz,
  attempts      integer not null default 0,
  error         text
);

comment on table sales.webhook_events is 'Raw provider events. The unique (provider, event_id) makes replays idempotent.';

create unique index webhook_events_key on sales.webhook_events (provider, event_id);
create index webhook_events_unprocessed_idx on sales.webhook_events (received_at) where processed_at is null;
create index webhook_events_type_idx on sales.webhook_events (event_type, received_at desc);
