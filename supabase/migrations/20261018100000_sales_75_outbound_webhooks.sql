-- Outbound webhooks, configurable from the admin dashboard.
--
-- The abandoned-cart URL used to live only in GHL_ABANDONED_CART_WEBHOOK_URL,
-- which meant changing where a nudge goes needed a redeploy, and nobody
-- outside the Vercel project could see whether it was set at all. The URL
-- is still a credential — a GHL inbound-trigger URL authenticates by the
-- id in its path and nothing else — so this is a table of its own rather
-- than rows in `settings`: `settings` has an is_public flag and a UI that
-- can flip it, and a credential should not be one checkbox away from the
-- public API.
--
-- Reads and writes are service-role only, like every other table here:
-- RLS on, zero policies, so nothing is reachable from a browser.

create table if not exists sales.webhooks (
  key          text primary key,
  url          text,
  label        text not null,
  description  text,
  -- Set by the admin "send test" button, so the page can show whether
  -- this URL has ever actually worked rather than just that it is set.
  last_tested_at    timestamptz,
  last_test_status  integer,
  last_test_ok      boolean,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references sales.users(id) on delete set null
);

alter table sales.webhooks enable row level security;
grant select, insert, update, delete on sales.webhooks to service_role;

insert into sales.webhooks (key, label, description) values
  ('abandoned_cart',
   'Abandoned cart',
   'Fires when a checkout is left unpaid past the grace period. One send per order.'),
  ('payment_confirmation',
   'Payment confirmation',
   'Fires once when an order is marked paid, from the Stripe webhook or the confirmation page.')
on conflict (key) do nothing;

-- Confirmation sends are idempotent the same way the cart nudge is: the
-- Stripe webhook and the confirmation page both call markRequestPaid, and
-- whichever gets here second must not send a second email.
alter table sales.requests
  add column if not exists confirmation_notified_at timestamptz;

create index if not exists requests_confirmation_pending
  on sales.requests (paid_at)
  where status = 'paid' and confirmation_notified_at is null;

-- Orders that were already paid before this existed must not now receive
-- a "thanks for your payment" email. Mark them done.
update sales.requests
   set confirmation_notified_at = coalesce(paid_at, now())
 where status = 'paid'
   and confirmation_notified_at is null;
