"use client";

import { useMemo, useState } from "react";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminPrimitives";

export type RawCheckIn = {
  id: string;
  visited_at: string;
  restaurant_id: string;
  restaurant_name: string;
  dish_id: string | null;
  dish_name: string | null;
  user_id: string;
  user_name: string;
  student_code?: string;
};

export type AnalyticsSummary = {
  totalRestaurants: number;
  totalDishes: number;
  totalCheckIns: number;
  totalReviews: number;
  averageRating: number | null;
};

export type SystemAccount = {
  id: string;
  student_code: string;
  display_name: string;
  avatar_url: string | null;
  role: "USER" | "ADMIN";
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
};

type PeriodOption = "week" | "month" | "year" | "custom";
type MetricTab = "accounts" | "dishes" | "restaurants" | "users";

function formatRelativeTime(dateString: string): string {
  const d = new Date(dateString);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / (60 * 1000));
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

const CHART_COLORS = [
  "#b52a34", // Crimson Hanu
  "#de7056", // Coral
  "#d97706", // Amber
  "#059669", // Emerald
  "#2563eb", // Royal Blue
  "#7c3aed", // Violet
  "#db2777", // Pink
  "#4b5563", // Gray
];

function formatDateVN(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function toISODateInput(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${y}-${m}-${d}`;
}

/** SVG Donut Chart */
function DonutChart({
  items,
  total,
  title,
}: {
  items: Array<{ name: string; count: number; percent: number; color: string }>;
  total: number;
  title: string;
}) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let runningOffset = 0;
  const segments = items.map((item) => {
    const offsetPercent = runningOffset;
    runningOffset += item.percent;
    return {
      ...item,
      strokeDasharray: `${(item.percent / 100) * circumference} ${circumference}`,
      strokeDashoffset: -((offsetPercent / 100) * circumference),
    };
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-around p-2">
      <div className="relative flex shrink-0 items-center justify-center">
        <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke="#f2ebe2"
            strokeWidth="24"
          />
          {segments.map((segment, idx) => (
            <circle
              key={idx}
              cx="90"
              cy="90"
              r={radius}
              fill="transparent"
              stroke={segment.color}
              strokeWidth="24"
              strokeDasharray={segment.strokeDasharray}
              strokeDashoffset={segment.strokeDashoffset}
              className="transition-all duration-500 hover:opacity-80"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-black text-[var(--color-ink)]">{total}</span>
          <span className="text-xs text-[var(--color-muted)] font-medium">lượt</span>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-2.5">
        <h4 className="text-sm font-bold text-[var(--color-muted)] uppercase tracking-wider">{title}</h4>
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate font-medium text-[var(--color-ink)]">{item.name}</span>
              </div>
              <div className="shrink-0 font-bold text-[var(--color-ink)]">
                <span>{item.count}</span>
                <span className="ml-1 text-xs text-[var(--color-muted)] font-normal">({item.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** SVG Area & Line Chart */
function AreaChart({
  data,
}: {
  data: Array<{ label: string; count: number }>;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) return null;

  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 640;
  const height = 200;
  const paddingX = 40;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * chartW;
    const y = height - paddingY - (d.count / max) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full">
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 overflow-visible"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b52a34" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#b52a34" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#e6dcd1"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#f0e9df"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Area Fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Stroke Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#b52a34"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Point Dots */}
          {points.map((p, idx) => (
            <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 6 : 4}
                fill={hoveredIdx === idx ? "#84202a" : "#fff"}
                stroke="#b52a34"
                strokeWidth={hoveredIdx === idx ? 3 : 2}
                className="cursor-pointer transition-all"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Hover Info & X-axis labels */}
      <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>{data[0]?.label}</span>
        {hoveredIdx !== null && (
          <span className="font-bold text-[var(--color-red)] bg-[var(--color-pale)] px-2.5 py-0.5 rounded-full">
            {data[hoveredIdx].label}: {data[hoveredIdx].count} lượt check-in
          </span>
        )}
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/** Leaderboard with Podium Top 3 */
function Leaderboard({
  title,
  icon,
  emptyText,
  items,
}: {
  title: string;
  icon: string;
  emptyText: string;
  items: Array<{ id: string; name: string; count: number; sub?: string }>;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-3">
        <h3 className="flex items-center gap-2 text-base font-extrabold text-[var(--color-ink)]">
          <span>{icon}</span> {title}
        </h3>
        <span className="rounded-full bg-[var(--color-pale)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-red)]">
          {items.length} mục
        </span>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-muted)]">{emptyText}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {/* Podium for Top 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pb-2">
            {items.slice(0, 3).map((item, index) => (
              <div
                key={item.id}
                className={`relative rounded-xl border p-3 flex flex-col justify-between ${
                  index === 0
                    ? "border-amber-300 bg-amber-50/60 shadow-xs"
                    : index === 1
                    ? "border-slate-300 bg-slate-50/60"
                    : "border-orange-200 bg-orange-50/40"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xl" title={`Hạng ${index + 1}`}>
                    {medals[index]}
                  </span>
                  <span className="font-extrabold text-[var(--color-red)] text-base">
                    {item.count} <span className="text-xs font-medium text-[var(--color-muted)]">lượt</span>
                  </span>
                </div>
                <div className="mt-2 min-w-0">
                  <h4 className="truncate font-bold text-sm text-[var(--color-ink)]" title={item.name}>
                    {item.name}
                  </h4>
                  {item.sub && (
                    <p className="truncate text-xs text-[var(--color-muted)] font-mono">{item.sub}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Remaining items as ranked list */}
          {items.length > 3 && (
            <div className="divide-y divide-[var(--color-line)] border-t border-[var(--color-line)] pt-1 max-h-72 overflow-y-auto">
              {items.slice(3).map((item, index) => {
                const rank = index + 4;
                const percentage = Math.round((item.count / max) * 100);
                return (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="w-6 text-center text-xs font-bold text-[var(--color-muted)]">
                        #{rank}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-[var(--color-ink)]">{item.name}</p>
                        {item.sub && <p className="text-xs text-[var(--color-muted)] font-mono">{item.sub}</p>}
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#f4ebe1]">
                          <div
                            className="h-full rounded-full bg-[var(--color-coral)]"
                            style={{ width: `${Math.max(4, percentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 font-bold text-[var(--color-red)] text-right">
                      {item.count} <span className="text-xs font-normal text-[var(--color-muted)]">lượt</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
  const [accountSearch, setAccountSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "USER" | "ADMIN">("all");
  const [accountPage, setAccountPage] = useState(1);
  const ACCOUNTS_PER_PAGE = 15;

  // Sắp xếp tài khoản:
  // 1. Tất cả tài khoản Quản trị viên (ADMIN) luôn được ghim lên đầu trang (STT 1 và 2)
  // 2. Các tài khoản khác sắp xếp theo lần đăng nhập gần nhất (last_sign_in_at mới nhất lên trước)
  // 3. Nếu chưa đăng nhập: xếp sau cùng theo ngày tạo (created_at mới nhất)
  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      // 1. Ưu tiên ADMIN lên đầu
      if (a.role === "ADMIN" && b.role !== "ADMIN") return -1;
      if (a.role !== "ADMIN" && b.role === "ADMIN") return 1;

      // 2. Trong các tài khoản ADMIN:
      if (a.role === "ADMIN" && b.role === "ADMIN") {
        if (a.display_name === "mtvzzn") return -1;
        if (b.display_name === "mtvzzn") return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      // 3. Các tài khoản còn lại: sắp xếp theo đăng nhập gần nhất
      const timeA = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
      const timeB = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
      if (timeA !== timeB) {
        return timeB - timeA;
      }

      // 4. Nếu chưa đăng nhập: sắp xếp theo ngày đăng ký mới nhất
      const createdA = new Date(a.created_at).getTime();
      const createdB = new Date(b.created_at).getTime();
      return createdB - createdA;
    });
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    return sortedAccounts.filter((acc) => {
      if (roleFilter !== "all" && acc.role !== roleFilter) return false;
      if (!accountSearch.trim()) return true;
      const q = accountSearch.toLowerCase().trim();
      return (
        acc.display_name.toLowerCase().includes(q) ||
        acc.student_code.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q)
      );
    });
  }, [sortedAccounts, accountSearch, roleFilter]);

  const totalAccountPages = Math.max(1, Math.ceil(filteredAccounts.length / ACCOUNTS_PER_PAGE));
  const paginatedAccounts = useMemo(() => {
    const start = (accountPage - 1) * ACCOUNTS_PER_PAGE;
    return filteredAccounts.slice(start, start + ACCOUNTS_PER_PAGE);
  }, [filteredAccounts, accountPage]);

  const accountStats = useMemo(() => {
    const total = accounts.length;
    const userCount = accounts.filter((a) => a.role === "USER").length;
    const adminCount = accounts.filter((a) => a.role === "ADMIN").length;
    return { total, userCount, adminCount };
  }, [accounts]);

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

      {/* Main Tab Navigation Bar (Placed prominently at top) */}
      <div className="rounded-2xl border border-[var(--color-line)] bg-white p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "accounts", label: `👥 Danh sách tài khoản (${accounts.length})` },
            { id: "dishes", label: "🍜 Món ăn nhiều nhất" },
            { id: "restaurants", label: "🏪 Quán ghé thăm nhiều nhất" },
            { id: "users", label: "🏆 Ai ăn nhiều nhất" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as MetricTab)}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[var(--color-red)] text-white shadow-xs"
                  : "border border-[var(--color-line)] bg-[var(--color-pale)] text-[var(--color-ink)] hover:bg-[#ebdccc]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. ACCOUNTS DIRECTORY TAB (Được đưa lên đầu khi bấm tab Tài khoản) */}
      {activeTab === "accounts" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-xs">
              <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
                Tổng tài khoản hệ thống
              </p>
              <p className="mt-1.5 text-2xl font-black text-[var(--color-red)]">{accountStats.total}</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Số tài khoản sinh viên và quản trị viên</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-xs">
              <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
                Tài khoản Sinh viên (USER)
              </p>
              <p className="mt-1.5 text-2xl font-black text-emerald-600">{accountStats.userCount}</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Sinh viên tham gia sử dụng Hanu Hungry</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-xs">
              <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
                Quản trị viên (ADMIN)
              </p>
              <p className="mt-1.5 text-2xl font-black text-purple-700">{accountStats.adminCount}</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Tài khoản có quyền kiểm duyệt nội dung</p>
            </div>
          </div>

          {/* Directory Table Container */}
          <div className="rounded-2xl border border-[var(--color-line)] bg-white shadow-xs overflow-hidden">
            {/* Header, Search & Filter Controls */}
            <div className="p-4 sm:p-5 border-b border-[var(--color-line)] flex flex-col gap-3 sm:gap-4">
              <div>
                <h3 className="text-base font-extrabold text-[var(--color-ink)] flex items-center gap-2">
                  <span>👥</span> Danh sách người dùng trong hệ thống
                </h3>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">
                  Hiển thị {filteredAccounts.length} / {accounts.length} tài khoản (15 tài khoản mỗi trang)
                </p>
              </div>

              {/* Filters & Search Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 w-full">
                <div className="relative w-full sm:max-w-xs flex-1">
                  <input
                    type="text"
                    placeholder="🔍 Tìm MSSV, tên, email..."
                    value={accountSearch}
                    onChange={(e) => {
                      setAccountSearch(e.target.value);
                      setAccountPage(1);
                    }}
                    className="w-full rounded-xl border border-[var(--color-line)] bg-[#fcf9f5] px-3.5 py-2 text-xs font-medium placeholder:text-[var(--color-muted)] focus:outline-[var(--color-red)] shadow-xs"
                  />
                  {accountSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setAccountSearch("");
                        setAccountPage(1);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] px-1 cursor-pointer"
                      aria-label="Xóa tìm kiếm"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 rounded-xl bg-[var(--color-pale)] p-1 border border-[var(--color-line)] overflow-x-auto max-w-full shrink-0">
                  {(
                    [
                      { id: "all", label: `Tất cả (${accountStats.total})` },
                      { id: "USER", label: `Sinh viên (${accountStats.userCount})` },
                      { id: "ADMIN", label: `Admin (${accountStats.adminCount})` },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setRoleFilter(f.id);
                        setAccountPage(1);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                        roleFilter === f.id
                          ? "bg-[var(--color-ink)] text-white shadow-xs"
                          : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            {filteredAccounts.length === 0 ? (
              <p className="py-12 text-center text-sm text-[var(--color-muted)]">
                Không tìm thấy tài khoản nào phù hợp với bộ lọc tìm kiếm.
              </p>
            ) : (
              <div className="overflow-x-auto w-full max-w-full touch-pan-x">
                <div className="block sm:hidden text-[11px] text-[var(--color-muted)] px-4 py-1.5 bg-[#fdfaf5] border-b border-[var(--color-line)] italic">
                  👉 Cuộn ngang bảng để xem đầy đủ cột thông tin
                </div>
                <table className="w-full text-left text-sm min-w-[620px]">
                  <thead className="border-b border-[var(--color-line)] bg-[#fcf8f3] text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3 text-center w-14">STT</th>
                      <th className="py-3 px-4">Thành viên</th>
                      <th className="py-3 px-4">Mã sinh viên (MSSV)</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Vai trò</th>
                      <th className="py-3 px-4">Ngày tham gia</th>
                      <th className="py-3 px-4 text-right">Đăng nhập gần nhất</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line)]">
                    {paginatedAccounts.map((acc, index) => {
                      const isAdmin = acc.role === "ADMIN";
                      const stt = (accountPage - 1) * ACCOUNTS_PER_PAGE + index + 1;
                      return (
                        <tr key={acc.id} className="hover:bg-[#faf5ee] transition-colors">
                          <td className="py-3.5 px-3 text-center text-xs">
                            {isAdmin ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-900 font-black shadow-2xs">
                                {stt}
                              </span>
                            ) : (
                              <span className="font-semibold text-[var(--color-muted)]">{stt}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {acc.avatar_url ? (
                                <img
                                  src={acc.avatar_url}
                                  alt=""
                                  className="h-8 w-8 shrink-0 rounded-full object-cover border border-[var(--color-line)]"
                                />
                              ) : (
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                    isAdmin
                                      ? "bg-red-100 text-[var(--color-red)] ring-1 ring-red-300"
                                      : "bg-teal-100 text-teal-800"
                                  }`}
                                >
                                  {isAdmin ? "👑" : (acc.display_name || "S")[0].toUpperCase()}
                                </div>
                              )}
                              <span className="font-bold text-[var(--color-ink)]">
                                {acc.display_name || "Thành viên"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900 font-mono">
                              {acc.student_code}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs text-[var(--color-ink)] font-mono">
                              {acc.email}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap shrink-0 ${
                                isAdmin
                                  ? "bg-red-50 text-[var(--color-red)] border border-red-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              <span>{isAdmin ? "👑 Admin" : "🎓 Sinh viên"}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[var(--color-muted)]">
                            {new Date(acc.created_at).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-right text-xs">
                            {acc.last_sign_in_at ? (
                              <div>
                                <span className="font-bold text-[var(--color-ink)]">
                                  {formatRelativeTime(acc.last_sign_in_at)}
                                </span>
                                <p className="text-[11px] text-[var(--color-muted)]">
                                  {new Date(acc.last_sign_in_at).toLocaleDateString("vi-VN")}
                                </p>
                              </div>
                            ) : (
                              <span className="text-[var(--color-muted)] italic">Chưa ghi nhận</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls (Phân trang 15 người / trang) */}
            {totalAccountPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--color-line)] bg-[#fdfbf7] p-4 text-xs">
                <span className="text-[var(--color-muted)] font-medium">
                  Trang <strong className="text-[var(--color-red)] font-bold">{accountPage}</strong> /{" "}
                  <strong className="text-[var(--color-ink)] font-bold">{totalAccountPages}</strong> (Hiển thị{" "}
                  <strong className="text-[var(--color-ink)] font-bold">
                    {(accountPage - 1) * ACCOUNTS_PER_PAGE + 1}
                  </strong>{" "}
                  –{" "}
                  <strong className="text-[var(--color-ink)] font-bold">
                    {Math.min(accountPage * ACCOUNTS_PER_PAGE, filteredAccounts.length)}
                  </strong>{" "}
                  trong tổng số <strong className="text-[var(--color-red)] font-bold">{filteredAccounts.length}</strong> tài khoản)
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={accountPage <= 1}
                    onClick={() => setAccountPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-1.5 font-bold text-[var(--color-ink)] hover:bg-[var(--color-pale)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    ← Trước
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalAccountPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAccountPage(p)}
                        className={`h-8 w-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                          accountPage === p
                            ? "bg-[var(--color-red)] text-white shadow-xs"
                            : "border border-[var(--color-line)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-pale)]"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={accountPage >= totalAccountPages}
                    onClick={() => setAccountPage((p) => Math.min(totalAccountPages, p + 1))}
                    className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-1.5 font-bold text-[var(--color-ink)] hover:bg-[var(--color-pale)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    Sau →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}



      {/* 3. DATE RANGE FILTER CONTROL PANEL (Chỉ hiển thị cho các mục thống kê dữ liệu check-in) */}
      {activeTab !== "accounts" && (
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

            {/* Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "week", label: "Tuần vừa qua" },
                { id: "month", label: "Tháng vừa qua" },
                { id: "year", label: "Năm vừa qua" },
                { id: "custom", label: "Chọn theo lịch" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPeriod(opt.id as PeriodOption)}
                  className={`rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                    period === opt.id
                      ? "bg-[var(--color-red)] text-white shadow-xs"
                      : "border border-[var(--color-line)] bg-[var(--color-pale)] text-[var(--color-ink)] hover:bg-[#ebdccc]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
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
