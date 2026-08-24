-- Expose the sales schema through the REST API.
-- Without this PostgREST answers "Invalid schema: sales", because it
-- only serves the schemas named here.
alter role authenticator
  set pgrst.db_schemas = 'public, graphql_public, sales';

notify pgrst, 'reload config';
