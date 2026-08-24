-- ============================================================
-- A fourth role: bde (business development executive).
--
-- Same type-swap as migration 14, for the same reason: ALTER TYPE
-- ... ADD VALUE cannot run inside a migration's transaction. Every
-- existing value survives, so a plain text cast is enough here.
--
-- The order reads as increasing reach. Nothing compares roles by
-- ordinal — src/lib/admin/roles.ts asks capability questions — but
-- an enum that reads in the wrong order invites someone to try.
-- ============================================================

create type sales.staff_role_new as enum ('bde', 'admin', 'manager', 'owner');

alter table sales.users alter column role drop default;

alter table sales.users
  alter column role type sales.staff_role_new
  using role::text::sales.staff_role_new;

alter table sales.users
  alter column role set default 'admin'::sales.staff_role_new;

drop type sales.staff_role;
alter type sales.staff_role_new rename to staff_role;

comment on column sales.users.role is
  'bde: files a daily report, sees activity only. admin: pipeline, no finances. manager: finances and targets. owner: everything.';
