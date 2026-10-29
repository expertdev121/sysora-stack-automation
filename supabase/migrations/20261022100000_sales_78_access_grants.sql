-- sales_78: what access a client has granted us.
--
-- Nothing billable can start until we are inside the client's
-- GoHighLevel account, so the portal asks for this before it asks for
-- anything else and the checklist stays on the overview until it is
-- done. One row per customer, because a customer either has given us
-- access or has not: there is no history worth keeping here, and the
-- form overwrites rather than appends.
--
-- Every invite goes to one address, which lives in src/lib/portal/access.ts
-- rather than in this table. It is our address, not the client's data.
--
-- RLS is enabled with no policy and only service_role is granted, the
-- same shape as the rest of the sales schema: every read and write goes
-- through salesDb() behind requireClient(), never from the browser.

create table if not exists sales.access_grants (
  customer_id       uuid primary key references sales.customers(id) on delete cascade,
  ghl_granted       boolean not null default false,
  ghl_account_name  text,
  -- Free text on purpose. Most clients grant nothing else, and the ones
  -- who do name tools we have no column for.
  tools_notes       text,
  -- Set only when the box is ticked and the account name is filled in,
  -- so the portal can collapse the panel on one check.
  completed_at      timestamptz,
  updated_at        timestamptz not null default now()
);

alter table sales.access_grants enable row level security;

grant select, insert, update, delete on sales.access_grants to service_role;
