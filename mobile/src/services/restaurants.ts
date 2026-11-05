import { supabase } from "../lib/supabase";
import type { Restaurant, Dish, Category, CheckIn } from "../types";

/**
 * Lấy danh sách toàn bộ quán ăn đang hoạt động kèm danh mục
 */
export async function getActiveRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from("restaurants")
    .select(`
      id,
      source_stt,
      name,
      area,
      address_text,
      plus_code,
      latitude,
      longitude,
      description,
      image_url,
      notes,
      is_active,
      restaurant_categories (
        category_id,
        categories (
          id,
          name,
          slug
        )
      )
    `)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error || !data) {
    console.error("Lỗi khi tải quán ăn:", error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    source_stt: item.source_stt,
    name: item.name,
    area: item.area,
    address_text: item.address_text,
    plus_code: item.plus_code,
    latitude: item.latitude,
    longitude: item.longitude,
    description: item.description,
    image_url: item.image_url,
    notes: item.notes,
    is_active: item.is_active,
    categories: (item.restaurant_categories || [])
      .map((rc: any) => rc.categories)
      .filter(Boolean),
  }));
}

/**
 * Lấy chi tiết quán ăn kèm danh sách món ăn
 */
export async function getRestaurantDetails(id: string): Promise<{
  restaurant: Restaurant | null;
  dishes: Dish[];
}> {
  const [resData, dishesData] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    supabase.from("dishes").select("*").eq("restaurant_id", id).eq("is_active", true),
  ]);

  return {
    restaurant: resData.data || null,
    dishes: dishesData.data || [],
  };
}

/**
 * Lấy danh sách tất cả các món ăn (dành cho vòng quay Gacha)
 */
export async function getGachaCandidates(maxBudget?: number): Promise<
  Array<Dish & { restaurantName?: string }>
> {
  let query = supabase
    .from("dishes")
    .select(`
      id,
      restaurant_id,
      name,
      price_text,
      price_min_vnd,
      price_max_vnd,
      image_url,
      notes,
      is_active,
      restaurants (
        name
      )
    `)
    .eq("is_active", true);

  if (maxBudget && maxBudget > 0) {
    query = query.lte("price_min_vnd", maxBudget);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((item: any) => ({
    id: item.id,
    restaurant_id: item.restaurant_id,
    name: item.name,
    price_text: item.price_text,
    price_min_vnd: item.price_min_vnd,
    price_max_vnd: item.price_max_vnd,
    image_url: item.image_url,
    notes: item.notes,
    is_active: item.is_active,
    restaurantName: item.restaurants?.name || "Quán ăn HANU",
  }));
}

/**
 * Thực hiện Check-in tại quán ăn
 */
export async function recordCheckIn(
  userId: string,
  restaurantId: string,
  dishId?: string | null
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("check_ins").insert({
    user_id: userId,
    restaurant_id: restaurantId,
    dish_id: dishId || null,
    visited_at: new Date().toISOString(),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Lấy lịch sử Check-in của người dùng
 */
export async function getUserCheckIns(userId: string): Promise<CheckIn[]> {
  const { data, error } = await supabase
    .from("check_ins")
    .select(`
      id,
      user_id,
      restaurant_id,
      dish_id,
      visited_at,
      restaurants (
        name
      ),
      dishes (
        name
      )
    `)
    .eq("user_id", userId)
    .order("visited_at", { ascending: false });

  if (error || !data) return [];

  return data.map((item: any) => ({
    id: item.id,
    user_id: item.user_id,
    restaurant_id: item.restaurant_id,
    dish_id: item.dish_id,
    visited_at: item.visited_at,
    restaurant: item.restaurants,
    dish: item.dishes,
  }));
}

