import { createClient } from "@/lib/supabase/server";
import type { RestaurantDetail, RestaurantSummary } from "./types";

export type RestaurantFilters = {
  query?: string;
  category?: string;
  maxPrice?: number;
  limit?: number;
};

export async function listRestaurants(filters: RestaurantFilters = {}): Promise<RestaurantSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_restaurants", {
    query: filters.query?.trim() || undefined,
    category_slug: filters.category || undefined,
    max_price_vnd: filters.maxPrice,
    limit_count: filters.limit ?? 24,
  });
  if (error) throw new Error(`Không thể tải danh sách quán: ${error.message}`);
  return (data ?? []) as RestaurantSummary[];
}

export async function listCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("id, name, slug").order("name");
  if (error) throw new Error(`Không thể tải danh mục: ${error.message}`);
  return data ?? [];
}

export async function getRestaurant(id: string): Promise<RestaurantDetail | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("restaurants")
    .select("id,name,area,address_text,plus_code,latitude,longitude,description,image_url,notes,dishes(id,name,price_text,price_min_vnd,price_max_vnd,notes,is_active),restaurant_categories(categories(id,name,slug))")
    .eq("id", id).eq("is_active", true).maybeSingle();
  if (error) throw new Error(`Không thể tải quán: ${error.message}`);
  if (!data) return null;
  return data as unknown as RestaurantDetail;
}
