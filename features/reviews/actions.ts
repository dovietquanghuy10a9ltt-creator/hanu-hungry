"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseReview(formData: FormData) {
  const restaurantId = String(formData.get("restaurantId") || "");
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") || "").trim();
  if (!uuid.test(restaurantId) || !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 3 || comment.length > 2000) {
    throw new Error("Đánh giá cần 1–5 sao và nội dung từ 3 đến 2.000 ký tự.");
  }
  return { restaurantId, rating, comment };
}

export async function createReview(formData: FormData) {
  const { restaurantId, rating, comment } = parseReview(formData);
  const { user } = await requireUser();
  const supabase = await createClient();
  const { data: restaurant } = await supabase.from("restaurants").select("id").eq("id", restaurantId).eq("is_active", true).maybeSingle();
  if (!restaurant) throw new Error("Quán không còn khả dụng.");
  const { error } = await supabase.from("reviews").insert({ user_id: user.id, restaurant_id: restaurantId, rating, comment });
  if (error) throw new Error("Không gửi được đánh giá. Vui lòng thử lại.");
  revalidatePath(`/restaurants/${restaurantId}`);
  redirect(`/restaurants/${restaurantId}#reviews`);
}

export async function updateReview(formData: FormData) {
  const id = String(formData.get("id") || "");
  const { restaurantId, rating, comment } = parseReview(formData);
  if (!uuid.test(id)) throw new Error("Đánh giá không hợp lệ.");
  const { user } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").update({ rating, comment }).eq("id", id).eq("user_id", user.id).eq("restaurant_id", restaurantId);
  if (error) throw new Error("Không sửa được đánh giá. Vui lòng thử lại.");
  revalidatePath(`/restaurants/${restaurantId}`);
  redirect(`/restaurants/${restaurantId}#reviews`);
}

export async function deleteReview(formData: FormData) {
  const id = String(formData.get("id") || "");
  const restaurantId = String(formData.get("restaurantId") || "");
  if (!uuid.test(id) || !uuid.test(restaurantId)) throw new Error("Đánh giá không hợp lệ.");
  const { user } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id).eq("user_id", user.id).eq("restaurant_id", restaurantId);
  if (error) throw new Error("Không xóa được đánh giá. Vui lòng thử lại.");
  revalidatePath(`/restaurants/${restaurantId}`);
  redirect(`/restaurants/${restaurantId}#reviews`);
}
