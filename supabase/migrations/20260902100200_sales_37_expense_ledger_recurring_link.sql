-- Carry the recurring-cost link through the expense ledger.
--
-- Without it the monthly page could not tell a subscription payment from a
-- one-off: every recorded charge landed under "everything else" and the
-- commitment it paid still showed as unpaid. The column existed on
-- sales.expenses; the view simply never selected it. Found by recording a
-- payment in the browser and watching it file itself in the wrong place.
--
-- Appended at the end rather than placed beside the others, because
-- CREATE OR REPLACE VIEW can add columns only at the end.

create or replace view sales.expense_ledger
with (security_invoker = true) as
select
  e.id,
  e.spent_on,
  e.amount_usd,
  e.amount_inr,
  e.description,
  e.paid_to,
  c.slug            as category_key,
  c.label           as category_label,
  c.is_acquisition,
  a.id              as activity_type_id,
  a.label           as activity_label,
  e.created_by,
  e.created_at,
  e.recurring_cost_id
from sales.expenses e
join sales.spend_categories c on c.id = e.category_id
left join public.work_metrics a on a.id = e.activity_type_id;
