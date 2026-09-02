-- Recurring costs: what you have committed to, month after month.
--
-- Named recurring_costs and not subscriptions because sales.subscriptions
-- already exists and means the opposite — a customer's Stripe subscription,
-- money coming in. These go out. (The database caught that collision; the
-- first attempt at this migration failed against the existing table.)
--
-- A recurring cost is not an expense. It is a standing commitment — Zapier,
-- ₹2,000 a month, since March, still running. What leaves the bank is a
-- charge, and the two come apart the moment a price rises, a plan is
-- cancelled mid-month, or a payment fails.
--
-- Same shape as the rest of this schema: connects separate purchase from
-- consumption, revenue separates dollars invoiced from rupees landed. Here the
-- schedule is stored and payments are recorded against it, so "what am I
-- committed to" and "what did I actually pay" are both answerable and can
-- disagree out loud rather than quietly.

do $$
begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'billing_cadence' and n.nspname = 'sales') then
    create type sales.billing_cadence as enum ('monthly', 'quarterly', 'yearly');
  end if;
end $$;

create table if not exists sales.recurring_costs (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  vendor       text,
  category_id  uuid references sales.spend_categories(id) on delete set null,
  cadence      sales.billing_cadence not null default 'monthly',
  -- Paise. What you expect to be charged, in the currency that matters.
  amount_inr   bigint check (amount_inr >= 0),
  -- Cents, for the many tools billed in dollars. Kept beside the rupees and
  -- never converted into them — the rule the revenue side already follows.
  amount_usd   integer check (amount_usd >= 0),
  -- Day of the month it bills. Capped at 28 so every month has one; a "31st"
  -- plan would silently skip three months a year.
  billing_day  smallint not null default 1 check (billing_day between 1 and 28),
  started_on   date not null default current_date,
  -- Null means still running. Setting it stops future months without erasing
  -- the months it did cost you.
  ended_on     date,
  notes        text,
  created_by   uuid references sales.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint recurring_cost_has_a_price check (
    coalesce(amount_inr, 0) > 0 or coalesce(amount_usd, 0) > 0
  ),
  constraint recurring_cost_ends_after_it_starts check (
    ended_on is null or ended_on >= started_on
  )
);

create index if not exists recurring_costs_running_idx
  on sales.recurring_costs (started_on) where ended_on is null;

-- Tie a recorded payment back to the thing it paid for, so a month can say
-- which commitments have actually been charged and which have not.
alter table sales.expenses
  add column if not exists recurring_cost_id uuid
    references sales.recurring_costs(id) on delete set null;

create index if not exists expenses_recurring_cost_idx
  on sales.expenses (recurring_cost_id) where recurring_cost_id is not null;

alter table sales.recurring_costs enable row level security;
revoke all on sales.recurring_costs from anon, authenticated;
grant all on sales.recurring_costs to service_role;
