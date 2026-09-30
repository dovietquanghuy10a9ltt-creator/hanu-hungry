import { createClient } from "@/lib/supabase/server";
import { CategoryForm, DeleteCategoryForm } from "@/features/admin/components/AdminForms";
import { AdminCard, AdminError, AdminHeader } from "@/features/admin/components/AdminPrimitives";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories")
    .select("id,name,slug").order("name").limit(500);
  return <>
    <AdminHeader title="Quản lý category" description="Phân loại quán bằng category. Xóa category sẽ gỡ các liên kết phân loại hiện có." />
    <AdminCard>
      <h2 className="mb-4 text-lg font-bold">Thêm category</h2>
      <CategoryForm />
    </AdminCard>
    {error && <div className="mt-5"><AdminError>Chưa tải được category. Kiểm tra kết nối database.</AdminError></div>}
    <div className="mt-6 space-y-4">
      {(data ?? []).map((category) => <AdminCard key={category.id}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold">{category.name}</h2>
          <span className="rounded-lg bg-[#fff3ee] px-2 py-1 font-mono text-xs text-[#8f4e48]">{category.slug}</span>
        </div>
        <div className="mt-4"><CategoryForm category={category} /></div>
        <div className="mt-3"><DeleteCategoryForm id={category.id} /></div>
      </AdminCard>)}
      {!error && !data?.length && <AdminCard><p className="text-sm text-[#76645d]">Chưa có category.</p></AdminCard>}
    </div>
  </>;
}
