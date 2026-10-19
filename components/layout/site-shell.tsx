import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Navigation } from "@/components/layout/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { SocialIconsRow, CONTACT_INFO } from "@/components/shared/social-links";
import { SmartCheckInRecall } from "@/components/shared/smart-checkin-recall";
import { StreakIndicator, type StreakData } from "@/components/shared/streak-indicator";
import { historyStats, localDayOrdinal } from "@/features/history/stats";
import { PetalsFalling } from "@/components/decorations/PetalsFalling";
import { WomensDayGiftModal } from "@/components/decorations/WomensDayGiftModal";

export async function SiteShell({ children }: { children: ReactNode }) {
  const account = await getCurrentProfile();
  const user = account?.user ?? null;
  const profile = account?.profile ?? null;
  const isAdmin = profile?.role === "ADMIN";
  let unreadNotificationsCount = 0;
  let streakData: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    isTodayCheckedIn: false,
    weekDays: [],
  };

  if (user) {
    const supabase = await createClient();
    const [notifsRes, readsRes, checkInsRes] = await Promise.all([
      supabase.from("notifications").select("id").eq("audience", "ALL_USERS"),
      supabase.from("notification_reads").select("notification_id").eq("user_id", user.id),
      supabase.from("check_ins").select("restaurant_id, visited_at").eq("user_id", user.id),
    ]);

    if (!isAdmin) {
      const readSet = new Set((readsRes.data ?? []).map((r) => r.notification_id));
      unreadNotificationsCount = (notifsRes.data ?? []).filter((n) => !readSet.has(n.id)).length;
    }

    const checkIns = checkInsRes.data ?? [];
    const stats = historyStats(checkIns);
    const today = localDayOrdinal(new Date());
    const daySet = new Set(checkIns.map((ci) => localDayOrdinal(new Date(ci.visited_at))));
    const isTodayCheckedIn = daySet.has(today);

    const mondayOffset = (new Date(today * 86400000).getUTCDay() + 6) % 7;
    const weekStart = today - mondayOffset;
    const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const weekDays = [0, 1, 2, 3, 4, 5, 6].map((offset) => {
      const dayOrd = weekStart + offset;
      return {
        dayLabel: dayNames[offset],
        isToday: dayOrd === today,
        checkedIn: daySet.has(dayOrd),
      };
    });

    streakData = {
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      isTodayCheckedIn,
      weekDays,
    };
  }

  return (
    <div className="relative min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]" suppressHydrationWarning>
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[#faf7ef] shadow-2xs">
        {/* Festive 20/10 Announcement Bar */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 px-3 py-1 text-center text-[11px] sm:text-xs font-bold text-white shadow-2xs select-none">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-1.5 sm:gap-2">
            <span className="animate-spin-slow inline-block" style={{ animationDuration: "8s" }}>🌸</span>
            <span>Mừng ngày Phụ nữ Việt Nam 20/10 · Chúc phái đẹp HANU luôn rạng ngời & hạnh phúc!</span>
            <span className="hidden sm:inline">💐✨</span>
          </div>
        </div>
        <div className="mx-auto flex min-h-14 sm:min-h-16 w-full max-w-7xl items-center justify-between gap-1.5 sm:gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-h-11 sm:min-h-12 shrink-0 items-center gap-1.5 sm:gap-2" aria-label="Hanu Hungry - Trang chủ">
            <Image src="/brand/logo.png" alt="" width={40} height={40} className="h-7 w-7 object-contain sm:h-10 sm:w-10" priority />
            <span className="brand-display text-[1.15rem] leading-none text-[var(--color-red)] sm:text-[1.65rem]">Hanu Hungry</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-100 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[11px] font-black text-rose-700 border border-rose-200 shadow-2xs animate-pulse">
              🌸 20/10
            </span>
          </Link>
          {user && <Navigation isAdmin={isAdmin} signedIn={true} />}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {user ? (
              <>
                <StreakIndicator streak={streakData} />
                {!isAdmin && (
                  <Link
                    href="/notifications"
                    prefetch={false}
                    className="relative inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[var(--color-pale)] text-[var(--color-red)] transition hover:bg-[#eadbc9] hover:scale-105 active:scale-95"
                    aria-label={`Thông báo bài viết từ Admin${unreadNotificationsCount > 0 ? ` (${unreadNotificationsCount} chưa đọc)` : ""}`}
                    title="Thông báo bài viết từ Admin"
                  >
                    <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 sm:h-5 sm:min-w-5 items-center justify-center rounded-full bg-[var(--color-red)] px-1 text-[10px] sm:text-[11px] font-black text-white shadow-sm animate-pulse">
                        {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                      </span>
                    )}
                  </Link>
                )}
                {isAdmin ? (
                  <Link
                    href="/profile"
                    prefetch={false}
                    className="flex min-h-9 sm:min-h-11 items-center gap-1.5 sm:gap-2 rounded-full border border-[#f0c2c6] bg-[#fdf2f2] px-2.5 sm:px-4 text-xs sm:text-sm font-bold text-[var(--color-red)] shadow-xs transition hover:bg-[#fae6e6]"
                    title="Tài khoản Quản trị viên"
                  >
                    <div className="relative shrink-0">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="h-5 w-5 sm:h-6 sm:w-6 rounded-full object-cover border border-[var(--color-red)]" />
                      ) : (
                        <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[var(--color-red)] text-white text-[10px]">👑</span>
                      )}
                      <span className="absolute -bottom-1 -right-1 text-[8px] leading-none" aria-hidden="true">🌸</span>
                    </div>
                    <span className="hidden sm:inline truncate max-w-[110px] sm:max-w-[150px]">{profile?.display_name || user.email?.split("@")[0] || "Admin"}</span>
                    <span className="inline-flex items-center rounded-full bg-[var(--color-red)] px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs shrink-0">
                      Admin
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/profile"
                    prefetch={false}
                    className="flex min-h-9 sm:min-h-11 items-center gap-1.5 sm:gap-2 rounded-full bg-[var(--color-pale)] px-2.5 sm:px-4 text-xs sm:text-sm font-semibold text-[var(--color-red)] transition hover:bg-[#eadbc9]"
                  >
                    <div className="relative shrink-0">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="h-5 w-5 sm:h-6 sm:w-6 rounded-full object-cover" />
                      ) : null}
                      <span className="absolute -bottom-1 -right-1 text-[8px] leading-none" aria-hidden="true">🌸</span>
                    </div>
                    <span className="hidden sm:inline truncate max-w-[110px]">{profile?.display_name || user.email?.split("@")[0] || "Tài khoản"}</span>
                    <span className="sm:hidden text-xs font-bold">Hồ sơ</span>
                  </Link>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link href="/login" className="button button-secondary shrink-0 whitespace-nowrap px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">Đăng nhập</Link>
                <Link href="/register" className="button button-primary shrink-0 whitespace-nowrap px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto min-h-[calc(100vh-15rem)] w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-28 pt-4 sm:pt-6 md:pb-14 md:pt-10 overflow-x-clip">
        {children}
      </main>

      {/* Decorative 20/10 Greeting Ribbon Above Footer */}
      <div className="border-t border-b border-rose-200/80 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 py-3.5 px-4 text-center select-none">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-xs sm:text-sm font-bold text-rose-800">
          <span className="animate-petal-float inline-block">🌸</span>
          <span>Hanu Hungry chúc toàn thể các bạn nữ HANU một ngày 20/10 ngập tràn hoa, quà và những bữa ăn ấm áp!</span>
          <span className="animate-petal-float inline-block" style={{ animationDelay: "1.5s" }}>🌷</span>
        </div>
      </div>

      <footer className="border-t border-[var(--color-line)] bg-[#f1eadd] pb-24 md:pb-0">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-[var(--color-muted)] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-[var(--color-red)] text-base font-black">Hanu Hungry</strong>
              <span className="text-xs bg-[var(--color-pale)] px-2 py-0.5 rounded-full text-[var(--color-ink)] font-semibold">bởi Macaron</span>
            </div>
            <p className="mt-1">Dữ liệu quán ăn từ khảo sát của nhóm sinh viên Hanu.</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <a href={CONTACT_INFO.phoneHref} className="hover:text-[var(--color-red)] font-semibold">📞 {CONTACT_INFO.phone}</a>
              <span>·</span>
              <a href={CONTACT_INFO.emailHref} className="hover:text-[var(--color-red)] font-semibold">✉️ {CONTACT_INFO.email}</a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <SocialIconsRow />
            <div className="flex flex-wrap gap-4 font-semibold text-[var(--color-ink)]">
              <Link href="/about" className="hover:text-[var(--color-red)]">Về chúng mình</Link>
              <Link href="/contact" className="hover:text-[var(--color-red)]">Liên hệ</Link>
              <Link href="/blog" className="hover:text-[var(--color-red)]">Blog</Link>
            </div>
          </div>
        </div>
      </footer>

      {user && <Navigation mobile signedIn={true} isAdmin={isAdmin} />}
      {user && <SmartCheckInRecall />}
      {/* <PetalsFalling /> - Tạm thời tắt hiệu ứng hoa rơi theo yêu cầu */}
      {user && <WomensDayGiftModal userId={user.id} userEmail={user.email} isAdmin={isAdmin} />}
    </div>
  );
}
