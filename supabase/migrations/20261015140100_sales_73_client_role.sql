-- The client role, on its own.
--
-- Postgres refuses ALTER TYPE ... ADD VALUE from inside a DO block, and
-- a value added in one transaction cannot be used in that same
-- transaction, so this is a migration by itself.
alter type sales.staff_role add value if not exists 'client';
