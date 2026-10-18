import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CatalogRestaurant } from "./search";

/** Public catalog only. No profiles or private user data enter the browser. */
export const listCatalog = cache(async function listCatalog(): Promise<CatalogRestaurant[]> {
  const supabase = await createClient();
  let { data, error } = await supabase.from("restaurants")
    .select("id,name,area,address_text,image_url,dishes(id,name,price_text,price_min_vnd,price_max_vnd,is_active),restaurant_categories(categories(name,slug))")
    .eq("is_active", true).order("name");

  if (error) {
    console.warn("[listCatalog] Standard client query failed, falling back to admin client:", error.message);
    try {
      const admin = createAdminClient();
      const fallback = await admin.from("restaurants")
        .select("id,name,area,address_text,image_url,dishes(id,name,price_text,price_min_vnd,price_max_vnd,is_active),restaurant_categories(categories(name,slug))")
        .eq("is_active", true).order("name");
      if (!fallback.error && fallback.data) {
        data = fallback.data;
        error = null;
      }
    } catch (adminErr) {
      console.error("[listCatalog] Admin client fallback error:", adminErr);
    }
  }

  if (error) {
    console.error("[listCatalog] Final error fetching catalog:", error);
    throw new Error("Không thể tải danh sách quán. Vui lòng thử lại.");
  }

  const checkInCounts = new Map<string, number>();
  try {
    const admin = createAdminClient();
    const { data: checkIns } = await admin.from("check_ins").select("restaurant_id");
    if (checkIns) {
      for (const ci of checkIns) {
        if (ci.restaurant_id) {
          checkInCounts.set(ci.restaurant_id, (checkInCounts.get(ci.restaurant_id) ?? 0) + 1);
        }
      }
    }
  } catch (err) {
    console.error("[listCatalog] Check-in count aggregation error:", err instanceof Error ? err.message : err);
  }

  return (data ?? []).map((restaurant) => {
    const dishes = restaurant.dishes.filter((dish) => dish.is_active);
    const minPrices = dishes.flatMap((dish) => dish.price_min_vnd === null ? [] : [dish.price_min_vnd]);
    const maxPrices = dishes.flatMap((dish) => {
      const p = dish.price_max_vnd ?? dish.price_min_vnd;
      return p === null ? [] : [p];
    });
    return {
      id: restaurant.id, name: restaurant.name, area: restaurant.area, address_text: restaurant.address_text,
      image_url: restaurant.image_url, dishes,
      min_price_vnd: minPrices.length ? Math.min(...minPrices) : null,
      max_price_vnd: maxPrices.length ? Math.max(...maxPrices) : null,
      categories: restaurant.restaurant_categories.flatMap((item) => item.categories ? [item.categories.name] : []),
      category_slugs: restaurant.restaurant_categories.flatMap((item) => item.categories ? [item.categories.slug] : []),
      check_in_count: checkInCounts.get(restaurant.id) ?? 0,
    };
  });
}
