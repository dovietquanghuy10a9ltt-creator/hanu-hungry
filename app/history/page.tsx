import Link from "next/link";
import type { Metadata } from "next";
import { deleteCheckIn } from "@/features/history/actions";
import { getOwnCheckIns } from "@/features/history/data";
import { historyStats } from "@/features/history/stats";

export const metadata: Metadata = { title: "Lịch sử đã ăn" };

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ added?: string }> }) {
  const [checkIns, params] = await Promise.all([getOwnCheckIns(), searchParams]);
  const stats = historyStats(checkIns);
  return (
    <div className="space-y-7">
      <div><p className="eyebrow">Nhật ký của bạn</p><h1 className="section-title mt-2">Lịch sử đã ăn</h1><p className="mt-2 text-sm text-[var(--color-muted)]">Chỉ những lần bạn bấm “Đã ăn” mới xuất hiện ở đây.</p></div>
      {params.added && <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">Đã lưu lần ghé quán của bạn.</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[{ label: "Tổng lần đã ăn", value: stats.total }, { label: "Chuỗi hiện tại", value: `${stats.currentStreak} ngày` }, { label: "Chuỗi dài nhất", value: `${stats.longestStreak} ngày` }, { label: "Tuần này", value: `${stats.weeklyVisits} lần` }].map((item) => <div key={item.label} className="card p-4"><strong className="text-2xl font-black text-[var(--color-red)]">{item.value}</strong><p className="mt-1 text-xs font-semibold text-[var(--color-muted)]">{item.label}</p></div>)}
      </div>
      <div className="card p-5 text-sm">Tuần này bạn đã ghé <strong>{stats.weeklyRestaurants} quán</strong>. Mỗi lần check-in giúp bạn nhìn lại hành trình ăn uống của mình.</div>
      {checkIns.length ? <div className="space-y-3">{checkIns.map((checkIn) => <article key={checkIn.id} className="card flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5"><div className="min-w-0"><Link href={`/restaurants/${checkIn.restaurant_id}`} className="break-words font-extrabold hover:text-[var(--color-red)]">{checkIn.restaurants?.name || "Quán đã được cập nhật"}</Link><p className="mt-1 text-sm text-[var(--color-muted)]">{checkIn.dishes?.name ? `Món: ${checkIn.dishes.name} · ` : ""}{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(checkIn.visited_at))}</p></div><form action={deleteCheckIn}><input type="hidden" name="id" value={checkIn.id} /><button type="submit" className="button button-secondary text-xs">Xóa</button></form></article>)}</div> : <div className="card p-10 text-center"><p className="font-bold">Bạn chưa lưu lần ăn nào</p><p className="mt-2 text-sm text-[var(--color-muted)]">Khám phá một quán và bấm “Đã ăn” sau khi ghé.</p><Link href="/restaurants" className="button button-primary mt-5">Tìm quán</Link></div>}
    </div>
  );
}
