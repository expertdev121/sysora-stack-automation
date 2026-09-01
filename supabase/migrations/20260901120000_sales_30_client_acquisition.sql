-- Client acquisition: what connects cost, what they bought, and a budget.
--
-- Three ideas, deliberately separate:
--
--   1. connect_purchases — cash leaving the account. Bought or granted free,
--      on a date, at a price, with the tax stated rather than assumed.
--   2. proposals — one row per job bid on, carrying the connects it used.
--      This is the only place consumption is recorded, so the daily connect
--      count and the bid count are derived rather than typed twice.
--   3. revenue_targets.acquisition_budget — what you have decided to spend
--      winning work in that window.
--
-- The per-connect rate is never stored. It is total cash divided by total
-- connects acquired, which self-corrects when the price changes, handles
-- bulk purchases without arithmetic, and counts free grants at what they
-- actually cost. A hardcoded rate would silently stop matching the bank.

create table if not exists sales.connect_purchases (
  id            uuid primary key default gen_random_uuid(),
  purchased_on  date not null default current_date,
  connects      integer not null check (connects > 0),
  -- Cents, excluding tax. Null for a free membership grant.
  amount_usd    integer check (amount_usd >= 0),
  -- Cents. Stated separately because GST on a business input may be
  -- reclaimable, and one blended number throws that away.
  tax_usd       integer check (tax_usd >= 0),
  -- Paise. What the card was actually charged, tax included. This is the
  -- figure the rupee budget counts — never a converted USD amount.
  amount_inr    bigint check (amount_inr >= 0),
  is_free       boolean not null default false,
  note          text,
  created_by    uuid references sales.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- A free grant costs nothing; a purchase has to cost something.
  constraint connect_purchase_amounts check (
    (is_free and coalesce(amount_usd, 0) = 0 and coalesce(amount_inr, 0) = 0)
    or (not is_free and (coalesce(amount_usd, 0) > 0 or coalesce(amount_inr, 0) > 0))
  )
);

create index if not exists connect_purchases_day_idx
  on sales.connect_purchases (purchased_on desc);

do $$
begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'proposal_outcome' and n.nspname = 'sales') then
    create type sales.proposal_outcome as enum (
      'sent', 'viewed', 'replied', 'interviewing', 'hired', 'declined', 'expired'
    );
  end if;
end $$;

create table if not exists sales.proposals (
  id                uuid primary key default gen_random_uuid(),
  submitted_on      date not null default current_date,
  job_title         text not null,
  job_url           text,
  client_name       text,
  connects_spent    integer not null default 0 check (connects_spent >= 0),
  -- Upwork returns connects when a job expires without a hire.
  connects_refunded integer not null default 0 check (connects_refunded >= 0),
  outcome           sales.proposal_outcome not null default 'sent',
  outcome_on        date,
  -- The person who bid. A profile, not a login — the same identity the
  -- end-of-day reports and activity targets already use.
  submitted_by      uuid references public.profiles(id) on delete set null,
  -- Closes the loop: connects spent here became this money.
  won_revenue_id    uuid references sales.manual_revenue(id) on delete set null,
  notes             text,
  created_by        uuid references sales.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint proposal_refund_within_spend check (connects_refunded <= connects_spent)
);

create index if not exists proposals_day_idx on sales.proposals (submitted_on desc);
create index if not exists proposals_outcome_idx on sales.proposals (outcome);
create index if not exists proposals_person_idx on sales.proposals (submitted_by);

alter table sales.revenue_targets
  add column if not exists acquisition_budget bigint check (acquisition_budget >= 0);

-- Always INR, whatever the target's revenue currency is: spend leaves the
-- account in rupees, so the budget governing it is in rupees. Comparing a
-- rupee total to a dollar budget would produce a percentage meaning nothing.
comment on column sales.revenue_targets.acquisition_budget is
  'Paise. Always INR, regardless of the target''s revenue currency, because acquisition spend is recorded as the rupees actually charged. Null means no budget set.';

-- RLS: deny by default, same as every other table in this schema. The app
-- reaches these with the service role after checking the session itself.
alter table sales.connect_purchases enable row level security;
alter table sales.proposals         enable row level security;

revoke all on sales.connect_purchases, sales.proposals from anon, authenticated;
grant all on sales.connect_purchases, sales.proposals to service_role;
