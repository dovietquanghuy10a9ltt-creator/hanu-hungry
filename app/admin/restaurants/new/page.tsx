import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RestaurantForm } from "@/features/admin/components/AdminForms";
import { AdminCard, AdminError, AdminHeader } from "@/features/admin/components/AdminPrimitives";

export default async function NewRestaurantPage() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase.from("categories").select("id,name").order("name");
  return <>
    <AdminHeader title="Thêm quán" description="Chỉ nhập dữ liệu đã kiểm chứng; những trường chưa biết có thể để trống.">
      <Link href="/admin/restaurants" className="inline-flex min-h-11 items-center text-sm font-semibold text-[#a91d2c]">← Danh sách quán</Link>
    </AdminHeader>
    {error ? <AdminError>Chưa tải được category. Vui lòng thử lại trước khi tạo quán.</AdminError> : <AdminCard><RestaurantForm categories={categories ?? []} /></AdminCard>}
  </>;
}
