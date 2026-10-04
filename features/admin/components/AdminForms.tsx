"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { AdminActionState } from "@/features/admin/actions";
import {
  createBlogAction, createCategoryAction, createDishAction, createRestaurantAction,
  deleteBlogAction, deleteCategoryAction, setBlogStatusAction,
  setDishActiveAction, setRestaurantActiveAction, updateBlogAction,
  updateCategoryAction, updateDishAction, updateRestaurantAction,
} from "@/features/admin/actions";

const initial: AdminActionState = { status: "idle", message: "" };
const input = "mt-1.5 min-h-11 w-full rounded-xl border border-[#e5d7d2] bg-white px-3 py-2 text-base text-[#28201e] outline-none focus:border-[#c51f30] focus:ring-2 focus:ring-[#c51f30]/15";
const label = "block text-sm font-semibold text-[#4d3c38]";

function Submit({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className={`min-h-11 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-60 ${muted ? "border border-[#d9c7c0] bg-white text-[#5f3c38] hover:bg-[#fff3ee]" : "bg-[#bd2030] text-white hover:bg-[#a71928]"}`}>
    {pending ? "Đang lưu..." : children}
  </button>;
}

function Message({ state }: { state: AdminActionState }) {
  if (!state.message) return null;
  return <p role={state.status === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm ${state.status === "error" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>{state.message}</p>;
}

function TextField({ name, title, defaultValue, required = false, type = "text", placeholder, min, max, step }: {
  name: string; title: string; defaultValue?: string | number | null; required?: boolean;
  type?: string; placeholder?: string; min?: number; max?: number; step?: number | "any";
}) {
  return <label className={label}>{title}
    <input className={input} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} min={min} max={max} step={step} />
  </label>;
}

function TextArea({ name, title, defaultValue, rows = 3, required = false }: {
  name: string; title: string; defaultValue?: string | null; rows?: number; required?: boolean;
}) {
  return <label className={label}>{title}
    <textarea className={`${input} resize-y`} name={name} defaultValue={defaultValue ?? ""} rows={rows} required={required} />
  </label>;
}

export type RestaurantFormValue = {
  id: string; name: string; area: string | null; address_text: string | null;
  plus_code: string | null; latitude: number | null; longitude: number | null;
  description: string | null; image_url: string | null; notes: string | null;
  is_active: boolean;
};

export function RestaurantForm({ restaurant, categories, selectedCategoryIds = [] }: {
  restaurant?: RestaurantFormValue;
  categories: { id: string; name: string }[];
  selectedCategoryIds?: string[];
}) {
  const [state, action] = useActionState(restaurant ? updateRestaurantAction : createRestaurantAction, initial);
  return <form action={action} className="space-y-5">
    {restaurant && <input type="hidden" name="id" value={restaurant.id} />}
    <TextField name="name" title="Tên quán" defaultValue={restaurant?.name} required />
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField name="area" title="Khu vực" defaultValue={restaurant?.area} />
      <TextField name="plus_code" title="Plus Code" defaultValue={restaurant?.plus_code} />
    </div>
    <TextField name="address_text" title="Địa chỉ" defaultValue={restaurant?.address_text} />
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField name="latitude" title="Vĩ độ (chỉ nhập dữ liệu thật)" type="number" min={-90} max={90} step="any" defaultValue={restaurant?.latitude} />
      <TextField name="longitude" title="Kinh độ (chỉ nhập dữ liệu thật)" type="number" min={-180} max={180} step="any" defaultValue={restaurant?.longitude} />
    </div>
    <TextArea name="description" title="Mô tả" defaultValue={restaurant?.description} rows={4} />
    <TextField name="image_url" title="URL ảnh" type="url" defaultValue={restaurant?.image_url} />
    <TextArea name="notes" title="Ghi chú hiển thị từ dữ liệu khảo sát" defaultValue={restaurant?.notes} />
    <fieldset>
      <legend className="text-sm font-semibold text-[#4d3c38]">Category</legend>
      {categories.length ? <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {categories.map((category) => <label key={category.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-[#eadbd5] px-3 py-2 text-sm">
          <input type="checkbox" name="category_ids" value={category.id} defaultChecked={selectedCategoryIds.includes(category.id)} className="h-5 w-5 accent-[#bd2030]" />
          {category.name}
        </label>)}
      </div> : <p className="mt-2 text-sm text-[#7f706a]">Chưa có category. Hãy tạo trong mục Category.</p>}
    </fieldset>
    <Message state={state} />
    <Submit>{restaurant ? "Lưu thay đổi" : "Thêm quán"}</Submit>
  </form>;
}

export function RestaurantStatusForm({ id, active }: { id: string; active: boolean }) {
  const [state, action] = useActionState(setRestaurantActiveAction, initial);
  return <form action={action} className="flex flex-wrap items-center gap-3">
    <input type="hidden" name="id" value={id} />
    <input type="hidden" name="active" value={active ? "false" : "true"} />
    <Submit muted>{active ? "Ngừng hiển thị quán" : "Kích hoạt lại quán"}</Submit>
    <Message state={state} />
  </form>;
}

export function CategoryForm({ category }: { category?: { id: string; name: string; slug: string } }) {
  const [state, action] = useActionState(category ? updateCategoryAction : createCategoryAction, initial);
  return <form action={action} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
    {category && <input type="hidden" name="id" value={category.id} />}
    <TextField name="name" title="Tên category" defaultValue={category?.name} required />
    <TextField name="slug" title="Slug không dấu" defaultValue={category?.slug} required placeholder="vi-du-category" />
    <Submit>{category ? "Lưu" : "Thêm"}</Submit>
    <div className="sm:col-span-3"><Message state={state} /></div>
  </form>;
}

export function DeleteCategoryForm({ id }: { id: string }) {
  const [state, action] = useActionState(deleteCategoryAction, initial);
  return <form action={action} onSubmit={(event) => { if (!window.confirm("Xóa category và gỡ phân loại khỏi các quán?")) event.preventDefault(); }} className="flex flex-wrap items-center gap-2">
    <input type="hidden" name="id" value={id} />
    <Submit muted>Xóa category</Submit>
    <Message state={state} />
  </form>;
}

export type DishFormValue = {
  id: string; restaurant_id: string; name: string; price_text: string | null;
  price_min_vnd: number | null; price_max_vnd: number | null;
  notes: string | null; is_active: boolean;
};

export function DishForm({ dish, restaurants }: {
  dish?: DishFormValue;
  restaurants: { id: string; name: string }[];
}) {
  const [state, action] = useActionState(dish ? updateDishAction : createDishAction, initial);
  return <form action={action} className="space-y-4">
    {dish && <input type="hidden" name="id" value={dish.id} />}
    <label className={label}>Quán
      <select className={input} name="restaurant_id" defaultValue={dish?.restaurant_id ?? ""} required>
        <option value="" disabled>Chọn quán</option>
        {restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}
      </select>
    </label>
    <TextField name="name" title="Tên món" defaultValue={dish?.name} required />
    <TextField name="price_text" title="Giá gốc (giữ nguyên cách ghi)" defaultValue={dish?.price_text} placeholder="Ví dụ: 30,000 - 50,000" />
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField name="price_min_vnd" title="Giá tối thiểu (VND)" type="number" min={0} defaultValue={dish?.price_min_vnd} />
      <TextField name="price_max_vnd" title="Giá tối đa (VND)" type="number" min={0} defaultValue={dish?.price_max_vnd} />
    </div>
    <p className="text-xs text-[#756561]">Nếu không biết giá, để trống cả hai ô số. Không nhập 0 thay cho giá chưa rõ.</p>
    <TextArea name="notes" title="Ghi chú" defaultValue={dish?.notes} />
    <Message state={state} />
    <Submit>{dish ? "Lưu món" : "Thêm món"}</Submit>
  </form>;
}

export function DishStatusForm({ id, active }: { id: string; active: boolean }) {
  const [state, action] = useActionState(setDishActiveAction, initial);
  return <form action={action} className="flex flex-wrap items-center gap-3">
    <input type="hidden" name="id" value={id} />
    <input type="hidden" name="active" value={active ? "false" : "true"} />
    <Submit muted>{active ? "Ngừng hiển thị món" : "Kích hoạt lại món"}</Submit>
    <Message state={state} />
  </form>;
}

export type BlogFormValue = {
  id: string; slug: string; title: string; excerpt: string | null; content: string;
  cover_image_url: string | null; status: "draft" | "published";
  seo_title: string | null; seo_description: string | null;
};

export function BlogForm({ post }: { post?: BlogFormValue }) {
  const [state, action] = useActionState(post ? updateBlogAction : createBlogAction, initial);
  return <form action={action} className="space-y-4">
    {post && <input type="hidden" name="id" value={post.id} />}
    <TextField name="title" title="Tiêu đề" defaultValue={post?.title} required />
    <TextField name="slug" title="Slug không dấu" defaultValue={post?.slug} required placeholder="ten-bai-viet" />
    <TextArea name="excerpt" title="Tóm tắt" defaultValue={post?.excerpt} />
    <TextArea name="content" title="Nội dung" defaultValue={post?.content} rows={14} required />
    <TextField name="cover_image_url" title="URL ảnh bìa" type="url" defaultValue={post?.cover_image_url} />
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField name="seo_title" title="SEO title" defaultValue={post?.seo_title} />
      <TextField name="seo_description" title="SEO description" defaultValue={post?.seo_description} />
    </div>
    <label className={label}>Trạng thái
      <select className={input} name="status" defaultValue={post?.status ?? "draft"}>
        <option value="draft">Bản nháp</option>
        <option value="published">Đã đăng</option>
      </select>
    </label>
    <p className="text-xs text-[#756561]">Khi bài chuyển từ bản nháp sang đã đăng, hệ thống tạo một thông báo chung cho người dùng.</p>
    <Message state={state} />
    <Submit>{post ? "Lưu bài viết" : "Tạo bài viết"}</Submit>
  </form>;
}

export function BlogStatusForm({ id, status }: { id: string; status: "draft" | "published" }) {
  const [state, action] = useActionState(setBlogStatusAction, initial);
  return <form action={action} className="flex flex-wrap items-center gap-3">
    <input type="hidden" name="id" value={id} />
    <input type="hidden" name="status" value={status === "published" ? "draft" : "published"} />
    <Submit muted>{status === "published" ? "Gỡ đăng" : "Đăng bài"}</Submit>
    <Message state={state} />
  </form>;
}

export function DeleteBlogForm({ id }: { id: string }) {
  const [state, action] = useActionState(deleteBlogAction, initial);
  return <form action={action} onSubmit={(event) => { if (!window.confirm("Xóa vĩnh viễn bài Blog này?")) event.preventDefault(); }} className="flex flex-wrap items-center gap-3">
    <input type="hidden" name="id" value={id} />
    <Submit muted>Xóa bài</Submit>
    <Message state={state} />
  </form>;
}
