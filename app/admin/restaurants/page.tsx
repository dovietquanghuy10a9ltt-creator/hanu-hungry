import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminCard, AdminError, AdminHeader, AdminPager } from "@/features/admin/components/AdminPrimitives";

const PAGE_SIZE = 24;

export default async function AdminRestaurantsPage({ searchParams }: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Math.min(1000, Number.parseInt(params.page ?? "1", 10) || 1));
  const q = (params.q ?? "").trim().slice(0, 100);
  const supabase = await createClient();
  let query = supabase.from("restaurants")
    .select("id,name,area,address_text,is_active,source_stt,updated_at", { count: "exact" })
    .order("name")
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (q) query = query.ilike("name", `%${q}%`);
  const { data, count, error } = await query;
  const hasNext = (count ?? 0) > page * PAGE_SIZE;
  return <>
    <AdminHeader title="Quản lý quán ăn" description="Chỉnh sửa dữ liệu khảo sát; ngừng hiển thị quán khi cần giữ lịch sử đã ăn.">
      <Link href="/admin/restaurants/new" className="inline-flex min-h-11 items-center rounded-xl bg-[#bd2030] px-4 text-sm font-bold text-white">+ Thêm quán</Link>
    </AdminHeader>
    <form className="mb-5 flex flex-wrap gap-2" action="/admin/restaurants">
      <input name="q" defaultValue={q} maxLength={100} placeholder="Tìm tên quán" className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#e6d7d0] bg-white px-4 text-base outline-none focus:border-[#bd2030]" />
      <button className="min-h-11 rounded-xl border border-[#dec8c0] bg-white px-4 font-semibold">Tìm</button>
    </form>
    {error && <AdminError>Chưa tải được danh sách quán. Kiểm tra kết nối database.</AdminError>}
    {!error && (!data || data.length === 0) && <AdminCard><p className="text-sm text-[#76645d]">Chưa có quán phù hợp.</p></AdminCard>}
    <div className="grid gap-3 md:grid-cols-2">
      {(data ?? []).map((restaurant) => <Link key={restaurant.id} href={`/admin/restaurants/${restaurant.id}`} className="block rounded-2xl border border-[#eddfd8] bg-white p-5 transition hover:border-[#bd2030] hover:shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-lg font-bold">{restaurant.name}</h2>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${restaurant.is_active ? "bg-green-50 text-green-800" : "bg-stone-100 text-stone-600"}`}>
            {restaurant.is_active ? "Đang hiển thị" : "Đã ẩn"}
          </span>
        </div>
        <p className="mt-2 text-sm text-[#76645d]">{restaurant.area || restaurant.address_text || "Chưa có dữ liệu vị trí"}</p>
        {restaurant.source_stt && <p className="mt-2 text-xs text-[#9a8a83]">STT khảo sát: {restaurant.source_stt}</p>}
      </Link>)}
    </div>
    {!error && <AdminPager base="/admin/restaurants" page={page} hasNext={hasNext} query={q} />}
  </>;
}
