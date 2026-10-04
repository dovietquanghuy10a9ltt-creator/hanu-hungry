-- Data API access is explicit. RLS is enabled on every public table.

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'ADMIN'::public.app_role
  );
$$;

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.categories enable row level security;
alter table public.restaurant_categories enable row level security;
alter table public.dishes enable row level security;
alter table public.check_ins enable row level security;
alter table public.reviews enable row level security;
alter table public.blog_posts enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_reads enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Supabase may grant broad public-schema table privileges by default. Start closed.
revoke all on table
  public.profiles,
  public.restaurants,
  public.categories,
  public.restaurant_categories,
  public.dishes,
  public.check_ins,
  public.reviews,
  public.blog_posts,
  public.notifications,
  public.notification_reads,
  public.contact_messages,
  public.site_settings,
  public.admin_audit_logs
from public, anon, authenticated;

grant all on table
  public.profiles,
  public.restaurants,
  public.categories,
  public.restaurant_categories,
  public.dishes,
  public.check_ins,
  public.reviews,
  public.blog_posts,
  public.notifications,
  public.notification_reads,
  public.contact_messages,
  public.site_settings,
  public.admin_audit_logs
to service_role;

grant select on public.profiles to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

grant select on
  public.restaurants,
  public.categories,
  public.restaurant_categories,
  public.dishes,
  public.reviews
to anon;

grant select, insert, update, delete on
  public.restaurants,
  public.categories,
  public.restaurant_categories,
  public.dishes
to authenticated;

grant select, delete on public.check_ins to authenticated;
grant insert (user_id, restaurant_id, dish_id, visited_at) on public.check_ins to authenticated;
grant update (restaurant_id, dish_id, visited_at) on public.check_ins to authenticated;

grant select, delete on public.reviews to authenticated;
grant insert (user_id, restaurant_id, rating, comment) on public.reviews to authenticated;
grant update (rating, comment) on public.reviews to authenticated;

grant select, delete on public.blog_posts to authenticated;
grant insert (
  slug, title, excerpt, content, cover_image_url, status, published_at,
  author_admin_id, seo_title, seo_description
) on public.blog_posts to authenticated;
grant update (
  slug, title, excerpt, content, cover_image_url, status, published_at,
  seo_title, seo_description
) on public.blog_posts to authenticated;
grant select on public.blog_posts to anon;
grant select on public.notifications to authenticated;
grant select, insert, delete on public.notification_reads to authenticated;
grant update (read_at) on public.notification_reads to authenticated;
grant insert (notification_id, user_id, read_at) on public.notification_reads to authenticated;
grant insert (user_id, name, email, message) on public.contact_messages to authenticated;
grant select on public.site_settings to anon, authenticated;
grant select on public.admin_audit_logs to authenticated;

create policy profiles_select_own on public.profiles
for select to authenticated
using (id = (select auth.uid()));

create policy profiles_update_own on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy restaurants_select on public.restaurants
for select to authenticated
using (is_active or (select public.is_admin()));
create policy restaurants_select_active_anon on public.restaurants
for select to anon using (is_active);

create policy restaurants_admin_insert on public.restaurants
for insert to authenticated
with check ((select public.is_admin()));
create policy restaurants_admin_update on public.restaurants
for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));
create policy restaurants_admin_delete on public.restaurants
for delete to authenticated
using ((select public.is_admin()));

create policy categories_select on public.categories
for select to authenticated using (true);
create policy categories_select_anon on public.categories
for select to anon using (true);
create policy categories_admin_insert on public.categories
for insert to authenticated with check ((select public.is_admin()));
create policy categories_admin_update on public.categories
for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy categories_admin_delete on public.categories
for delete to authenticated using ((select public.is_admin()));

create policy restaurant_categories_select on public.restaurant_categories
for select to authenticated
using (
  (select public.is_admin()) or exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id and r.is_active
  )
);
create policy restaurant_categories_select_anon on public.restaurant_categories
for select to anon
using (exists (
  select 1 from public.restaurants r
  where r.id = restaurant_id and r.is_active
));
create policy restaurant_categories_admin_insert on public.restaurant_categories
for insert to authenticated with check ((select public.is_admin()));
create policy restaurant_categories_admin_update on public.restaurant_categories
for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy restaurant_categories_admin_delete on public.restaurant_categories
for delete to authenticated using ((select public.is_admin()));

create policy dishes_select on public.dishes
for select to authenticated
using (
  (select public.is_admin()) or (
    is_active and exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.is_active
    )
  )
);
create policy dishes_select_active_anon on public.dishes
for select to anon
using (is_active and exists (
  select 1 from public.restaurants r
  where r.id = restaurant_id and r.is_active
));
create policy dishes_admin_insert on public.dishes
for insert to authenticated with check ((select public.is_admin()));
create policy dishes_admin_update on public.dishes
for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy dishes_admin_delete on public.dishes
for delete to authenticated using ((select public.is_admin()));

create policy check_ins_select_own on public.check_ins
for select to authenticated
using (user_id = (select auth.uid()));
create policy check_ins_insert_own on public.check_ins
for insert to authenticated
with check (user_id = (select auth.uid()) and exists (
  select 1 from public.restaurants r where r.id = restaurant_id and r.is_active
));
create policy check_ins_update_own on public.check_ins
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()) and exists (
  select 1 from public.restaurants r where r.id = restaurant_id and r.is_active
));
create policy check_ins_delete_own on public.check_ins
for delete to authenticated
using (user_id = (select auth.uid()));

create policy reviews_select on public.reviews
for select to authenticated
using (
  user_id = (select auth.uid()) or exists (
    select 1 from public.restaurants r where r.id = restaurant_id and r.is_active
  )
);
create policy reviews_select_active_anon on public.reviews
for select to anon
using (exists (
  select 1 from public.restaurants r
  where r.id = restaurant_id and r.is_active
));
create policy reviews_insert_own on public.reviews
for insert to authenticated
with check (user_id = (select auth.uid()) and exists (
  select 1 from public.restaurants r where r.id = restaurant_id and r.is_active
));
create policy reviews_update_own on public.reviews
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
create policy reviews_delete_own on public.reviews
for delete to authenticated
using (user_id = (select auth.uid()));

create policy blog_posts_select_published_anon on public.blog_posts
for select to anon using (status = 'published'::public.blog_status);
create policy blog_posts_select_authenticated on public.blog_posts
for select to authenticated
using (status = 'published'::public.blog_status or (select public.is_admin()));
create policy blog_posts_admin_insert on public.blog_posts
for insert to authenticated
with check ((select public.is_admin()) and author_admin_id = (select auth.uid()));
create policy blog_posts_admin_update on public.blog_posts
for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy blog_posts_admin_delete on public.blog_posts
for delete to authenticated using ((select public.is_admin()));

create policy notifications_select_all_users on public.notifications
for select to authenticated using (audience = 'ALL_USERS');

create policy notification_reads_select_own on public.notification_reads
for select to authenticated using (user_id = (select auth.uid()));
create policy notification_reads_insert_own on public.notification_reads
for insert to authenticated
with check (user_id = (select auth.uid()) and exists (
  select 1 from public.notifications n
  where n.id = notification_id and n.audience = 'ALL_USERS'
));
create policy notification_reads_update_own on public.notification_reads
for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notification_reads_delete_own on public.notification_reads
for delete to authenticated using (user_id = (select auth.uid()));

create policy contact_messages_insert_own on public.contact_messages
for insert to authenticated with check (user_id = (select auth.uid()));

-- Settings contain only public branding/contact values, never secrets.
create policy site_settings_select_public on public.site_settings
for select to anon, authenticated using (true);

create policy admin_audit_logs_select_admin on public.admin_audit_logs
for select to authenticated using ((select public.is_admin()));

-- The dataset is small, so using unaccent at query time keeps Vietnamese search
-- correct without requiring a mutable-dictionary expression index.
create function public.normalize_search(input_text text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select lower(extensions.unaccent(coalesce(input_text, '')));
$$;

create function public.search_restaurants(
  query text default null,
  category_slug text default null,
  max_price_vnd integer default null,
  limit_count integer default 24
)
returns table (
  id uuid,
  name text,
  area text,
  address_text text,
  image_url text,
  min_price_vnd integer,
  categories text[]
)
language sql
stable
security invoker
set search_path = ''
as $$
  with params as (
    select nullif(public.normalize_search(left(btrim(query), 200)), '') as q,
           nullif(lower(btrim(category_slug)), '') as category_filter
  )
  select
    r.id,
    r.name,
    r.area,
    r.address_text,
    r.image_url,
    (
      select min(d.price_min_vnd)
      from public.dishes d
      where d.restaurant_id = r.id and d.is_active and d.price_min_vnd is not null
    ) as min_price_vnd,
    coalesce((
      select array_agg(c.name order by c.name)
      from public.restaurant_categories rc
      join public.categories c on c.id = rc.category_id
      where rc.restaurant_id = r.id
    ), array[]::text[]) as categories
  from public.restaurants r
  cross join params p
  where r.is_active
    and (p.category_filter is null or exists (
      select 1
      from public.restaurant_categories rc
      join public.categories c on c.id = rc.category_id
      where rc.restaurant_id = r.id and c.slug = p.category_filter
    ))
    and (max_price_vnd is null or exists (
      select 1 from public.dishes d
      where d.restaurant_id = r.id and d.is_active
        and d.price_min_vnd is not null and d.price_min_vnd <= max_price_vnd
    ))
    and (p.q is null or
      position(p.q in public.normalize_search(r.name)) > 0 or
      exists (
        select 1 from public.dishes d
        where d.restaurant_id = r.id and d.is_active
          and position(p.q in public.normalize_search(d.name)) > 0
      ) or
      exists (
        select 1
        from public.restaurant_categories rc
        join public.categories c on c.id = rc.category_id
        where rc.restaurant_id = r.id
          and position(p.q in public.normalize_search(c.name)) > 0
      )
    )
  order by
    case when p.q is not null and public.normalize_search(r.name) = p.q then 0 else 1 end,
    r.name,
    r.id
  limit least(greatest(coalesce(limit_count, 24), 1), 100);
$$;

-- Returns aggregates only; a content admin cannot read individual users' check-ins.
create function public.admin_analytics()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'total_restaurants', (select count(*) from public.restaurants where is_active),
    'total_dishes', (select count(*) from public.dishes where is_active),
    'total_check_ins', (select count(*) from public.check_ins),
    'total_reviews', (select count(*) from public.reviews),
    'average_rating', (select round(avg(rating)::numeric, 2) from public.reviews where rating is not null),
    'top_restaurants', coalesce((
      select jsonb_agg(to_jsonb(t)) from (
        select r.id, r.name, count(ci.id) as check_ins
        from public.restaurants r
        join public.check_ins ci on ci.restaurant_id = r.id
        group by r.id, r.name
        order by check_ins desc, r.name
        limit 10
      ) t
    ), '[]'::jsonb),
    'popular_categories', coalesce((
      select jsonb_agg(to_jsonb(t)) from (
        select c.id, c.name, count(ci.id) as check_ins
        from public.categories c
        join public.restaurant_categories rc on rc.category_id = c.id
        join public.check_ins ci on ci.restaurant_id = rc.restaurant_id
        group by c.id, c.name
        order by check_ins desc, c.name
        limit 10
      ) t
    ), '[]'::jsonb),
    'activity_by_day', coalesce((
      select jsonb_agg(to_jsonb(t)) from (
        select (ci.visited_at at time zone 'Asia/Ho_Chi_Minh')::date as day,
               count(*) as check_ins
        from public.check_ins ci
        group by (ci.visited_at at time zone 'Asia/Ho_Chi_Minh')::date
        order by day desc
        limit 30
      ) t
    ), '[]'::jsonb),
    'popular_dishes', coalesce((
      select jsonb_agg(to_jsonb(t)) from (
        select d.id, d.name, count(ci.id) as check_ins
        from public.dishes d
        join public.check_ins ci on ci.dish_id = d.id
        group by d.id, d.name
        order by check_ins desc, d.name
        limit 10
      ) t
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.normalize_search(text) from public;
revoke all on function public.search_restaurants(text, text, integer, integer) from public;
revoke all on function public.admin_analytics() from public, anon;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.prepare_blog_publish() from public, anon, authenticated;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.protect_profile_identity() from public, anon, authenticated;
revoke all on function public.validate_check_in_dish() from public, anon, authenticated;
revoke all on function public.notify_blog_publish() from public, anon, authenticated;
revoke all on function public.audit_content_change() from public, anon, authenticated;

grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.normalize_search(text) to anon, authenticated, service_role;
grant execute on function public.search_restaurants(text, text, integer, integer) to anon, authenticated, service_role;
grant execute on function public.admin_analytics() to authenticated, service_role;
