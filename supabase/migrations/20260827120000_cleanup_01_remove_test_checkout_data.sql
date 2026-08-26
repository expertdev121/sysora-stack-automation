-- Remove the test checkout data from 22 Aug 2026.
--
-- Five requests (SYS-000001..005) were created while building and
-- testing the checkout: four with @sysora-test.local addresses, one
-- with "sdfsdf@mail.com" typed into a form. Between them they carry
-- 17 payments, 27 events and 7 survey responses. Four of those
-- payments — $196 — sat in the revenue ledger waiting for a rupee
-- figure that was never going to come, because no money ever moved.
--
-- Scoped by reference and email rather than truncating, so running it
-- against a database that has since taken a real order leaves that
-- order alone. Re-running it is a no-op.
--
-- sales.manual_revenue is untouched.

begin;

create temp table doomed_requests on commit drop as
  select id from sales.requests
  where reference in ('SYS-000001','SYS-000002','SYS-000003','SYS-000004','SYS-000005');

create temp table doomed_customers on commit drop as
  select id from sales.customers
  where email in (
    'e2e-test@sysora-test.local',
    'final-pass@sysora-test.local',
    'sdfsdf@mail.com',
    'stripe-e2e@sysora-test.local',
    'webhook-e2e@sysora-test.local'
  );

delete from sales.survey_responses
 where request_id in (select id from doomed_requests)
    or customer_id in (select id from doomed_customers);

delete from sales.events
 where request_id in (select id from doomed_requests)
    or customer_id in (select id from doomed_customers);

delete from sales.payments
 where request_id in (select id from doomed_requests)
    or customer_id in (select id from doomed_customers);

delete from sales.subscriptions
 where request_id in (select id from doomed_requests)
    or customer_id in (select id from doomed_customers);

delete from sales.requests  where id in (select id from doomed_requests);
delete from sales.customers where id in (select id from doomed_customers);

commit;
