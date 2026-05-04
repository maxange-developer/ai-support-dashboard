-- Grant table-level privileges so service_role (seed script) and
-- authenticated (app users) can access all tables.
-- Required when migrations are applied via SQL editor instead of Supabase CLI,
-- which would normally run these grants automatically.

grant all on table organizations  to service_role;
grant all on table memberships    to service_role;
grant all on table documents      to service_role;
grant all on table chunks         to service_role;
grant all on table conversations  to service_role;
grant all on table messages       to service_role;
grant all on table api_keys       to service_role;

grant select, insert, update, delete on table organizations  to authenticated;
grant select, insert, update, delete on table memberships    to authenticated;
grant select, insert, update, delete on table documents      to authenticated;
grant select, insert, update, delete on table chunks         to authenticated;
grant select, insert, update, delete on table conversations  to authenticated;
grant select, insert, update, delete on table messages       to authenticated;
grant select, insert, update, delete on table api_keys       to authenticated;

grant select on table organizations  to anon;
grant select on table documents      to anon;
