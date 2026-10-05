import Link from "next/link";
import type { Metadata } from "next";
import { logoutAction } from "@/features/auth/actions";
import { getOwnCheckIns } from "@/features/history/data";
import { historyStats } from "@/features/history/stats";
import { ProfileEditor } from "@/features/profile/components/ProfileEditor";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Hồ sơ của tôi" };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ updated?: string }> }) {
  const [{ user, profile }, checkIns, params] = await Promise.all([requireUser(), getOwnCheckIns(), searchParams]);
  const stats = historyStats(checkIns);
  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <div><p className="eyebrow">Tài khoản của bạn</p><h1 className="section-title mt-2">Hồ sơ cá nhân</h1></div>
      {params.updated && <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">Đã cập nhật thông tin cá nhân thành công.</p>}
      <ProfileEditor
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url || null}
        email={user.email}
        studentCode={profile.student_code}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[{ label: "Đã ăn", value: stats.total }, { label: "Chuỗi hiện tại", value: `${stats.currentStreak} ngày` }, { label: "Chuỗi dài nhất", value: `${stats.longestStreak} ngày` }, { label: "Tuần này", value: stats.weeklyVisits }].map((item) => <div key={item.label} className="card p-4"><strong className="text-2xl font-black text-[var(--color-red)]">{item.value}</strong><p className="mt-1 text-xs font-semibold text-[var(--color-muted)]">{item.label}</p></div>)}</div>
      <div className="card flex flex-wrap gap-3 p-5"><Link href="/history" className="button button-secondary">Lịch sử đã ăn</Link><Link href="/notifications" className="button button-secondary">Thông báo</Link><Link href="/settings/password" className="button button-secondary">Đổi mật khẩu</Link>{profile.role === "ADMIN" && <Link href="/admin" className="button button-outline">Trang quản trị</Link>}<form action={logoutAction}><button type="submit" className="button button-primary">Đăng xuất</button></form></div>
    </div>
  );
}
