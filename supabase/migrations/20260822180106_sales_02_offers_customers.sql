-- ============================================================
-- Sysora sales schema — what we sell, and who buys it
-- ============================================================

create table sales.offers (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  kind                sales.offer_kind not null,
  name                text not null,
  tagline             text,
  description         text,
  price_amount        integer not null default 0 check (price_amount >= 0),
  currency            char(3) not null default 'USD',
  billing_interval    sales.billing_interval not null default 'one_time',
  price_note          text,
  requires_payment    boolean not null generated always as (price_amount > 0) stored,
  stripe_product_id   text,
  stripe_price_id     text,
  features            text[] not null default '{}',
  is_active           boolean not null default true,
  sort_order          integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table sales.offers is 'The three ways to start: build request (free), $49 review, $2,000/mo systems team.';
comment on column sales.offers.price_amount is 'Minor units — 4900 = $49.00. Integer, never floating point.';

create index offers_active_idx on sales.offers (is_active, sort_order) where is_active;
create index offers_kind_idx on sales.offers (kind);

create trigger offers_set_updated_at
  before update on sales.offers
  for each row execute function sales.set_updated_at();

-- ---- Customers ---------------------------------------------

create table sales.customers (
  id                uuid primary key default gen_random_uuid(),
  email             text not null,
  email_normalized  text not null generated always as (lower(trim(email))) stored,
  full_name         text,
  phone             text,
  company_name      text,
  company_website   text,
  company_size      text,
  country           text,
  timezone          text,
  auth_user_id      uuid references auth.users (id) on delete set null,
  product_user_id   text,
  stripe_customer_id text,
  first_seen_at     timestamptz not null default now(),
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  utm_term          text,
  utm_content       text,
  referrer          text,
  landing_path      text,
  gclid             text,
  fbclid            text,
  notes             text,
  metadata          jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table sales.customers is 'One row per person who ever gave us an email, paying or not.';
comment on column sales.customers.email_normalized is 'Lower-cased, trimmed email — the real uniqueness key.';

create unique index customers_email_key on sales.customers (email_normalized);
create index customers_created_idx on sales.customers (created_at desc);
create index customers_company_idx on sales.customers (company_name) where company_name is not null;
create index customers_stripe_idx on sales.customers (stripe_customer_id) where stripe_customer_id is not null;
create index customers_utm_idx on sales.customers (utm_source, utm_campaign) where utm_source is not null;
create index customers_metadata_idx on sales.customers using gin (metadata jsonb_path_ops);

create trigger customers_set_updated_at
  before update on sales.customers
  for each row execute function sales.set_updated_at();
