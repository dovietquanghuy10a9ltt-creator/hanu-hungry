import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/features/admin/validation";
import { RestaurantForm, DeleteRestaurantForm } from "@/features/admin/components/AdminForms";
import { AdminCard, AdminError, AdminHeader } from "@/features/admin/components/AdminPrimitives";

export default async function EditRestaurantPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; category_error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  if (!isUuid(id)) notFound();
  const supabase = await createClient();
  const [restaurantResult, categoryResult, selectedResult] = await Promise.all([
    supabase.from("restaurants").select("id,name,area,address_text,plus_code,latitude,longitude,description,image_url,notes,is_active,source_stt").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id,name").order("name"),
    supabase.from("restaurant_categories").select("category_id").eq("restaurant_id", id),
  ]);
  if (!restaurantResult.data) notFound();
  const restaurant = restaurantResult.data;
  return <>
    <AdminHeader title={`Sửa quán: ${restaurant.name}`} description={restaurant.source_stt ? `STT khảo sát: ${restaurant.source_stt}` : "Quán được thêm trong dashboard."}>
      <Link href="/admin/restaurants" className="inline-flex min-h-11 items-center text-sm font-semibold text-[#a91d2c]">← Danh sách quán</Link>
    </AdminHeader>
    {query.created === "1" && <p role="status" className="mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">Đã tạo quán.</p>}
    {query.category_error === "1" && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Quán đã được tạo nhưng category chưa lưu được. Hãy chọn và lưu lại.</p>}
    {categoryResult.error || selectedResult.error
      ? <AdminError>Chưa tải được category của quán. Vui lòng thử lại trước khi lưu.</AdminError>
      : <AdminCard><RestaurantForm restaurant={restaurant} categories={categoryResult.data ?? []} selectedCategoryIds={(selectedResult.data ?? []).map((row) => row.category_id)} /></AdminCard>}
    <AdminCard className="mt-5 border-red-200 bg-red-50/20">
      <h2 className="mb-2 text-lg font-bold text-red-700">Xóa quán ăn</h2>
      <p className="mb-4 text-sm text-[#76645d]">Hành động này sẽ xóa vĩnh viễn quán ăn cùng toàn bộ món ăn và dữ liệu liên quan khỏi hệ thống.</p>
      <DeleteRestaurantForm id={id} name={restaurant.name} />
    </AdminCard>
  </>;
}
