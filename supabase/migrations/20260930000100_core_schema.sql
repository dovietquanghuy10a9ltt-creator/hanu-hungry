-- HANU Hungry core schema. Review before applying to a linked database.
-- Source CSV has one restaurant per STT and may have many dish rows per STT.

create schema if not exists extensions;
create extension if not exists unaccent with schema extensions;

create type public.app_role as enum ('USER', 'ADMIN');
create type public.blog_status as enum ('draft', 'published');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  student_code text not null unique
    constraint profiles_student_code_format check (student_code ~ '^[0-9]{10}$'),
  display_name text not null
    constraint profiles_display_name_nonblank check (length(btrim(display_name)) between 1 and 100),
  avatar_url text,
  role public.app_role not null default 'USER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  source_stt integer unique constraint restaurants_source_stt_positive check (source_stt > 0),
  name text not null constraint restaurants_name_nonblank check (length(btrim(name)) between 1 and 180),
  area text,
  address_text text,
  plus_code text,
  latitude numeric(9, 6) constraint restaurants_latitude_range check (latitude between -90 and 90),
  longitude numeric(9, 6) constraint restaurants_longitude_range check (longitude between -180 and 180),
  description text,
  image_url text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint restaurants_coordinates_pair check ((latitude is null) = (longitude is null))
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null constraint categories_name_nonblank check (length(btrim(name)) between 1 and 100),
  slug text not null unique
    constraint categories_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.restaurant_categories (
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (restaurant_id, category_id)
);

create table public.dishes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  source_key text unique constraint dishes_source_key_nonblank check (source_key is null or length(btrim(source_key)) > 0),
  source_row integer constraint dishes_source_row_positive check (source_row > 0),
  name text not null constraint dishes_name_nonblank check (length(btrim(name)) between 1 and 200),
  price_text text,
  price_min_vnd integer constraint dishes_price_min_nonnegative check (price_min_vnd >= 0),
  price_max_vnd integer constraint dishes_price_max_nonnegative check (price_max_vnd >= 0),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dishes_price_range check (
    price_max_vnd is null or
    (price_min_vnd is not null and price_max_vnd >= price_min_vnd)
  )
);

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete restrict,
  dish_id uuid references public.dishes (id) on delete set null,
  visited_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete restrict,
  rating integer constraint reviews_rating_range check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_content_required check (
    rating is not null or nullif(btrim(comment), '') is not null
  ),
  constraint reviews_comment_length check (comment is null or length(comment) <= 3000),
  constraint reviews_one_per_restaurant unique (user_id, restaurant_id)
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    constraint blog_posts_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null constraint blog_posts_title_nonblank check (length(btrim(title)) between 1 and 200),
  excerpt text,
  content text not null constraint blog_posts_content_nonblank check (length(btrim(content)) > 0),
  cover_image_url text,
  status public.blog_status not null default 'draft',
  published_at timestamptz,
  author_admin_id uuid not null references public.profiles (id) on delete restrict,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_posts_published_timestamp check (status <> 'published' or published_at is not null)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null constraint notifications_type_format check (type ~ '^[A-Z_]+$'),
  title text not null constraint notifications_title_nonblank check (length(btrim(title)) > 0),
  message text not null constraint notifications_message_nonblank check (length(btrim(message)) > 0),
  link text,
  blog_post_id uuid references public.blog_posts (id) on delete set null,
  audience text not null default 'ALL_USERS'
    constraint notifications_audience_check check (audience in ('ALL_USERS')),
  created_at timestamptz not null default now(),
  constraint notifications_blog_once unique (blog_post_id, type)
);

create table public.notification_reads (
  notification_id uuid not null references public.notifications (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null constraint contact_messages_name_nonblank check (length(btrim(name)) between 1 and 150),
  email text not null constraint contact_messages_email_nonblank check (length(btrim(email)) between 3 and 320),
  message text not null constraint contact_messages_message_nonblank check (length(btrim(message)) between 1 and 5000),
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key constraint site_settings_key_format check (key ~ '^[a-z0-9_]+$'),
  value jsonb not null,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index restaurants_active_name_idx on public.restaurants (is_active, name);
create index restaurants_area_idx on public.restaurants (area) where is_active;
create index restaurant_categories_category_idx on public.restaurant_categories (category_id, restaurant_id);
create index dishes_restaurant_active_idx on public.dishes (restaurant_id, is_active);
create index dishes_price_idx on public.dishes (price_min_vnd) where is_active and price_min_vnd is not null;
create index check_ins_user_visited_idx on public.check_ins (user_id, visited_at desc);
create index check_ins_restaurant_visited_idx on public.check_ins (restaurant_id, visited_at desc);
create index check_ins_dish_idx on public.check_ins (dish_id) where dish_id is not null;
create index reviews_restaurant_created_idx on public.reviews (restaurant_id, created_at desc);
create index reviews_user_created_idx on public.reviews (user_id, created_at desc);
create index blog_posts_status_published_idx on public.blog_posts (status, published_at desc);
create index notifications_audience_created_idx on public.notifications (audience, created_at desc);
create index notification_reads_user_idx on public.notification_reads (user_id, read_at desc);
create index admin_audit_logs_admin_created_idx on public.admin_audit_logs (admin_id, created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger restaurants_set_updated_at before update on public.restaurants
for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger dishes_set_updated_at before update on public.dishes
for each row execute function public.set_updated_at();
create trigger reviews_set_updated_at before update on public.reviews
for each row execute function public.set_updated_at();
create trigger blog_posts_set_updated_at before update on public.blog_posts
for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

create function public.prepare_blog_publish()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published'::public.blog_status and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger blog_posts_prepare_publish
before insert or update of status on public.blog_posts
for each row execute function public.prepare_blog_publish();

-- Supabase Auth alone owns passwords. The student code comes from signup metadata,
-- while role is deliberately never read from user-controlled metadata.
create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_student_code text;
begin
  new_student_code := btrim(coalesce(new.raw_user_meta_data ->> 'student_code', ''));
  if new.email is null or position('@' in new.email) <= 1 then
    raise exception 'An email address is required for HANU Hungry signup';
  end if;
  if new_student_code !~ '^[0-9]{10}$' then
    raise exception 'Student code must contain exactly 10 digits';
  end if;

  insert into public.profiles (id, student_code, display_name, role)
  values (
    new.id,
    new_student_code,
    split_part(new.email, '@', 1),
    'USER'::public.app_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- Column privileges provide the primary boundary; this trigger is defense in depth.
create function public.protect_profile_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.role() = 'authenticated' and (
    new.id is distinct from old.id or
    new.student_code is distinct from old.student_code or
    new.role is distinct from old.role or
    new.created_at is distinct from old.created_at
  ) then
    raise exception 'Profile identity and role cannot be changed by a signed-in user';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_identity
before update on public.profiles
for each row execute function public.protect_profile_identity();

create function public.validate_check_in_dish()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.dish_id is not null and not exists (
    select 1 from public.dishes d
    where d.id = new.dish_id and d.restaurant_id = new.restaurant_id
  ) then
    raise exception 'Selected dish does not belong to selected restaurant';
  end if;
  return new;
end;
$$;

create trigger check_ins_validate_dish
before insert or update of restaurant_id, dish_id on public.check_ins
for each row execute function public.validate_check_in_dish();

-- A publish transition creates one global notification, even after later edits.
create function public.notify_blog_publish()
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
  elsif tg_op = 'UPDATE' and new.status = 'published'::public.blog_status and
        (new.slug is distinct from old.slug or new.title is distinct from old.title or
         new.excerpt is distinct from old.excerpt) then
    update public.notifications
    set title = new.title,
        message = coalesce(nullif(btrim(new.excerpt), ''), 'Bài viết mới từ HANU Hungry'),
        link = '/blog/' || new.slug
    where blog_post_id = new.id and type = 'BLOG_PUBLISHED';
  end if;
  return new;
end;
$$;

create trigger blog_posts_notify_publish
after insert or update of status, slug, title, excerpt on public.blog_posts
for each row execute function public.notify_blog_publish();

create function public.audit_content_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  entity jsonb;
  action_name text;
  entity_key text;
begin
  -- Imports and owner maintenance use service_role and are not admin UI actions.
  if coalesce(auth.role(), '') <> 'authenticated' then
    return null;
  end if;

  if tg_op = 'DELETE' then
    entity := to_jsonb(old);
  else
    entity := to_jsonb(new);
  end if;
  action_name := lower(tg_op);
  if tg_table_name = 'blog_posts' and tg_op = 'UPDATE' then
    if old.status is distinct from new.status then
      action_name := case when new.status = 'published'::public.blog_status
        then 'publish' else 'unpublish' end;
    end if;
  end if;
  entity_key := coalesce(
    entity ->> 'id',
    (entity ->> 'restaurant_id') || ':' || (entity ->> 'category_id')
  );

  insert into public.admin_audit_logs (
    admin_id, action, entity_type, entity_id, metadata
  ) values (
    auth.uid(),
    action_name,
    tg_table_name,
    entity_key,
    jsonb_build_object('label', coalesce(entity ->> 'name', entity ->> 'title', entity ->> 'slug'))
  );
  return null;
end;
$$;

create trigger restaurants_admin_audit after insert or update or delete on public.restaurants
for each row execute function public.audit_content_change();
create trigger categories_admin_audit after insert or update or delete on public.categories
for each row execute function public.audit_content_change();
create trigger restaurant_categories_admin_audit after insert or update or delete on public.restaurant_categories
for each row execute function public.audit_content_change();
create trigger dishes_admin_audit after insert or update or delete on public.dishes
for each row execute function public.audit_content_change();
create trigger blog_posts_admin_audit after insert or update or delete on public.blog_posts
for each row execute function public.audit_content_change();
