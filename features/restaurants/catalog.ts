import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CatalogRestaurant } from "./search";

/** Helper to identify common side dishes, extra toppings, free items or basic add-on beverages. */
function isSideDishOrAddon(dishName: string, price: number | null): boolean {
  if (price === 0) return true;
  const lower = dishName.toLowerCase().trim();
  if (
    /(thêm|gọi thêm|quẩy|trứng thêm|bò thêm|chả thêm|thịt thêm|topping|nha đam|trân châu|thạch|khăn lạnh|trà đá|nước lọc|coca|pepsi|sting|nem chua rán \(1|nem rán lẻ|xiên lẻ)/iu.test(
      lower
    )
  ) {
    return true;
  }
  return false;
}

/** Public catalog only. No profiles or private user data enter the browser. */
export const listCatalog = cache(async function listCatalog(): Promise<CatalogRestaurant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select(
      "id,name,area,address_text,image_url,dishes(id,name,price_text,price_min_vnd,price_max_vnd,is_active),restaurant_categories(categories(name,slug))"
    )
    .eq("is_active", true)
    .order("name");
  if (error) throw new Error("Không thể tải danh sách quán. Vui lòng thử lại.");

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
    const activeDishes = restaurant.dishes.filter((dish) => dish.is_active);
    const validPricedDishes = activeDishes.filter(
      (d) => d.price_min_vnd !== null && d.price_min_vnd > 0
    );

    // Identify if the restaurant has substantial main meals (e.g. >= 20,000 VND)
    const hasSubstantialMeals = validPricedDishes.some(
      (d) => (d.price_min_vnd ?? 0) >= 20000
    );

    // Filter for main dishes: if substantial meals exist, exclude cheap sides/add-ons/free items (< 18,000 VND or matched by keywords)
    const mainDishes = validPricedDishes.filter((dish) => {
      if (hasSubstantialMeals) {
        const price = dish.price_min_vnd ?? 0;
        if (price < 18000 || isSideDishOrAddon(dish.name, dish.price_min_vnd)) {
          return false;
        }
      }
      return true;
    });

    // Fallback to all valid priced dishes if no main dish was isolated (e.g. snack stalls or drink shops)
    const effectiveDishes = mainDishes.length > 0 ? mainDishes : validPricedDishes;

    const minPrices = effectiveDishes.flatMap((dish) =>
      dish.price_min_vnd === null ? [] : [dish.price_min_vnd]
    );
    const maxPrices = effectiveDishes.flatMap((dish) => {
      const p = dish.price_max_vnd ?? dish.price_min_vnd;
      return p === null ? [] : [p];
    });

    return {
      id: restaurant.id,
      name: restaurant.name,
      area: restaurant.area,
      address_text: restaurant.address_text,
      image_url: restaurant.image_url,
      dishes: activeDishes,
      min_price_vnd: minPrices.length ? Math.min(...minPrices) : null,
      max_price_vnd: maxPrices.length ? Math.max(...maxPrices) : null,
      categories: restaurant.restaurant_categories.flatMap((item) =>
        item.categories ? [item.categories.name] : []
      ),
      category_slugs: restaurant.restaurant_categories.flatMap((item) =>
        item.categories ? [item.categories.slug] : []
      ),
      check_in_count: checkInCounts.get(restaurant.id) ?? 0,
    };
  });
});
