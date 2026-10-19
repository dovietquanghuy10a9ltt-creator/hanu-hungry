"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";

export async function createCheckIn(formData: FormData) {
  const restaurantId = String(formData.get("restaurantId") || "");
  const dishId = String(formData.get("dishId") || "");
  if (!isUuid(restaurantId) || (dishId && !isUuid(dishId))) throw new Error("Quán hoặc món không hợp lệ.");

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
  if (!isUuid(id)) throw new Error("Lần đã ăn không hợp lệ.");
  const { user } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("check_ins").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error("Không xóa được lịch sử. Vui lòng thử lại.");
  revalidatePath("/history");
  revalidatePath("/profile");
}

export async function quickCheckIn(restaurantId: string): Promise<{ success: boolean; message: string }> {
  if (!isUuid(restaurantId)) {
    return { success: false, message: "Quán không hợp lệ." };
  }

  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("id", restaurantId)
    .eq("is_active", true)
    .maybeSingle();

  if (!restaurant) {
    return { success: false, message: "Quán không còn khả dụng hoặc đã ngừng hoạt động." };
  }

  // Anti-spam: prevent rapid double check-in within 15 seconds
  const recentThreshold = new Date(Date.now() - 15000).toISOString();
  const { data: recentCheckIn } = await supabase
    .from("check_ins")
    .select("id")
    .eq("user_id", user.id)
    .eq("restaurant_id", restaurantId)
    .gte("created_at", recentThreshold)
    .maybeSingle();

  if (recentCheckIn) {
    return { success: true, message: `Bạn vừa xác nhận ăn tại ${restaurant.name} rồi!` };
  }

  // Gắn món ăn đặc trưng của quán nếu có trong thực đơn
  const { data: dishes } = await supabase
    .from("dishes")
    .select("id, name")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .limit(10);

  const mainDish = dishes?.find((d) => !d.name.toLowerCase().startsWith("gọi thêm")) || dishes?.[0];

  const { error } = await supabase.from("check_ins").insert({
    user_id: user.id,
    restaurant_id: restaurantId,
    dish_id: mainDish?.id || null,
  });

  if (error) {
    console.error("[history] quickCheckIn error:", error.message);
    return { success: false, message: "Không thể lưu lần đã ăn. Vui lòng thử lại." };
  }

  revalidatePath("/history");
  revalidatePath("/profile");
  return { success: true, message: `Đã lưu ${restaurant.name} vào Nhật ký ăn uống! 🔥` };
}
