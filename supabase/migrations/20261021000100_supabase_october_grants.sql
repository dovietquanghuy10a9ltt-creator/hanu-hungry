-- =====================================================================
-- Migration: 20261021000100_supabase_october_grants.sql
-- Purpose: Compliance with Supabase breaking change starting October 30.
--          Explicitly grants table access for Data API (PostgREST, GraphQL, supabase-js)
--          and configures default privileges for any future tables/sequences.
-- =====================================================================

-- 1. Ensure explicit grants for existing tables created in recent migrations

-- rate_limits (backend protection used by service_role via createAdminClient)
grant all on table public.rate_limits to service_role;

-- access_logs (audit logging)
grant select, insert on table public.access_logs to authenticated;
grant all on table public.access_logs to service_role;

-- Ensure all sequences in public schema have proper usage permissions
grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- 2. Configure default privileges for future tables created in schema "public"
--    (Ensures tables created after Oct 30 automatically receive required grants)

-- Automatically grant full privileges to service_role on future tables
alter default privileges in schema public
  grant all on tables to service_role;

-- Automatically grant SELECT to authenticated and anon on future tables
alter default privileges in schema public
  grant select on tables to authenticated, anon;

-- Automatically grant sequence permissions on future sequences
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated, service_role;
