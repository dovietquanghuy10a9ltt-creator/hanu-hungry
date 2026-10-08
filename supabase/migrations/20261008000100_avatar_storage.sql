-- Storage configuration for user profile avatars.
-- Ensures the avatars bucket exists, is public, and has proper size & MIME constraints.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage RLS policies for avatars
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update their own avatar"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  );
