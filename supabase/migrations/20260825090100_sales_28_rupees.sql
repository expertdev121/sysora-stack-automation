-- ============================================================
-- Rupees are the number that matters.
--
-- The business earns in dollars and lives in rupees. Salaries,
-- rent and tax leave in INR; Upwork and the checkout arrive in
-- USD. Reporting in dollars means converting in your head before
-- any figure means anything.
--
-- So every amount now carries two: what it was in its own
-- currency, and what actually hit or left the bank in rupees.
--
-- The system NEVER converts between them. A rate is a fact about
-- one payment on one day, not a rule — applying today's rate to
-- last month's money would make the scoreboard move when the
-- rupee moves and nobody had done any work. Where the rupee
-- figure isn't known yet it stays null and is shown as pending,
-- because a missing number you can see beats a wrong one you
-- can't.
-- ============================================================

-- The remaining views read the columns and tables renamed below,
-- and Postgres will not rename out from under a view. Migration 29
-- rebuilds every one of them; these three run as a unit.
drop view if exists sales.activity_economics;
drop view if exists sales.daily_money;
drop view if exists sales.spend_ledger;
drop view if exists sales.revenue_ledger;
drop view if exists sales.unattributed_revenue;

-- ---- Revenue entered by hand --------------------------------
--
-- Renamed rather than left as `amount`: two amounts in one table
-- and one of them called `amount` is how unit mix-ups happen.

alter table sales.manual_revenue rename column amount to amount_usd;
alter table sales.manual_revenue alter column amount_usd drop not null;

alter table sales.manual_revenue
  add column amount_inr bigint check (amount_inr is null or amount_inr > 0);

comment on column sales.manual_revenue.amount_usd is 'Cents. Null when the money was never in dollars.';
comment on column sales.manual_revenue.amount_inr is 'Paise. What actually landed. This is what targets count.';

alter table sales.manual_revenue drop constraint manual_revenue_currency_supported;

alter table sales.manual_revenue
  add constraint manual_revenue_has_an_amount
  check (amount_usd is not null or amount_inr is not null);

-- ---- Checkout payments --------------------------------------
--
-- Stripe settles days later at a rate nobody knows at the moment
-- of payment, so there is no honest rupee figure to store then.
-- It arrives when the payout does.

alter table sales.payments add column amount_inr bigint check (amount_inr is null or amount_inr > 0);
alter table sales.payments add column settled_on date;

comment on column sales.payments.amount_inr is
  'Paise actually received after Stripe settled. Null until the payout lands.';

-- ---- Every cost, not just the ones that win work ------------

alter table sales.acquisition_spend rename to expenses;

alter table sales.expenses rename column amount to amount_usd;
alter table sales.expenses alter column amount_usd drop not null;

alter table sales.expenses
  add column amount_inr bigint check (amount_inr is null or amount_inr > 0);

-- Salaries are per person per month, so the row needs to say whose.
alter table sales.expenses add column paid_to text;

alter table sales.expenses drop constraint acquisition_spend_currency_supported;

alter table sales.expenses
  add constraint expenses_has_an_amount
  check (amount_usd is not null or amount_inr is not null);

comment on table sales.expenses is
  'Every cost: Connects and ads that win work, salaries and rent that run it. is_acquisition on the category decides which count toward cost per client.';
comment on column sales.expenses.paid_to is 'Who was paid — used for salaries, so one hire is one line.';

create index expenses_paid_to_idx on sales.expenses (paid_to) where paid_to is not null;

-- The categories a business that pays people actually needs.
insert into sales.spend_categories (slug, label, is_acquisition, sort_order) values
  ('salaries', 'Salaries',   false, 45),
  ('rent',     'Rent',       false, 55),
  ('taxes',    'Taxes',      false, 65)
on conflict (slug) do nothing;

-- ---- Targets can be set in rupees ---------------------------
--
-- Kept per target rather than forced globally, so the sprints
-- already recorded in dollars stay meaningful instead of having
-- their numbers reinterpreted as paise.

alter table sales.revenue_targets alter column currency set default 'INR';

alter table sales.revenue_targets
  add constraint revenue_targets_currency_supported
  check (currency in ('INR', 'USD'));

comment on column sales.revenue_targets.currency is
  'The currency this target is counted in. INR targets count amount_inr; USD targets count amount_usd.';
