"use server";

import { listCatalog } from "@/features/restaurants/catalog";
import { isDrinkDish, pickRandom } from "@/features/gacha/random";
import type { CatalogDish, CatalogRestaurant } from "@/features/restaurants/search";
import type { RestaurantSummary } from "@/features/restaurants/types";

export type GachaResult = { restaurant: RestaurantSummary; dish: CatalogDish | null };
export { isDrinkDish };

export async function rollGacha(mode: string): Promise<{ result: GachaResult | null; error: string | null }> {
  const normalizedMode = mode === "dish" ? "food" : mode;
  if (normalizedMode !== "restaurant" && normalizedMode !== "food" && normalizedMode !== "drink") {
    return { result: null, error: "Chọn chế độ quán, đồ ăn hoặc đồ uống để bắt đầu." };
  }
  try {
    const catalog = await listCatalog();
    let choices: { restaurant: CatalogRestaurant; dish: CatalogDish | null }[] = [];

    if (normalizedMode === "restaurant") {
      choices = catalog.map((restaurant) => ({ restaurant, dish: null }));
    } else if (normalizedMode === "food") {
      choices = catalog.flatMap((restaurant) =>
        restaurant.dishes
          .filter((dish) => !isDrinkDish(dish.name, restaurant.category_slugs))
          .map((dish) => ({ restaurant, dish }))
      );
    } else if (normalizedMode === "drink") {
      choices = catalog.flatMap((restaurant) =>
        restaurant.dishes
          .filter((dish) => isDrinkDish(dish.name, restaurant.category_slugs))
          .map((dish) => ({ restaurant, dish }))
      );
    }

    const selected = pickRandom(choices);
    if (!selected) return { result: null, error: "Chưa có lựa chọn phù hợp. Thử chế độ khác nhé." };
    const source = selected.restaurant;
    const restaurant: RestaurantSummary = {
      id: source.id,
      name: source.name,
      area: source.area,
      address_text: source.address_text,
      image_url: source.image_url,
      min_price_vnd: source.min_price_vnd,
      max_price_vnd: source.max_price_vnd,
      categories: source.categories,
    };
    return { result: { restaurant, dish: selected.dish }, error: null };
  } catch {
    return { result: null, error: "Vũ trụ đang mất sóng. Bạn thử quay lại nhé." };
  }
}
