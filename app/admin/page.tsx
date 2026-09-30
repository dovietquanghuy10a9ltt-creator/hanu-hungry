import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminCard, AdminError, AdminHeader } from "@/features/admin/components/AdminPrimitives";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_analytics");
  const summary = data && typeof data === "object" && !Array.isArray(data)
    ? data as Record<string, unknown> : {};
  const cards: Array<[string, unknown]> = [
    ["Quán đang hiển thị", summary.total_restaurants],
    ["Món đang hiển thị", summary.total_dishes],
    ["Lượt đã ăn", summary.total_check_ins],
    ["Đánh giá", summary.total_reviews],
  ];
  return <>
    <AdminHeader title="Tổng quan quản trị" description="Quản lý nội dung quán ăn và xem số liệu tổng hợp từ dữ liệu thật." />
    {error && <AdminError>Chưa tải được báo cáo. Kiểm tra migration và quyền ADMIN.</AdminError>}
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([title, value]) => <AdminCard key={String(title)}>
        <p className="text-sm text-[#76645d]">{title}</p>
        <p className="mt-2 text-3xl font-black text-[#a91d2c]">{typeof value === "number" ? value.toLocaleString("vi-VN") : "—"}</p>
      </AdminCard>)}
    </div>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[
        ["Quán ăn", "/admin/restaurants", "Thêm, cập nhật và ngừng hiển thị quán."],
        ["Món ăn", "/admin/dishes", "Quản lý menu và thông tin giá."],
        ["Category", "/admin/categories", "Quản lý phân loại quán."],
        ["Blog", "/admin/blog", "Viết, đăng hoặc gỡ bài."],
        ["Thống kê", "/admin/analytics", "Xem check-in và đánh giá tổng hợp."],
      ].map(([title, href, description]) => <Link key={href} href={href} className="block rounded-2xl border border-[#eddfd8] bg-white p-5 transition hover:border-[#c51f30] hover:shadow-md">
        <h2 className="text-lg font-bold">{title} →</h2>
        <p className="mt-2 text-sm text-[#76645d]">{description}</p>
      </Link>)}
    </div>
  </>;
}
