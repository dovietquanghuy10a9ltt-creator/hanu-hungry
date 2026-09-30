-- Keep INSERT paths separate from UPDATE paths: OLD is unavailable on INSERT.
create or replace function public.notify_blog_publish()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  newly_published boolean;
begin
  if tg_op = 'INSERT' then
    newly_published := new.status = 'published'::public.blog_status;
  else
    newly_published := new.status = 'published'::public.blog_status and
      old.status is distinct from new.status;
  end if;

  if newly_published then
    insert into public.notifications (type, title, message, link, blog_post_id, audience)
    values (
      'BLOG_PUBLISHED',
      new.title,
      coalesce(nullif(btrim(new.excerpt), ''), 'Bài viết mới từ HANU Hungry'),
      '/blog/' || new.slug,
      new.id,
      'ALL_USERS'
    )
    on conflict (blog_post_id, type) do update
      set title = excluded.title,
          message = excluded.message,
          link = excluded.link;
  end if;

  if tg_op = 'UPDATE' then
    if not newly_published and new.status = 'published'::public.blog_status and
       (new.slug is distinct from old.slug or new.title is distinct from old.title or
        new.excerpt is distinct from old.excerpt) then
      update public.notifications
      set title = new.title,
          message = coalesce(nullif(btrim(new.excerpt), ''), 'Bài viết mới từ HANU Hungry'),
          link = '/blog/' || new.slug
      where blog_post_id = new.id and type = 'BLOG_PUBLISHED';
    end if;
  end if;

  return new;
end;
$$;
