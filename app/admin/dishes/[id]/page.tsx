import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/features/admin/validation";
import { DishForm, DeleteDishForm } from "@/features/admin/components/AdminForms";
import { AdminCard, AdminError, AdminHeader } from "@/features/admin/components/AdminPrimitives";

export default async function EditDishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const supabase = await createClient();
  const [dishResult, restaurantResult] = await Promise.all([
    supabase.from("dishes").select("id,restaurant_id,name,price_text,price_min_vnd,price_max_vnd,notes,is_active,image_url").eq("id", id).maybeSingle(),
    supabase.from("restaurants").select("id,name").order("name").limit(1000),
  ]);
  if (!dishResult.data) notFound();
  const dish = dishResult.data;
  return <>
    <AdminHeader title={`Sửa món: ${dish.name}`}>
      <Link href="/admin/dishes" className="inline-flex min-h-11 items-center text-sm font-semibold text-[#a91d2c]">← Danh sách món</Link>
    </AdminHeader>
    {restaurantResult.error ? <AdminError>Chưa tải được danh sách quán.</AdminError> : <AdminCard><DishForm dish={dish} restaurants={restaurantResult.data ?? []} /></AdminCard>}
    <AdminCard className="mt-5 border-red-200 bg-red-50/20">
      <h2 className="mb-2 text-lg font-bold text-red-700">Xóa món ăn</h2>
      <p className="mb-4 text-sm text-[#76645d]">Hành động này sẽ xóa vĩnh viễn món ăn này khỏi quán.</p>
      <DeleteDishForm id={id} name={dish.name} />
    </AdminCard>
  </>;
}
