-- ============================================================
-- What winning the work costs.
--
-- Revenue on its own flatters you. Upwork Connects, ads, tools
-- and subcontracted help are all real money spent to earn it, and
-- until they sit next to the revenue nobody can say whether a
-- month was good or merely busy.
--
-- Categories are rows, like activity types, for the same reason:
-- the next thing you spend money on shouldn't need a migration.
-- ============================================================

create table sales.spend_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  label       text not null,
  -- Money spent to win work, as opposed to running it. Only the
  -- acquisition half belongs in a cost-per-client figure.
  is_acquisition boolean not null default true,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint spend_categories_slug_format check (slug ~ '^[a-z][a-z0-9_]*$'),
  constraint spend_categories_label_present check (length(trim(label)) > 0)
);

comment on table sales.spend_categories is
  'Kinds of spend. Deactivate rather than delete: entries point at these rows.';

create index spend_categories_order_idx on sales.spend_categories (sort_order) where is_active;

create trigger spend_categories_set_updated_at
  before update on sales.spend_categories
  for each row execute function sales.set_updated_at();

alter table sales.spend_categories enable row level security;
revoke all on sales.spend_categories from anon, authenticated;
grant all on sales.spend_categories to service_role;

insert into sales.spend_categories (slug, label, is_acquisition, sort_order) values
  ('upwork_connects', 'Upwork Connects', true,  10),
  ('job_boards',      'Job boards',      true,  20),
  ('ads',             'Ads',             true,  30),
  ('outreach_tools',  'Outreach tools',  true,  40),
  ('subcontractors',  'Subcontractors',  false, 50),
  ('software',        'Software',        false, 60),
  ('other',           'Other',           true,  70);

-- ---- The entries ------------------------------------------
--
-- Minor units and attribution by date, exactly like every other
-- amount in this schema, so spend lands in a target window by the
-- same rule revenue does.

create table sales.acquisition_spend (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid not null references sales.spend_categories (id) on delete restrict,
  description      text,
  amount           integer not null check (amount > 0),
  currency         char(3) not null default 'USD',
  spent_on         date not null default current_date,
  -- Optional: which lead measure this money bought. Tagging spend
  -- to bidding is what makes a cost-per-bid figure possible.
  activity_type_id uuid references sales.activity_types (id) on delete set null,
  created_by       uuid references sales.users (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint acquisition_spend_currency_supported check (currency = 'USD')
);

comment on table sales.acquisition_spend is
  'Money spent to win work. Counts against a target by spent_on, the same way revenue counts by its date.';

create index acquisition_spend_day_idx on sales.acquisition_spend (spent_on desc);
create index acquisition_spend_category_idx on sales.acquisition_spend (category_id);
create index acquisition_spend_activity_idx on sales.acquisition_spend (activity_type_id)
  where activity_type_id is not null;

create trigger acquisition_spend_set_updated_at
  before update on sales.acquisition_spend
  for each row execute function sales.set_updated_at();

alter table sales.acquisition_spend enable row level security;
revoke all on sales.acquisition_spend from anon, authenticated;
grant all on sales.acquisition_spend to service_role;
