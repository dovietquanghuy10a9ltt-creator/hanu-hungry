-- A selected dish must belong to the restaurant and be active when chosen.
-- Existing check-ins remain valid if an admin deactivates that dish later.
create or replace function public.validate_check_in_dish()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new.dish_id is not distinct from old.dish_id and
       new.restaurant_id is not distinct from old.restaurant_id then
      return new;
    end if;
  end if;

  if new.dish_id is not null and not exists (
    select 1
    from public.dishes d
    where d.id = new.dish_id
      and d.restaurant_id = new.restaurant_id
      and d.is_active
  ) then
    raise exception 'Selected dish must be active and belong to selected restaurant';
  end if;

  return new;
end;
$$;
