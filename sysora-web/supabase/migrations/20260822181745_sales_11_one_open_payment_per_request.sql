-- A request may have at most one payment in flight.
--
-- Without this, two concurrent renders of the checkout page each see "no
-- existing intent" and each create one, and a request accumulates orphan
-- PaymentIntents. An application-level check cannot fix a race; a unique
-- index can. Failed and cancelled attempts are excluded, so a customer can
-- always retry after a decline.
create unique index payments_one_open_per_request
  on sales.payments (request_id)
  where request_id is not null
    and status in ('requires_payment_method', 'requires_action', 'processing');

comment on index sales.payments_one_open_per_request is
  'At most one in-flight payment per request; retries after a failure are still allowed.';
