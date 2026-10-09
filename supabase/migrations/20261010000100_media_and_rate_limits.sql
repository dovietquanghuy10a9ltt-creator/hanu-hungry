-- 1. Storage buckets for restaurants, dishes, and blog media
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('restaurants', 'restaurants', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('blog', 'blog', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('dishes', 'dishes', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage RLS policies for admin media
create policy "Public can view media"
  on storage.objects for select
  using (bucket_id in ('restaurants', 'blog', 'dishes'));

create policy "Admins can upload media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('restaurants', 'blog', 'dishes') and
    (select role from public.profiles where id = auth.uid()) = 'ADMIN'
  );

create policy "Admins can update media"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('restaurants', 'blog', 'dishes') and
    (select role from public.profiles where id = auth.uid()) = 'ADMIN'
  );

create policy "Admins can delete media"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('restaurants', 'blog', 'dishes') and
    (select role from public.profiles where id = auth.uid()) = 'ADMIN'
  );

-- 2. Optional image_url column on dishes
alter table public.dishes add column if not exists image_url text;

-- 3. Rate limits table for brute-force & spam protection
create table if not exists public.rate_limits (
  key text primary key,
  attempts int not null default 1,
  first_attempt_at timestamptz not null default now(),
  last_attempt_at timestamptz not null default now(),
  blocked_until timestamptz
);

alter table public.rate_limits enable row level security;

