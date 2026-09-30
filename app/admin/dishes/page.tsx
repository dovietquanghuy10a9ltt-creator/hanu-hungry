import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminCard, AdminError, AdminHeader, AdminPager } from "@/features/admin/components/AdminPrimitives";

const PAGE_SIZE = 24;

export default async function AdminDishesPage({ searchParams }: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Math.min(1000, Number.parseInt(params.page ?? "1", 10) || 1));
  const q = (params.q ?? "").trim().slice(0, 100);
  const supabase = await createClient();
  let query = supabase.from("dishes")
    .select("id,name,price_text,is_active,restaurant_id,restaurants(name)", { count: "exact" })
    .order("name")
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (q) query = query.ilike("name", `%${q}%`);
  const { data, count, error } = await query;
  return <>
    <AdminHeader title="Quản lý món ăn" description="Giữ nguyên giá gốc và chỉ nhập giá số khi đã rõ. Món có lịch sử check-in được ngừng hiển thị thay vì xóa.">
      <Link href="/admin/dishes/new" className="inline-flex min-h-11 items-center rounded-xl bg-[#bd2030] px-4 text-sm font-bold text-white">+ Thêm món</Link>
    </AdminHeader>
    <form className="mb-5 flex flex-wrap gap-2" action="/admin/dishes">
      <input name="q" defaultValue={q} maxLength={100} placeholder="Tìm tên món" className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#e6d7d0] bg-white px-4 text-base outline-none focus:border-[#bd2030]" />
      <button className="min-h-11 rounded-xl border border-[#dec8c0] bg-white px-4 font-semibold">Tìm</button>
    </form>
    {error && <AdminError>Chưa tải được món. Kiểm tra kết nối database.</AdminError>}
    {!error && (!data || data.length === 0) && <AdminCard><p className="text-sm text-[#76645d]">Chưa có món phù hợp.</p></AdminCard>}
    <div className="grid gap-3 md:grid-cols-2">
      {(data ?? []).map((dish) => <Link key={dish.id} href={`/admin/dishes/${dish.id}`} className="block rounded-2xl border border-[#eddfd8] bg-white p-5 transition hover:border-[#bd2030] hover:shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-lg font-bold">{dish.name}</h2>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${dish.is_active ? "bg-green-50 text-green-800" : "bg-stone-100 text-stone-600"}`}>
            {dish.is_active ? "Đang hiển thị" : "Đã ẩn"}
          </span>
        </div>
        <p className="mt-2 text-sm text-[#76645d]">{dish.restaurants?.name || "Quán chưa xác định"}</p>
        <p className="mt-1 text-sm font-semibold text-[#a91d2c]">{dish.price_text || "Chưa có dữ liệu giá"}</p>
      </Link>)}
    </div>
    {!error && <AdminPager base="/admin/dishes" page={page} hasNext={(count ?? 0) > page * PAGE_SIZE} query={q} />}
  </>;
}
