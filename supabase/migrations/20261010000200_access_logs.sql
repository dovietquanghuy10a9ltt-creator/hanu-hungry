-- 20261010000200_access_logs.sql
-- User access logs for admin tracking

create table if not exists public.access_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  student_code text,
  display_name text,
  path text not null,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_access_logs_created_at on public.access_logs(created_at desc);
create index if not exists idx_access_logs_user_id on public.access_logs(user_id);
create index if not exists idx_access_logs_student_code on public.access_logs(student_code);

alter table public.access_logs enable row level security;

-- Admin can read all access logs
create policy "admin_read_access_logs"
  on public.access_logs
  for select
  to authenticated
  using (public.is_admin());

-- Users can insert their own access logs if logging directly from client
create policy "users_insert_own_access_logs"
  on public.access_logs
  for insert
  to authenticated
  with check (auth.uid() = user_id or user_id is null);

grant select, insert on public.access_logs to authenticated;
grant all on public.access_logs to service_role;

