import { createClient } from "@/lib/supabase/server";
import { AdminCard, AdminError, AdminHeader } from "@/features/admin/components/AdminPrimitives";

type Ranked = { id: string; name: string; check_ins: number };
type Daily = { day: string; check_ins: number };

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

function number(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function ranked(value: unknown): Ranked[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => record(item)).filter((item) =>
    typeof item.id === "string" && typeof item.name === "string",
  ).map((item) => ({
    id: item.id as string,
    name: item.name as string,
    check_ins: number(item.check_ins),
  }));
}

function daily(value: unknown): Daily[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => record(item)).filter((item) =>
    typeof item.day === "string",
  ).map((item) => ({ day: item.day as string, check_ins: number(item.check_ins) }));
}

function Ranking({ title, items }: { title: string; items: Ranked[] }) {
  const max = Math.max(1, ...items.map((item) => item.check_ins));
  return <AdminCard>
    <h2 className="text-lg font-bold">{title}</h2>
    {items.length ? <ol className="mt-5 space-y-4">
      {items.map((item, index) => <li key={item.id}>
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="min-w-0 truncate font-medium">{index + 1}. {item.name}</span>
          <span className="shrink-0 font-bold text-[#a91d2c]">{item.check_ins.toLocaleString("vi-VN")}</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#f6e9e3]">
          <div className="h-full rounded-full bg-[#c51f30]" style={{ width: `${Math.max(2, item.check_ins / max * 100)}%` }} />
        </div>
      </li>)}
    </ol> : <p className="mt-4 text-sm text-[#76645d]">Chưa có dữ liệu check-in.</p>}
  </AdminCard>;
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_analytics");
  if (error) return <>
    <AdminHeader title="Thống kê" description="Các con số lấy từ dữ liệu check-in, review và nội dung thật." />
    <AdminError>Chưa tải được thống kê. Kiểm tra migration và quyền ADMIN.</AdminError>
  </>;
  const stats = record(data);
  const summary = [
    ["Quán đang hiển thị", number(stats.total_restaurants)],
    ["Món đang hiển thị", number(stats.total_dishes)],
    ["Tổng check-in", number(stats.total_check_ins)],
    ["Tổng đánh giá", number(stats.total_reviews)],
  ] as const;
  const average = stats.average_rating === null ? null : number(stats.average_rating);
  const days = daily(stats.activity_by_day);
  return <>
    <AdminHeader title="Thống kê" description="Tổng hợp từ check-in và review thật. Chỉ hiển thị dữ liệu aggregate, không mở lịch sử riêng của từng user." />
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {summary.map(([title, value]) => <AdminCard key={title}>
        <p className="text-sm text-[#76645d]">{title}</p>
        <p className="mt-2 text-3xl font-black text-[#a91d2c]">{value.toLocaleString("vi-VN")}</p>
      </AdminCard>)}
    </div>
    <p className="mt-4 text-sm text-[#76645d]">Điểm trung bình: <strong className="text-[#a91d2c]">{average === null ? "Chưa có đánh giá" : `${average.toLocaleString("vi-VN")} / 5`}</strong></p>
    <div className="mt-7 grid gap-5 lg:grid-cols-2">
      <Ranking title="Quán được check-in nhiều" items={ranked(stats.top_restaurants)} />
      <Ranking title="Category phổ biến" items={ranked(stats.popular_categories)} />
      <Ranking title="Món được check-in nhiều" items={ranked(stats.popular_dishes)} />
      <AdminCard>
        <h2 className="text-lg font-bold">Hoạt động theo ngày</h2>
        {days.length ? <div className="mt-4 max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#ecdcd4] text-left text-[#76645d]"><th className="py-2">Ngày</th><th className="py-2 text-right">Check-in</th></tr></thead>
            <tbody>{days.map((day) => <tr key={day.day} className="border-b border-[#f5eae5]"><td className="py-2">{day.day}</td><td className="py-2 text-right font-semibold">{day.check_ins.toLocaleString("vi-VN")}</td></tr>)}</tbody>
          </table>
        </div> : <p className="mt-4 text-sm text-[#76645d]">Chưa có check-in.</p>}
      </AdminCard>
    </div>
  </>;
}
