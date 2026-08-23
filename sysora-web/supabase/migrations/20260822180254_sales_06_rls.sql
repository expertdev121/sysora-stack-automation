-- ============================================================
-- Sysora sales schema — row level security
-- Default posture: deny. Anonymous visitors read the public
-- catalogue only. Site writes go through server routes on the
-- service role. Staff read/write under their own identity.
-- ============================================================

alter table sales.staff             enable row level security;
alter table sales.settings          enable row level security;
alter table sales.audit_log         enable row level security;
alter table sales.offers            enable row level security;
alter table sales.customers         enable row level security;
alter table sales.surveys           enable row level security;
alter table sales.survey_questions  enable row level security;
alter table sales.survey_responses  enable row level security;
alter table sales.survey_answers    enable row level security;
alter table sales.requests          enable row level security;
alter table sales.payments          enable row level security;
alter table sales.subscriptions     enable row level security;
alter table sales.webhook_events    enable row level security;
alter table sales.events            enable row level security;

create policy staff_self_read on sales.staff
  for select to authenticated
  using (user_id = (select auth.uid()) or sales.is_staff());

create policy staff_super_admin_write on sales.staff
  for all to authenticated
  using (sales.is_super_admin())
  with check (sales.is_super_admin());

create policy offers_public_read on sales.offers
  for select to anon, authenticated using (is_active);

create policy offers_staff_all on sales.offers
  for all to authenticated
  using (sales.is_staff()) with check (sales.is_staff());

create policy settings_public_read on sales.settings
  for select to anon, authenticated using (is_public);

create policy settings_staff_all on sales.settings
  for all to authenticated
  using (sales.is_staff()) with check (sales.is_staff());

create policy surveys_public_read on sales.surveys
  for select to anon, authenticated using (is_active);

create policy surveys_staff_all on sales.surveys
  for all to authenticated
  using (sales.is_staff()) with check (sales.is_staff());

create policy survey_questions_public_read on sales.survey_questions
  for select to anon, authenticated
  using (
    is_active
    and exists (select 1 from sales.surveys s where s.id = survey_id and s.is_active)
  );

create policy survey_questions_staff_all on sales.survey_questions
  for all to authenticated
  using (sales.is_staff()) with check (sales.is_staff());

create policy customers_staff_all on sales.customers
  for all to authenticated
  using (sales.is_staff()) with check (sales.is_staff());

create policy survey_responses_staff_all on sales.survey_responses
  for all to authenticated
  using (sales.is_staff()) with check (sales.is_staff());

create policy survey_answers_staff_all on sales.survey_answers
  for all to authenticated
  using (sales.is_staff()) with check (sales.is_staff());

create policy requests_staff_all on sales.requests
  for all to authenticated
  using (sales.is_staff()) with check (sales.is_staff());

create policy payments_staff_read on sales.payments
  for select to authenticated using (sales.is_staff());

create policy payments_staff_write on sales.payments
  for update to authenticated
  using (sales.is_staff()) with check (sales.is_staff());

create policy subscriptions_staff_all on sales.subscriptions
  for all to authenticated
  using (sales.is_staff()) with check (sales.is_staff());

create policy audit_log_staff_read on sales.audit_log
  for select to authenticated using (sales.is_staff());

create policy events_staff_read on sales.events
  for select to authenticated using (sales.is_staff());

create policy webhook_events_super_admin_read on sales.webhook_events
  for select to authenticated using (sales.is_super_admin());

-- ---- Grants ------------------------------------------------

grant usage on schema sales to anon, authenticated;

grant select on sales.offers, sales.surveys, sales.survey_questions, sales.settings
  to anon, authenticated;

grant select, insert, update, delete on all tables in schema sales to authenticated;
grant select on sales.request_overview, sales.daily_metrics to authenticated;
grant usage, select on all sequences in schema sales to authenticated;

alter default privileges in schema sales
  grant select, insert, update, delete on tables to authenticated;
