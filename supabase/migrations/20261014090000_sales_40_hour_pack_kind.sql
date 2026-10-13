-- ============================================================
-- Prepaid hour packs — the offer kind
-- ------------------------------------------------------------
-- Postgres will not let a new enum value be used in the same
-- transaction that adds it, so the value lands here and the rows
-- that use it land in the next migration.
-- ============================================================

alter type sales.offer_kind add value if not exists 'hour_pack';
