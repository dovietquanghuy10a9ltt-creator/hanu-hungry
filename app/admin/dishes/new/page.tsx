import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DishForm } from "@/features/admin/components/AdminForms";
import { AdminCard, AdminError, AdminHeader } from "@/features/admin/components/AdminPrimitives";

export default async function NewDishPage() {
  const supabase = await createClient();
  const { data: restaurants, error } = await supabase.from("restaurants")
    .select("id,name").order("name").limit(1000);
  return <>
    <AdminHeader title="Thêm món" description="Chọn quán và nhập dữ liệu menu đã kiểm chứng.">
      <Link href="/admin/dishes" className="inline-flex min-h-11 items-center text-sm font-semibold text-[#a91d2c]">← Danh sách món</Link>
    </AdminHeader>
    {error ? <AdminError>Chưa tải được danh sách quán.</AdminError> : <AdminCard><DishForm restaurants={restaurants ?? []} /></AdminCard>}
  </>;
}
