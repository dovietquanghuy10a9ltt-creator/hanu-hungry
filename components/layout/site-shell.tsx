import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Navigation } from "@/components/layout/navigation";
import { createClient } from "@/lib/supabase/server";
import { SocialIconsRow, CONTACT_INFO } from "@/components/shared/social-links";
import { SmartCheckInRecall } from "@/components/shared/smart-checkin-recall";
import { StreakIndicator, type StreakData } from "@/components/shared/streak-indicator";
import { historyStats, localDayOrdinal } from "@/features/history/stats";

export async function SiteShell({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  let isAdmin = false;
  let unreadNotificationsCount = 0;
  let streakData: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    isTodayCheckedIn: false,
    weekDays: [],
  };

  if (user) {
    const [profileRes, notifsRes, readsRes, checkInsRes] = await Promise.all([
      supabase.from("profiles").select("display_name, role, avatar_url").eq("id", user.id).maybeSingle(),
      supabase.from("notifications").select("id").eq("audience", "ALL_USERS"),
      supabase.from("notification_reads").select("notification_id").eq("user_id", user.id),
      supabase.from("check_ins").select("restaurant_id, visited_at").eq("user_id", user.id),
    ]);

    profile = profileRes.data;
    isAdmin = profile?.role === "ADMIN";

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
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[#faf7ef]/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex min-h-12 shrink-0 items-center gap-2" aria-label="Hanu Hungry - Trang chủ">
            <Image src="/brand/logo.png" alt="" width={40} height={40} className="h-8 w-8 object-contain sm:h-10 sm:w-10" priority />
            <span className="brand-display text-[1.35rem] leading-none text-[var(--color-red)] sm:text-[1.65rem]">Hanu Hungry</span>
          </Link>
          {user && <Navigation isAdmin={isAdmin} signedIn={true} />}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <StreakIndicator streak={streakData} />
                {!isAdmin && (
                  <Link
                    href="/notifications"
                    className="relative inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[var(--color-pale)] text-[var(--color-red)] transition hover:bg-[#eadbc9] hover:scale-105 active:scale-95"
                    aria-label={`Thông báo bài viết từ Admin${unreadNotificationsCount > 0 ? ` (${unreadNotificationsCount} chưa đọc)` : ""}`}
                    title="Thông báo bài viết từ Admin"
                  >
                    <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-red)] px-1 text-[11px] font-black text-white shadow-sm animate-pulse">
                        {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                      </span>
                    )}
                  </Link>
                )}
                {isAdmin ? (
                  <Link
                    href="/profile"
                    className="flex min-h-10 sm:min-h-11 items-center gap-2 rounded-full border border-[#f0c2c6] bg-[#fdf2f2] px-3 sm:px-4 text-sm font-bold text-[var(--color-red)] shadow-xs transition hover:bg-[#fae6e6]"
                    title="Tài khoản Quản trị viên"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover border border-[var(--color-red)]" />
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-red)] text-white text-[10px]">👑</span>
                    )}
                    <span className="truncate max-w-[110px] sm:max-w-[150px]">{profile?.display_name || user.email?.split("@")[0] || "Admin"}</span>
                    <span className="inline-flex items-center rounded-full bg-[var(--color-red)] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                      Admin
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/profile"
                    className="hidden min-h-11 items-center gap-2 rounded-full bg-[var(--color-pale)] px-4 text-sm font-semibold text-[var(--color-red)] transition hover:bg-[#eadbc9] sm:flex"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                    ) : null}
                    <span>{profile?.display_name || user.email?.split("@")[0] || "Tài khoản"}</span>
                  </Link>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="button button-secondary shrink-0 whitespace-nowrap px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">Đăng nhập</Link>
                <Link href="/register" className="button button-primary shrink-0 whitespace-nowrap px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto min-h-[calc(100vh-15rem)] max-w-7xl px-4 pb-28 pt-6 sm:px-6 md:pb-14 md:pt-10">
        {children}
      </main>

      <footer className="border-t border-[var(--color-line)] bg-[#f1eadd] pb-24 md:pb-0">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-[var(--color-muted)] sm:px-6 md:flex-row md:items-center md:justify-between">
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
    </div>
  );
}
