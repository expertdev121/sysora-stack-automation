-- ============================================================
-- The services catalogue.
--
-- Separate from sales.offers on purpose. An offer is a checkout
-- path -- it has a kind the code branches on, a survey attached,
-- and a Stripe price behind it. A service is a page: something we
-- do, described well enough to rank for it and to be understood by
-- somebody who arrived from a search result.
--
-- Overloading offers would have meant every new service needing a
-- new value in the offer_kind enum and a new branch in the checkout,
-- which is a lot of machinery for what is mostly prose.
--
-- The SEO fields are stored, not derived. A meta description that is
-- the first 160 characters of the body reads like a truncated
-- sentence, and the whole point of writing one is that it does not.
-- Falling back to the summary when they are blank keeps the common
-- case free.
-- ============================================================

create table sales.services (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  -- One line under the title. The promise, not the category.
  tagline       text,
  -- Two or three sentences for cards and, by default, the meta description.
  summary       text,
  -- The page itself. Markdown-ish: paragraphs split on blank lines.
  body          text,

  -- Null means "get a quote" rather than free. Minor units, like offers.
  price_amount  integer check (price_amount is null or price_amount >= 0),
  currency      char(3) not null default 'USD',
  price_note    text,

  -- Short proof chips: "100% approval or full refund", "We submit for you".
  highlights    text[] not null default '{}',
  -- What is actually included, listed on the page.
  deliverables  text[] not null default '{}',

  seo_title       text,
  seo_description text,
  keywords        text[] not null default '{}',

  is_active     boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint services_slug_shape check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint services_name_present check (length(trim(name)) > 0)
);

comment on table sales.services is
  'Public services catalogue. One row is one /services/<slug> page.';

create index services_active_idx on sales.services (is_active, sort_order);

create trigger services_set_updated_at
  before update on sales.services
  for each row execute function sales.set_updated_at();

-- ---- FAQs -------------------------------------------------

-- Their own rows rather than jsonb on the service: they are ordered,
-- edited one at a time in the dashboard, and emitted as FAQPage
-- structured data where each entry is a separate node anyway.
create table sales.service_faqs (
  id          uuid primary key default gen_random_uuid(),
  service_id  uuid not null references sales.services (id) on delete cascade,
  question    text not null,
  answer      text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint service_faqs_question_present check (length(trim(question)) > 0),
  constraint service_faqs_answer_present check (length(trim(answer)) > 0)
);

comment on table sales.service_faqs is
  'Questions shown on a service page and emitted as FAQPage structured data.';

create index service_faqs_service_idx on sales.service_faqs (service_id, sort_order);

create trigger service_faqs_set_updated_at
  before update on sales.service_faqs
  for each row execute function sales.set_updated_at();

-- ---- Access -----------------------------------------------
-- Same posture as every other sales table: deny-all, service_role
-- only. The public pages render on the server through the service
-- key, so anon never needs to read this directly.

alter table sales.services enable row level security;
alter table sales.service_faqs enable row level security;
revoke all on sales.services, sales.service_faqs from anon, authenticated;
grant all on sales.services, sales.service_faqs to service_role;
