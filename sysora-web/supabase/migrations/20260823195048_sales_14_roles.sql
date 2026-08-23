-- ============================================================
-- Three roles: admin, manager, owner.
--
-- ALTER TYPE ... ADD VALUE can't run inside a migration's
-- transaction, so the type is replaced rather than extended.
-- super_admin becomes owner; manager is new and sits between.
-- ============================================================

create type sales.staff_role_new as enum ('admin', 'manager', 'owner');

alter table sales.users alter column role drop default;

alter table sales.users
  alter column role type sales.staff_role_new
  using (case role::text when 'super_admin' then 'owner' else 'admin' end)::sales.staff_role_new;

alter table sales.users
  alter column role set default 'admin'::sales.staff_role_new;

drop type sales.staff_role;
alter type sales.staff_role_new rename to staff_role;

comment on column sales.users.role is
  'admin: pipeline only, no finances. manager: finances and targets. owner: everything, including team and pricing.';
