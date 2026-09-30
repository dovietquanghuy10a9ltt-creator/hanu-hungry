import Link from "next/link";
import type { Metadata } from "next";
import { logoutAction } from "@/features/auth/actions";
import { getOwnCheckIns } from "@/features/history/data";
import { historyStats } from "@/features/history/stats";
import { updateDisplayName } from "@/features/profile/actions";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Hồ sơ của tôi" };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ updated?: string }> }) {
  const [{ user, profile }, checkIns, params] = await Promise.all([requireUser(), getOwnCheckIns(), searchParams]);
  const stats = historyStats(checkIns);
  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <div><p className="eyebrow">Tài khoản của bạn</p><h1 className="section-title mt-2">Hồ sơ cá nhân</h1></div>
      {params.updated && <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">Đã cập nhật tên hiển thị.</p>}
      <div className="card grid gap-6 p-5 sm:p-7 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-pale)] text-4xl text-[var(--color-red)]" aria-hidden="true">☺</div><h2 className="break-words text-2xl font-black">{profile.display_name}</h2><p className="break-all text-sm text-[var(--color-muted)]">{user.email}</p><p className="text-sm text-[var(--color-muted)]">MSSV: <strong>{profile.student_code}</strong></p><p className="text-xs text-[var(--color-muted)]">MSSV và email dùng để xác thực tài khoản.</p></div>
        <form action={updateDisplayName} className="space-y-3"><label className="block text-sm font-bold">Tên hiển thị<input name="displayName" defaultValue={profile.display_name} minLength={1} maxLength={100} required className="field mt-1.5" /></label><p className="text-xs text-[var(--color-muted)]">Đổi tên hiển thị không ảnh hưởng đến email đăng nhập.</p><button type="submit" className="button button-primary">Lưu tên hiển thị</button></form>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[{ label: "Đã ăn", value: stats.total }, { label: "Chuỗi hiện tại", value: `${stats.currentStreak} ngày` }, { label: "Chuỗi dài nhất", value: `${stats.longestStreak} ngày` }, { label: "Tuần này", value: stats.weeklyVisits }].map((item) => <div key={item.label} className="card p-4"><strong className="text-2xl font-black text-[var(--color-red)]">{item.value}</strong><p className="mt-1 text-xs font-semibold text-[var(--color-muted)]">{item.label}</p></div>)}</div>
      <div className="card flex flex-wrap gap-3 p-5"><Link href="/history" className="button button-secondary">Lịch sử đã ăn</Link><Link href="/notifications" className="button button-secondary">Thông báo</Link><Link href="/settings/password" className="button button-secondary">Đổi mật khẩu</Link>{profile.role === "ADMIN" && <Link href="/admin" className="button button-outline">Trang quản trị</Link>}<form action={logoutAction}><button type="submit" className="button button-primary">Đăng xuất</button></form></div>
    </div>
  );
}
