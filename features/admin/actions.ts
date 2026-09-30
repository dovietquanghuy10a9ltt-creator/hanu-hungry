"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  isUuid, parseBlogForm, parseCategoryForm, parseDishForm, parseRestaurantForm,
} from "@/features/admin/validation";

export type AdminActionState = { status: "idle" | "error" | "success"; message: string };

function field(form: FormData, name: string): string {
  const raw = form.get(name);
  return typeof raw === "string" ? raw.trim() : "";
}

function fail(message: string): AdminActionState {
  return { status: "error", message };
}

function done(message: string): AdminActionState {
  return { status: "success", message };
}

function refreshRestaurants(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/restaurants");
  revalidatePath("/");
  revalidatePath("/restaurants");
  if (id) revalidatePath(`/restaurants/${id}`);
}

async function syncRestaurantCategories(
  supabase: Awaited<ReturnType<typeof createClient>>,
  restaurantId: string,
  requestedIds: string[],
): Promise<boolean> {
  const { data: currentRows, error } = await supabase
    .from("restaurant_categories")
    .select("category_id")
    .eq("restaurant_id", restaurantId);
  if (error) return false;
  const current = new Set((currentRows ?? []).map((row) => row.category_id as string));
  const requested = new Set(requestedIds);
  const additions = [...requested].filter((id) => !current.has(id));
  const removals = [...current].filter((id) => !requested.has(id));
  if (additions.length) {
    const { error: addError } = await supabase.from("restaurant_categories").insert(
      additions.map((categoryId) => ({ restaurant_id: restaurantId, category_id: categoryId })),
    );
    if (addError) return false;
  }
  if (removals.length) {
    const { error: removeError } = await supabase.from("restaurant_categories")
      .delete().eq("restaurant_id", restaurantId).in("category_id", removals);
    if (removeError) return false;
  }
  return true;
}

export async function createRestaurantAction(
  _state: AdminActionState, form: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = parseRestaurantForm(form);
  if (!parsed.ok) return fail(parsed.error);
  const supabase = await createClient();
  const { data, error } = await supabase.from("restaurants")
    .insert(parsed.data.data).select("id").single();
  if (error || !data) return fail("Không thể tạo quán. Vui lòng kiểm tra dữ liệu hoặc tên trùng.");
  const linked = await syncRestaurantCategories(supabase, data.id, parsed.data.categoryIds);
  refreshRestaurants(data.id);
  redirect(`/admin/restaurants/${data.id}?${linked ? "created=1" : "category_error=1"}`);
}

export async function updateRestaurantAction(
  _state: AdminActionState, form: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = field(form, "id");
  if (!isUuid(id)) return fail("Mã quán không hợp lệ.");
  const parsed = parseRestaurantForm(form);
  if (!parsed.ok) return fail(parsed.error);
  const supabase = await createClient();
  const { data, error } = await supabase.from("restaurants")
    .update(parsed.data.data).eq("id", id).select("id").maybeSingle();
  if (error || !data) return fail("Không thể cập nhật quán.");
  const linked = await syncRestaurantCategories(supabase, id, parsed.data.categoryIds);
  refreshRestaurants(id);
  return linked
    ? done("Đã lưu thông tin quán.")
    : fail("Đã lưu thông tin quán nhưng chưa cập nhật được category. Hãy thử lại.");
}

export async function setRestaurantActiveAction(
  _state: AdminActionState, form: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = field(form, "id");
  const active = field(form, "active");
  if (!isUuid(id) || (active !== "true" && active !== "false")) return fail("Yêu cầu không hợp lệ.");
  const supabase = await createClient();
  const { data, error } = await supabase.from("restaurants")
    .update({ is_active: active === "true" }).eq("id", id).select("id").maybeSingle();
  if (error || !data) return fail("Không thể đổi trạng thái quán.");
  refreshRestaurants(id);
  return done(active === "true" ? "Đã kích hoạt quán." : "Đã ngừng hiển thị quán.");
}

export async function createCategoryAction(
  _state: AdminActionState, form: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = parseCategoryForm(form);
  if (!parsed.ok) return fail(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert(parsed.data);
  if (error) return fail("Không thể tạo category. Slug có thể đã tồn tại.");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/restaurants");
  revalidatePath("/");
  return done("Đã thêm category.");
}

export async function updateCategoryAction(
  _state: AdminActionState, form: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = field(form, "id");
  if (!isUuid(id)) return fail("Mã category không hợp lệ.");
  const parsed = parseCategoryForm(form);
  if (!parsed.ok) return fail(parsed.error);
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories")
    .update(parsed.data).eq("id", id).select("id").maybeSingle();
  if (error || !data) return fail("Không thể cập nhật category. Slug có thể đã tồn tại.");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/restaurants");
  revalidatePath("/");
  return done("Đã lưu category.");
}

export async function deleteCategoryAction(
  _state: AdminActionState, form: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = field(form, "id");
  if (!isUuid(id)) return fail("Mã category không hợp lệ.");
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return fail("Không thể xóa category.");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/restaurants");
  revalidatePath("/");
  return done("Đã xóa category và các liên kết phân loại.");
}

export async function createDishAction(
  _state: AdminActionState, form: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = parseDishForm(form);
  if (!parsed.ok) return fail(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.from("dishes").insert(parsed.data);
  if (error) return fail("Không thể thêm món. Hãy kiểm tra quán và giá.");
  revalidatePath("/admin/dishes");
  refreshRestaurants(parsed.data.restaurant_id);
  return done("Đã thêm món.");
}

export async function updateDishAction(
  _state: AdminActionState, form: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = field(form, "id");
  if (!isUuid(id)) return fail("Mã món không hợp lệ.");
  const parsed = parseDishForm(form);
  if (!parsed.ok) return fail(parsed.error);
  const supabase = await createClient();
  const { data, error } = await supabase.from("dishes")
    .update(parsed.data).eq("id", id).select("id").maybeSingle();
  if (error || !data) return fail("Không thể cập nhật món.");
  revalidatePath("/admin/dishes");
  refreshRestaurants(parsed.data.restaurant_id);
  return done("Đã lưu món.");
}

export async function setDishActiveAction(
  _state: AdminActionState, form: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = field(form, "id");
  const active = field(form, "active");
  if (!isUuid(id) || (active !== "true" && active !== "false")) return fail("Yêu cầu không hợp lệ.");
  const supabase = await createClient();
  const { data, error } = await supabase.from("dishes")
    .update({ is_active: active === "true" }).eq("id", id)
    .select("id,restaurant_id").maybeSingle();
  if (error || !data) return fail("Không thể đổi trạng thái món.");
  revalidatePath("/admin/dishes");
  refreshRestaurants(data.restaurant_id);
  return done(active === "true" ? "Đã kích hoạt món." : "Đã ngừng hiển thị món.");
}

export async function createBlogAction(
  _state: AdminActionState, form: FormData,
): Promise<AdminActionState> {
  const { user } = await requireAdmin();
  const parsed = parseBlogForm(form);
  if (!parsed.ok) return fail(parsed.error);
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_posts")
    .insert({ ...parsed.data, author_admin_id: user.id })
    .select("id").single();
  if (error || !data) return fail("Không thể tạo bài Blog. Slug có thể đã tồn tại.");
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/notifications");
  redirect(`/admin/blog/${data.id}?created=1`);
}

export async function updateBlogAction(
  _state: AdminActionState, form: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = field(form, "id");
  if (!isUuid(id)) return fail("Mã bài Blog không hợp lệ.");
  const parsed = parseBlogForm(form);
  if (!parsed.ok) return fail(parsed.error);
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_posts")
    .update(parsed.data).eq("id", id).select("id").maybeSingle();
  if (error || !data) return fail("Không thể cập nhật bài Blog. Slug có thể đã tồn tại.");
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.data.slug}`);
  revalidatePath("/notifications");
  return done("Đã lưu bài Blog.");
}

export async function setBlogStatusAction(
  _state: AdminActionState, form: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = field(form, "id");
  const status = field(form, "status");
  if (!isUuid(id) || (status !== "draft" && status !== "published")) return fail("Yêu cầu không hợp lệ.");
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_posts")
    .update({ status }).eq("id", id).select("slug").maybeSingle();
  if (error || !data) return fail("Không thể đổi trạng thái bài Blog.");
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath("/notifications");
  return done(status === "published" ? "Đã đăng bài và tạo thông báo trong hệ thống." : "Đã gỡ đăng bài.");
}

export async function deleteBlogAction(
  _state: AdminActionState, form: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = field(form, "id");
  if (!isUuid(id)) return fail("Mã bài Blog không hợp lệ.");
  const supabase = await createClient();
  const { data: post } = await supabase.from("blog_posts").select("slug").eq("id", id).maybeSingle();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return fail("Không thể xóa bài Blog.");
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (post?.slug) revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/notifications");
  redirect("/admin/blog?deleted=1");
}
