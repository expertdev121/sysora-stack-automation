-- The server routes talk to the database as service_role, which bypasses
-- RLS but still needs ordinary table privileges.
grant usage on schema sales to service_role;
grant all on all tables in schema sales to service_role;
grant all on all sequences in schema sales to service_role;
grant all on all functions in schema sales to service_role;

alter default privileges in schema sales grant all on tables to service_role;
alter default privileges in schema sales grant all on sequences to service_role;
alter default privileges in schema sales grant all on functions to service_role;

notify pgrst, 'reload schema';
