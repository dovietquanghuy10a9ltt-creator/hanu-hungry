"use client";

import { useMemo, useState } from "react";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminPrimitives";

import type {
  RawCheckIn,
  AnalyticsSummary,
  SystemAccount,
  PeriodOption,
  MetricTab,
  UserStreakRankingItem,
} from "./analytics/types";
import {
  CHART_COLORS,
  formatDateVN,
  toISODateInput,
} from "./analytics/utils";
import {
  DonutChart,
  AreaChart,
  Leaderboard,
} from "./analytics/AnalyticsCharts";
import { AccountsTable } from "./analytics/AccountsTable";
import { StreakLeaderboard } from "./analytics/StreakLeaderboard";
import { historyStats, localDayOrdinal } from "@/features/history/stats";

export type {
  RawCheckIn,
  AnalyticsSummary,
  SystemAccount,
  PeriodOption,
  MetricTab,
  UserStreakRankingItem,
};

export function AdminInteractiveAnalytics({
  summary,
  checkIns,
  accounts = [],
}: {
  summary: AnalyticsSummary;
  checkIns: RawCheckIn[];
  accounts?: SystemAccount[];
}) {
  const [period, setPeriod] = useState<PeriodOption>("week");
  const [activeTab, setActiveTab] = useState<MetricTab>("accounts");

  // Date range state
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [customStart, setCustomStart] = useState<string>(toISODateInput(weekAgo));
  const [customEnd, setCustomEnd] = useState<string>(toISODateInput(now));

  // Determine current effective date bounds
  const { startDate, endDate, periodLabel } = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    if (period === "week") {
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      return { startDate: start, endDate: end, periodLabel: "Tuần vừa qua (7 ngày gần nhất)" };
    }
    if (period === "month") {
      const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      return { startDate: start, endDate: end, periodLabel: "Tháng vừa qua (30 ngày gần nhất)" };
    }
    if (period === "year") {
      const start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      return { startDate: start, endDate: end, periodLabel: "Năm vừa qua (365 ngày gần nhất)" };
    }
    // Custom date picker
    const start = new Date(customStart);
    start.setHours(0, 0, 0, 0);
    const customEndDate = new Date(customEnd);
    customEndDate.setHours(23, 59, 59, 999);
    return {
      startDate: start,
      endDate: customEndDate,
      periodLabel: `Từ ${formatDateVN(start)} đến ${formatDateVN(customEndDate)}`,
    };
  }, [period, customStart, customEnd]);

  // Filter check-ins within the selected period
  const filteredCheckIns = useMemo(() => {
    return checkIns.filter((item) => {
      const t = new Date(item.visited_at).getTime();
      return t >= startDate.getTime() && t <= endDate.getTime();
    });
  }, [checkIns, startDate, endDate]);

  // 1. Top Dishes (món ăn nhiều nhất)
  const topDishes = useMemo(() => {
    const dishCounts = new Map<string, { id: string; name: string; count: number; sub?: string }>();
    for (const ci of filteredCheckIns) {
      if (ci.dish_name) {
        const key = ci.dish_name;
        const current = dishCounts.get(key) || {
          id: ci.dish_id || key,
          name: key,
          count: 0,
          sub: ci.restaurant_name ? `Quán: ${ci.restaurant_name}` : undefined,
        };
        current.count += 1;
        dishCounts.set(key, current);
      }
    }
    return Array.from(dishCounts.values()).sort((a, b) => b.count - a.count);
  }, [filteredCheckIns]);

  // 2. Top Visited Restaurants (quán ghé thăm nhiều nhất)
  const topRestaurants = useMemo(() => {
    const restCounts = new Map<string, { id: string; name: string; count: number }>();
    for (const ci of filteredCheckIns) {
      if (ci.restaurant_name) {
        const key = ci.restaurant_name;
        const current = restCounts.get(key) || { id: ci.restaurant_id || key, name: key, count: 0 };
        current.count += 1;
        restCounts.set(key, current);
      }
    }
    return Array.from(restCounts.values()).sort((a, b) => b.count - a.count);
  }, [filteredCheckIns]);

  // 3. Top Active Users / Who eats most (ai ăn nhiều nhất)
  const topUsers = useMemo(() => {
    const userCounts = new Map<string, { id: string; name: string; count: number; sub?: string }>();
    for (const ci of filteredCheckIns) {
      if (ci.user_name || ci.user_id) {
        const key = ci.user_id;
        const current = userCounts.get(key) || {
          id: key,
          name: ci.user_name || "Thành viên",
          count: 0,
          sub: ci.student_code ? `MSSV: ${ci.student_code}` : undefined,
        };
        current.count += 1;
        userCounts.set(key, current);
      }
    }
    return Array.from(userCounts.values()).sort((a, b) => b.count - a.count);
  }, [filteredCheckIns]);

  // 3b. Streak ranking across all user accounts
  const streakRanking = useMemo<UserStreakRankingItem[]>(() => {
    // Group all checkIns by user_id
    const userCheckInsMap = new Map<string, Array<{ restaurant_id: string; visited_at: string }>>();
    const lastVisitedMap = new Map<string, string>();
    const userMetaMap = new Map<string, { displayName: string; studentCode?: string }>();

    for (const ci of checkIns) {
      if (!ci.user_id) continue;
      let list = userCheckInsMap.get(ci.user_id);
      if (!list) {
        list = [];
        userCheckInsMap.set(ci.user_id, list);
      }
      list.push({ restaurant_id: ci.restaurant_id, visited_at: ci.visited_at });

      if (!lastVisitedMap.has(ci.user_id) || new Date(ci.visited_at) > new Date(lastVisitedMap.get(ci.user_id)!)) {
        lastVisitedMap.set(ci.user_id, ci.visited_at);
      }

      if (!userMetaMap.has(ci.user_id) && (ci.user_name || ci.student_code)) {
        userMetaMap.set(ci.user_id, {
          displayName: ci.user_name || "Thành viên",
          studentCode: ci.student_code,
        });
      }
    }

    const todayOrd = localDayOrdinal(new Date());
    const seenUserIds = new Set<string>();
    const ranking: UserStreakRankingItem[] = [];

    // 1. Process accounts list
    for (const acc of accounts) {
      seenUserIds.add(acc.id);
      const userCIs = userCheckInsMap.get(acc.id) || [];
      const stats = historyStats(userCIs);
      const daySet = new Set(userCIs.map((item) => localDayOrdinal(new Date(item.visited_at))));
      const isTodayCheckedIn = daySet.has(todayOrd);

      ranking.push({
        userId: acc.id,
        studentCode: acc.student_code,
        displayName: acc.display_name,
        avatarUrl: acc.avatar_url,
        role: acc.role,
        email: acc.email,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        isTodayCheckedIn,
        totalCheckIns: userCIs.length,
        lastCheckInAt: lastVisitedMap.get(acc.id) || null,
      });
    }

    // 2. Include any user present in check-ins but not in accounts table (edge case fallback)
    for (const [userId, userCIs] of userCheckInsMap.entries()) {
      if (seenUserIds.has(userId)) continue;
      const meta = userMetaMap.get(userId);
      const stats = historyStats(userCIs);
      const daySet = new Set(userCIs.map((item) => localDayOrdinal(new Date(item.visited_at))));
      const isTodayCheckedIn = daySet.has(todayOrd);

      ranking.push({
        userId,
        studentCode: meta?.studentCode || "—",
        displayName: meta?.displayName || "Thành viên",
        avatarUrl: null,
        role: "USER",
        email: "—",
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        isTodayCheckedIn,
        totalCheckIns: userCIs.length,
        lastCheckInAt: lastVisitedMap.get(userId) || null,
      });
    }

    return ranking;
  }, [checkIns, accounts]);

  const activeStreakCount = useMemo(() => {
    return streakRanking.filter((item) => item.currentStreak > 0).length;
  }, [streakRanking]);

  // 4. Area Chart daily activity
  const dailyActivity = useMemo(() => {
    const dayMap = new Map<string, number>();
    // Pre-populate days in range if period is <= 31 days
    const diffDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)));
    if (diffDays <= 31) {
      for (let i = 0; i <= diffDays; i++) {
        const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        if (d <= endDate) {
          dayMap.set(formatDateVN(d).slice(0, 5), 0);
        }
      }
    }

    for (const ci of filteredCheckIns) {
      const d = new Date(ci.visited_at);
      const label = diffDays > 31 ? `${d.getMonth() + 1}/${d.getFullYear()}` : formatDateVN(d).slice(0, 5);
      dayMap.set(label, (dayMap.get(label) || 0) + 1);
    }

    return Array.from(dayMap.entries()).map(([label, count]) => ({ label, count }));
  }, [filteredCheckIns, startDate, endDate]);

  // 4b. Area Chart daily dish activity (chỉ tính lượt có món ăn cụ thể)
  const dailyDishActivity = useMemo(() => {
    const dayMap = new Map<string, number>();
    const diffDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)));
    if (diffDays <= 31) {
      for (let i = 0; i <= diffDays; i++) {
        const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        if (d <= endDate) {
          dayMap.set(formatDateVN(d).slice(0, 5), 0);
        }
      }
    }

    for (const ci of filteredCheckIns) {
      if (ci.dish_name) {
        const d = new Date(ci.visited_at);
        const label = diffDays > 31 ? `${d.getMonth() + 1}/${d.getFullYear()}` : formatDateVN(d).slice(0, 5);
        dayMap.set(label, (dayMap.get(label) || 0) + 1);
      }
    }

    return Array.from(dayMap.entries()).map(([label, count]) => ({ label, count }));
  }, [filteredCheckIns, startDate, endDate]);

  // 5. Donut Chart distribution data (Top Restaurants)
  const restaurantDonutData = useMemo(() => {
    const total = filteredCheckIns.length;
    if (total === 0) return [];
    const top = topRestaurants.slice(0, 5);
    const topCount = top.reduce((acc, r) => acc + r.count, 0);
    const otherCount = total - topCount;

    const slices = top.map((r, i) => ({
      name: r.name,
      count: r.count,
      percent: Math.round((r.count / total) * 100),
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

    if (otherCount > 0) {
      slices.push({
        name: "Các quán khác",
        count: otherCount,
        percent: Math.round((otherCount / total) * 100),
        color: "#9ca3af",
      });
    }

    return slices;
  }, [filteredCheckIns.length, topRestaurants]);

  // 6. Donut Chart distribution data (Top Dishes)
  const dishDonutData = useMemo(() => {
    const totalWithDishes = filteredCheckIns.filter((c) => Boolean(c.dish_name)).length;
    if (totalWithDishes === 0) return [];
    const top = topDishes.slice(0, 5);
    const topCount = top.reduce((acc, d) => acc + d.count, 0);
    const otherCount = totalWithDishes - topCount;

    const slices = top.map((d, i) => ({
      name: d.name,
      count: d.count,
      percent: Math.round((d.count / totalWithDishes) * 100),
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

    if (otherCount > 0) {
      slices.push({
        name: "Các món khác",
        count: otherCount,
        percent: Math.round((otherCount / totalWithDishes) * 100),
        color: "#9ca3af",
      });
    }

    return slices;
  }, [filteredCheckIns, topDishes]);

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Thống kê trực quan"
        description="Báo cáo số liệu thực tế dựa trên check-in, quán ghé thăm và món ăn được yêu thích."
      />

      {/* Global Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminCard>
          <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">Quán đang hoạt động</p>
          <p className="mt-2 text-3xl font-black text-[var(--color-red)]">{summary.totalRestaurants.toLocaleString("vi-VN")}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">Món trong thực đơn</p>
          <p className="mt-2 text-3xl font-black text-[var(--color-red)]">{summary.totalDishes.toLocaleString("vi-VN")}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">Tổng lượt check-in</p>
          <p className="mt-2 text-3xl font-black text-[var(--color-red)]">{summary.totalCheckIns.toLocaleString("vi-VN")}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">Điểm đánh giá TB</p>
          <p className="mt-2 text-3xl font-black text-[var(--color-red)]">
            {summary.averageRating !== null ? `${summary.averageRating} ★` : "—"}
          </p>
        </AdminCard>
      </div>

      {/* Main Tab Navigation Bar (Dropdown for mobile optimization) */}
      <div className="rounded-2xl border border-[var(--color-line)] bg-white p-3.5 shadow-xs">
        <label htmlFor="admin-main-tab-select" className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-1.5">
          Mục thống kê & Quản lý
        </label>
        <div className="relative">
          <select
            id="admin-main-tab-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as MetricTab)}
            style={{
              WebkitAppearance: "none",
              MozAppearance: "none",
              appearance: "none",
            }}
            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-pale)] py-2.5 pl-4 pr-10 text-sm font-bold text-[var(--color-ink)] hover:bg-[#ebdccc] focus:border-[var(--color-red)] focus:outline-none cursor-pointer shadow-xs transition"
          >
            <option value="accounts">👥 Danh sách tài khoản ({accounts.length})</option>
            <option value="streaks">🔥 Ranking chuỗi của user ({activeStreakCount} đang giữ chuỗi)</option>
            <option value="dishes">🍜 Món ăn nhiều nhất</option>
            <option value="restaurants">🏪 Quán ghé thăm nhiều nhất</option>
            <option value="users">🏆 Ai ăn nhiều nhất</option>
          </select>
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)] select-none" aria-hidden="true">
            ▼
          </span>
        </div>
      </div>

      {/* 1. ACCOUNTS DIRECTORY TAB */}
      {activeTab === "accounts" && <AccountsTable accounts={accounts} />}

      {/* 2. STREAKS LEADERBOARD TAB */}
      {activeTab === "streaks" && <StreakLeaderboard items={streakRanking} />}

      {/* 3. DATE RANGE FILTER CONTROL PANEL (Chỉ hiển thị cho các mục thống kê dữ liệu check-in) */}
      {activeTab !== "accounts" && activeTab !== "streaks" && (
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-[var(--color-ink)] flex items-center gap-2">
                <span>📅</span> Khoảng thời gian thống kê
              </h2>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Đang hiển thị dữ liệu: <strong className="text-[var(--color-red)] font-semibold">{periodLabel}</strong> (Tổng {filteredCheckIns.length} lượt check-in)
              </p>
            </div>

            {/* Preset Dropdown Select */}
            <div className="w-full sm:w-auto">
              <label htmlFor="admin-period-select" className="sr-only">Khoảng thời gian thống kê</label>
              <div className="relative">
                <select
                  id="admin-period-select"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as PeriodOption)}
                  style={{
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    appearance: "none",
                  }}
                  className="w-full sm:w-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-pale)] px-4 py-2.5 text-xs sm:text-sm font-bold text-[var(--color-ink)] hover:bg-[#ebdccc] focus:border-[var(--color-red)] focus:outline-none cursor-pointer pr-9 shadow-xs"
                >
                  <option value="week">📅 Tuần vừa qua</option>
                  <option value="month">📅 Tháng vừa qua</option>
                  <option value="year">📅 Năm vừa qua</option>
                  <option value="custom">🗓️ Chọn theo lịch</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)] select-none" aria-hidden="true">▼</span>
              </div>
            </div>
          </div>

          {/* Real Date Range Picker (Lịch thực tế) */}
          {period === "custom" && (
            <div className="rounded-xl border border-dashed border-[var(--color-coral)] bg-[#fdfaf6] p-4 flex flex-wrap items-center gap-4 text-sm animate-fadeIn">
              <span className="font-bold text-[var(--color-red)] flex items-center gap-1.5">
                <span>🗓️</span> Chọn ngày chính xác:
              </span>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-[var(--color-muted)]">Từ ngày:</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold shadow-inner focus:outline-[var(--color-red)]"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-[var(--color-muted)]">Đến ngày:</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold shadow-inner focus:outline-[var(--color-red)]"
                />
              </div>
              <span className="text-xs text-[var(--color-muted)] italic">
                (Dữ liệu tự động cập nhật ngay khi thay đổi ngày)
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. BIỂU ĐỒ (Charts Section) */}
      {(activeTab === "restaurants" || activeTab === "dishes") && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sơ đồ đường miền xu hướng */}
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[var(--color-ink)] flex items-center gap-2">
                  <span>📈</span> {activeTab === "dishes" ? "Xu hướng món ăn (Sơ đồ miền)" : "Xu hướng check-in quán (Sơ đồ miền)"}
                </h3>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">
                  {activeTab === "dishes"
                    ? "Số lượt thưởng thức món ăn theo các mốc thời gian"
                    : "Số lượt check-in theo các mốc thời gian"}
                </p>
              </div>
              <span className="rounded-full bg-[var(--color-pale)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-red)]">
                {activeTab === "dishes"
                  ? `${filteredCheckIns.filter((c) => Boolean(c.dish_name)).length} lượt món`
                  : `${filteredCheckIns.length} lượt`}
              </span>
            </div>

            {activeTab === "dishes" ? (
              filteredCheckIns.filter((c) => Boolean(c.dish_name)).length > 0 ? (
                <AreaChart data={dailyDishActivity} />
              ) : (
                <p className="py-12 text-center text-sm text-[var(--color-muted)]">
                  Chưa có dữ liệu check-in món ăn nào trong khoảng thời gian này.
                </p>
              )
            ) : filteredCheckIns.length > 0 ? (
              <AreaChart data={dailyActivity} />
            ) : (
              <p className="py-12 text-center text-sm text-[var(--color-muted)]">
                Chưa có dữ liệu check-in trong khoảng thời gian này.
              </p>
            )}
          </div>

          {/* Sơ đồ tròn phân bổ (Tách biệt hoàn toàn món ăn và quán) */}
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[var(--color-ink)] flex items-center gap-2">
                  <span>🍩</span> Phân bổ tỉ lệ (Sơ đồ tròn)
                </h3>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">
                  {activeTab === "dishes" ? "Tỉ lệ theo món ăn" : "Tỉ lệ theo quán ăn ghé thăm"}
                </p>
              </div>
              <span className="text-xs text-[var(--color-muted)]">
                {periodLabel}
              </span>
            </div>

            {activeTab === "dishes" ? (
              dishDonutData.length > 0 ? (
                <DonutChart
                  items={dishDonutData}
                  total={filteredCheckIns.filter((c) => Boolean(c.dish_name)).length}
                  title="Tỉ lệ món ăn"
                />
              ) : (
                <p className="py-12 text-center text-sm text-[var(--color-muted)]">
                  Chưa có món ăn nào được ghi nhận check-in trong khoảng thời gian này.
                </p>
              )
            ) : restaurantDonutData.length > 0 ? (
              <DonutChart
                items={restaurantDonutData}
                total={filteredCheckIns.length}
                title="Tỉ lệ quán ghé thăm"
              />
            ) : (
              <p className="py-12 text-center text-sm text-[var(--color-muted)]">
                Chưa có lượt check-in quán ăn nào trong khoảng thời gian này.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4. BẢNG XẾP HẠNG (Leaderboard Section) */}
      {activeTab === "dishes" && (
        <Leaderboard
          title="Món ăn nhiều nhất"
          icon="🍜"
          emptyText="Chưa có món ăn nào được ghi nhận check-in trong khoảng thời gian này."
          items={topDishes}
        />
      )}

      {activeTab === "restaurants" && (
        <Leaderboard
          title="Quán ghé thăm nhiều nhất"
          icon="🏪"
          emptyText="Chưa có quán ăn nào được ghé thăm trong khoảng thời gian này."
          items={topRestaurants}
        />
      )}

      {activeTab === "users" && (
        <Leaderboard
          title="Ai ăn nhiều nhất"
          icon="🏆"
          emptyText="Chưa có thành viên nào check-in trong khoảng thời gian này."
          items={topUsers}
        />
      )}
    </div>
  );
}
