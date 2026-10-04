"use server";

import { listCatalog } from "@/features/restaurants/catalog";
import { pickRandom } from "@/features/gacha/random";
import type { CatalogDish, CatalogRestaurant } from "@/features/restaurants/search";
import type { RestaurantSummary } from "@/features/restaurants/types";

export type GachaResult = { restaurant: RestaurantSummary; dish: CatalogDish | null };

export async function rollGacha(mode: string): Promise<{ result: GachaResult | null; error: string | null }> {
  if (mode !== "restaurant" && mode !== "dish") return { result: null, error: "Chọn chế độ quán hoặc món để bắt đầu." };
  try {
    const catalog = await listCatalog();
    const choices: { restaurant: CatalogRestaurant; dish: CatalogDish | null }[] = mode === "dish"
      ? catalog.flatMap((restaurant) => restaurant.dishes.map((dish) => ({ restaurant, dish })))
      : catalog.map((restaurant) => ({ restaurant, dish: null }));
    const selected = pickRandom(choices);
    if (!selected) return { result: null, error: "Chưa có lựa chọn phù hợp. Thử chế độ khác nhé." };
    const source = selected.restaurant;
    const restaurant: RestaurantSummary = { id: source.id, name: source.name, area: source.area, address_text: source.address_text, image_url: source.image_url, min_price_vnd: source.min_price_vnd, categories: source.categories };
    return { result: { restaurant, dish: selected.dish }, error: null };
  } catch {
    return { result: null, error: "Vũ trụ đang mất sóng. Bạn thử quay lại nhé." };
  }
}
