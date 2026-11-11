import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { historyStats, localDayOrdinal } from "@/features/history/stats";
import type { StreakData } from "@/components/shared/streak-indicator";

export async function GET() {
  const account = await getCurrentProfile();
  if (!account) {
    return NextResponse.json({ authenticated: false });
  }

  const { user, profile } = account;
  const isAdmin = profile.role === "ADMIN";
  let unreadNotificationsCount = 0;
  let streakData: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    isTodayCheckedIn: false,
    weekDays: [],
  };

  try {
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
    const dayNames = ["T2", "T3", "T4", "T5", "T6", "CN"];
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
  } catch (err) {
    console.error("[api/me] Error computing user stats:", err);
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    isAdmin,
    unreadNotificationsCount,
    streakData,
  });
}
