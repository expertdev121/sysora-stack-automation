-- Portal accounts are created at payment, so the confirmation webhook can
-- carry the credentials to GoHighLevel.
--
-- The generated code is six digits: short enough to read out on a call,
-- and below the site's own ten-character minimum, so the account is
-- flagged and the portal asks for a real password on arrival.
alter table sales.users
  add column if not exists must_change_password boolean not null default false;

-- A third hook. A client who already has an account buys hours again and
-- must not be sent a second welcome, so that order routes here instead
-- and the workflow behind it is a top-up note.
insert into sales.webhooks (key, label, description) values
  ('hours_topped_up',
   'Repeat purchase',
   'Fires when a client who already has a portal account buys more hours. account_created is false and portal_password is empty, so this is the top-up email rather than the welcome.')
on conflict (key) do nothing;

update sales.webhooks set description =
  'Fires on a client''s first paid order, the one that creates their portal account. Carries portal_email and the six-digit portal_password.'
where key = 'payment_confirmation';
