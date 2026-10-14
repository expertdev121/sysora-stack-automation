-- Abandoned-cart tracking for hour-pack checkouts.
--
-- A cart is abandoned when the customer finished the details step — which
-- creates the request and opens its PaymentIntent — and then never paid.
-- The row sits in `awaiting_payment` with a null paid_at forever, so the
-- data is already there; what was missing is a record of whether we've
-- told anyone about it.
--
-- Two columns, because "did we send it" and "how many times have we tried"
-- answer different questions. notified_at is the dedupe guard: set once,
-- on success, so a cart is never sent twice. attempts is the circuit
-- breaker: incremented before each try, so a webhook that is down cannot
-- put the sweeper in a hot loop re-posting the same cart every 5 minutes
-- forever. A cart stops being a candidate at 5 failed tries.

alter table sales.requests
  add column if not exists abandoned_notified_at timestamptz,
  add column if not exists abandoned_attempts smallint not null default 0;

comment on column sales.requests.abandoned_notified_at is
  'When the abandoned-cart webhook was accepted for this request. Null means never sent.';

comment on column sales.requests.abandoned_attempts is
  'Failed-or-pending abandoned-cart webhook attempts. The sweeper gives up at 5.';

-- The sweeper asks one question every 5 minutes: which hour-pack requests
-- are unpaid, past the grace period and not yet notified? A partial index
-- over exactly that predicate keeps it an index scan as the table grows,
-- and stays small because rows leave it as soon as they are paid or sent.
create index if not exists requests_abandoned_candidates_idx
  on sales.requests (created_at)
  where kind = 'hour_pack'
    and status = 'awaiting_payment'
    and paid_at is null
    and abandoned_notified_at is null;

-- Carts that predate this migration are left alone rather than swept into
-- the first run. Sending a "you left something behind" email about a
-- checkout someone walked away from weeks ago reads as a mistake, not a
-- nudge, and one of the existing rows is our own smoke test.
update sales.requests
   set abandoned_notified_at = now()
 where kind = 'hour_pack'
   and status = 'awaiting_payment'
   and paid_at is null
   and abandoned_notified_at is null
   and created_at < now();
