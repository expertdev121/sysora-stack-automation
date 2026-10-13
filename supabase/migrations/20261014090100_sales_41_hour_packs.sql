-- ============================================================
-- Prepaid hour packs — the seven published packages
-- ------------------------------------------------------------
-- The landing page sells blocks of hours at a rate that falls
-- with volume. Each pack is its own offer because each has its
-- own price; requests.amount snapshots it at purchase, so a
-- later price change never rewrites an old order.
--
-- Money is in minor units: 9500 = $95.00.
--
-- Billing is not encoded here. A monthly plan is the same seven
-- prices on a recurring cycle, and the checkout records which
-- the customer chose on the request. Recurring billing itself is
-- not wired up — these create one PaymentIntent each.
-- ============================================================

insert into sales.offers
  (slug, kind, name, tagline, price_amount, currency, billing_interval, price_note, features, sort_order)
values
  ('hours-5', 'hour_pack', '5 prepaid hours', '$19 an hour', 9500, 'USD', 'one_time',
   'Valid 60 days from purchase',
   array['24/7 human chat and ticket triage', 'Unused hours refundable', 'Scope approved before work starts'], 10),
  ('hours-10', 'hour_pack', '10 prepaid hours', '$19 an hour', 19000, 'USD', 'one_time',
   'Valid 60 days from purchase',
   array['24/7 human chat and ticket triage', 'Unused hours refundable', 'Scope approved before work starts'], 20),
  ('hours-25', 'hour_pack', '25 prepaid hours', '$18 an hour', 45000, 'USD', 'one_time',
   'Valid 60 days from purchase',
   array['24/7 human chat and ticket triage', 'Unused hours refundable', 'Scope approved before work starts'], 30),
  ('hours-50', 'hour_pack', '50 prepaid hours', '$17 an hour', 85000, 'USD', 'one_time',
   'Valid 60 days from purchase',
   array['24/7 human chat and ticket triage', 'Unused hours refundable', 'Scope approved before work starts'], 40),
  ('hours-75', 'hour_pack', '75 prepaid hours', '$15 an hour', 112500, 'USD', 'one_time',
   'Valid 60 days from purchase',
   array['24/7 human chat and ticket triage', 'Unused hours refundable', 'Scope approved before work starts'], 50),
  ('hours-100', 'hour_pack', '100 prepaid hours', '$14 an hour', 140000, 'USD', 'one_time',
   'Valid 60 days from purchase',
   array['24/7 human chat and ticket triage', 'Unused hours refundable', 'Scope approved before work starts'], 60),
  ('hours-150', 'hour_pack', '150 prepaid hours', '$13 an hour', 195000, 'USD', 'one_time',
   'Valid 60 days from purchase',
   array['24/7 human chat and ticket triage', 'Unused hours refundable', 'Scope approved before work starts'], 70)
on conflict (slug) do update set
  name          = excluded.name,
  tagline       = excluded.tagline,
  price_amount  = excluded.price_amount,
  price_note    = excluded.price_note,
  features      = excluded.features,
  sort_order    = excluded.sort_order,
  is_active     = true;
