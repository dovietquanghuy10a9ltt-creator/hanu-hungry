"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createCheckIn(formData: FormData) {
  const restaurantId = String(formData.get("restaurantId") || "");
  const dishId = String(formData.get("dishId") || "");
  if (!uuid.test(restaurantId) || (dishId && !uuid.test(dishId))) throw new Error("Quán hoặc món không hợp lệ.");

  const { user } = await requireUser();
  const supabase = await createClient();
  const { data: restaurant } = await supabase.from("restaurants").select("id").eq("id", restaurantId).eq("is_active", true).maybeSingle();
  if (!restaurant) throw new Error("Quán không còn khả dụng.");
  if (dishId) {
    const { data: dish } = await supabase.from("dishes").select("id").eq("id", dishId).eq("restaurant_id", restaurantId).eq("is_active", true).maybeSingle();
    if (!dish) throw new Error("Món không thuộc quán này.");
  }
  const { error } = await supabase.from("check_ins").insert({
    user_id: user.id,
    restaurant_id: restaurantId,
    dish_id: dishId || null,
  });
  if (error) throw new Error("Không lưu được lần đã ăn. Vui lòng thử lại.");
  revalidatePath("/history");
  revalidatePath("/profile");
  redirect("/history?added=1");
}

export async function deleteCheckIn(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!uuid.test(id)) throw new Error("Lần đã ăn không hợp lệ.");
  const { user } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("check_ins").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error("Không xóa được lịch sử. Vui lòng thử lại.");
  revalidatePath("/history");
  revalidatePath("/profile");
}
