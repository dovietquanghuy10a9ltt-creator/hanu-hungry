import type { RestaurantSummary } from "./types";

export type CatalogDish = { id: string; name: string; price_min_vnd: number | null; price_max_vnd: number | null; price_text: string | null };
export type CatalogRestaurant = RestaurantSummary & { category_slugs: string[]; dishes: CatalogDish[] };

export function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
}

export function parseMaxPrice(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const cleaned = value.replace(/[. ,]/g, "");
  if (!/^\d+$/.test(cleaned)) return undefined;
  const price = Number(cleaned);
  return Number.isSafeInteger(price) && price > 0 && price <= 10000000 ? price : undefined;
}

export function filterCatalog(catalog: CatalogRestaurant[], query: string, category: string, maxPrice?: number) {
  const q = normalizeSearch(query);
  return catalog.filter((restaurant) => {
    if (category && !restaurant.category_slugs.includes(category)) return false;
    const restaurantMatches = !q || normalizeSearch([restaurant.name, ...(restaurant.categories ?? [])].join(" ")).includes(q);
    const matchingDishes = restaurant.dishes.filter((dish) => (!q || restaurantMatches || normalizeSearch(dish.name).includes(q)) && (maxPrice === undefined || (dish.price_min_vnd !== null && dish.price_min_vnd <= maxPrice)));
    return maxPrice === undefined ? restaurantMatches || matchingDishes.length > 0 : matchingDishes.length > 0;
  });
}

export function dishSuggestions(catalog: CatalogRestaurant[], query: string, maxPrice?: number) {
  const q = normalizeSearch(query);
  if (!q) return [];
  return catalog.flatMap((restaurant) => restaurant.dishes
    .filter((dish) => normalizeSearch(dish.name).includes(q) && (maxPrice === undefined || (dish.price_min_vnd !== null && dish.price_min_vnd <= maxPrice)))
    .map((dish) => ({ ...dish, restaurantId: restaurant.id, restaurantName: restaurant.name })))
    .sort((a, b) => Number(!normalizeSearch(a.name).startsWith(q)) - Number(!normalizeSearch(b.name).startsWith(q)) || a.name.localeCompare(b.name, "vi"))
    .slice(0, 6);
}
