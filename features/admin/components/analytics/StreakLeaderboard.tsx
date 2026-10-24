"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Flame,
  Trophy,
  Search,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import type { UserStreakRankingItem } from "./types";
import { formatRelativeTime } from "./utils";

const USERS_PER_PAGE = 15;

interface StreakLeaderboardProps {
  items: UserStreakRankingItem[];
}

export function StreakLeaderboard({ items }: StreakLeaderboardProps) {
  const [mode, setMode] = useState<"current" | "longest">("current");
  const [onlyActive, setOnlyActive] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // 1. KPI Totals
  const stats = useMemo(() => {
    let maxCurrent = 0;
    let maxLongest = 0;
    let currentLeader = "";
    let longestLeader = "";
    let activeCount = 0;
    let todayCount = 0;

    for (const item of items) {
      if (item.currentStreak > maxCurrent) {
        maxCurrent = item.currentStreak;
        currentLeader = item.displayName;
      }
      if (item.longestStreak > maxLongest) {
        maxLongest = item.longestStreak;
        longestLeader = item.displayName;
      }
      if (item.currentStreak > 0) {
        activeCount += 1;
      }
      if (item.isTodayCheckedIn) {
        todayCount += 1;
      }
    }

    return {
      maxCurrent,
      maxLongest,
      currentLeader: currentLeader || "Chưa có",
      longestLeader: longestLeader || "Chưa có",
      activeCount,
      todayCount,
      totalUsers: items.length,
    };
  }, [items]);

  // 2. Sort items based on mode
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (mode === "current") {
        if (b.currentStreak !== a.currentStreak) {
          return b.currentStreak - a.currentStreak;
        }
        if (b.longestStreak !== a.longestStreak) {
          return b.longestStreak - a.longestStreak;
        }
      } else {
        if (b.longestStreak !== a.longestStreak) {
          return b.longestStreak - a.longestStreak;
        }
        if (b.currentStreak !== a.currentStreak) {
          return b.currentStreak - a.currentStreak;
        }
      }
      if (b.totalCheckIns !== a.totalCheckIns) {
        return b.totalCheckIns - a.totalCheckIns;
      }
      return a.displayName.localeCompare(b.displayName);
    });
  }, [items, mode]);

  // 3. Filter items by active filter and search query
  const filteredItems = useMemo(() => {
    return sortedItems.filter((item) => {
      if (onlyActive) {
        const streakValue = mode === "current" ? item.currentStreak : item.longestStreak;
        if (streakValue <= 0) return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.displayName.toLowerCase().includes(q) ||
        item.studentCode.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q)
      );
    });
  }, [sortedItems, onlyActive, searchQuery, mode]);

  // 4. Pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / USERS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return filteredItems.slice(start, start + USERS_PER_PAGE);
  }, [filteredItems, currentPage]);

  // Max streak for percentage bar calculation
  const benchmarkStreak = useMemo(() => {
    const top = sortedItems[0];
    if (!top) return 1;
    const val = mode === "current" ? top.currentStreak : top.longestStreak;
    return Math.max(1, val);
  }, [sortedItems, mode]);

  // Podium top 3 (always take from top of current filtered list)
  const topThree = useMemo(() => {
    return filteredItems.slice(0, 3);
  }, [filteredItems]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. KPI SUMMARY CARDS */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Top Chuỗi Hiện Tại */}
        <div className="rounded-2xl border border-amber-200 bg-linear-to-br from-amber-500/10 via-amber-50/50 to-white p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Chuỗi hiện tại cao nhất
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
              <Flame className="h-4 w-4 fill-amber-500 text-amber-500 animate-pulse" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{stats.maxCurrent}</span>
            <span className="text-xs font-semibold text-[var(--color-muted)]">ngày liên tiếp</span>
          </div>
          <p className="mt-1 text-xs text-amber-900/80 truncate font-medium">
            🔥 Dẫn đầu: <strong className="text-amber-950">{stats.currentLeader}</strong>
          </p>
        </div>

        {/* Card 2: Kỷ Lục Chuỗi Hệ Thống */}
        <div className="rounded-2xl border border-purple-200 bg-linear-to-br from-purple-500/10 via-purple-50/50 to-white p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
              Kỷ lục chuỗi mọi thời đại
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600">
              <Trophy className="h-4 w-4 text-purple-600" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-700">{stats.maxLongest}</span>
            <span className="text-xs font-semibold text-[var(--color-muted)]">ngày kỷ lục</span>
          </div>
          <p className="mt-1 text-xs text-purple-900/80 truncate font-medium">
            👑 Kỷ lục gia: <strong className="text-purple-950">{stats.longestLeader}</strong>
          </p>
        </div>

        {/* Card 3: Đang Giữ Chuỗi */}
        <div className="rounded-2xl border border-emerald-200 bg-linear-to-br from-emerald-500/10 via-emerald-50/50 to-white p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Đang giữ chuỗi lửa
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{stats.activeCount}</span>
            <span className="text-xs font-semibold text-[var(--color-muted)]">
              / {stats.totalUsers} thành viên
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-800/80 font-medium">
            Tỉ lệ:{" "}
            <strong>
              {stats.totalUsers > 0 ? Math.round((stats.activeCount / stats.totalUsers) * 100) : 0}%
            </strong>{" "}
            thành viên đang giữ chuỗi
          </p>
        </div>

        {/* Card 4: Điểm Danh Hôm Nay */}
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Đã check-in hôm nay
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-[var(--color-red)]">
              <CalendarCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--color-red)]">{stats.todayCount}</span>
            <span className="text-xs font-semibold text-[var(--color-muted)]">lượt hôm nay</span>
          </div>
          <p className="mt-1 text-xs text-[var(--color-muted)] font-medium">
            Theo ngày lịch Việt Nam (Asia/Ho_Chi_Minh)
          </p>
        </div>
      </div>

      {/* 2. CONTROLS: MODE SWITCH & SEARCH & FILTER */}
      <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Mode switch tabs */}
          <div className="flex items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-pale)] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("current");
                setPage(1);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
                mode === "current"
                  ? "bg-white text-[var(--color-red)] shadow-xs"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              <Flame
                className={`h-4 w-4 ${mode === "current" ? "fill-orange-500 text-orange-500" : ""}`}
              />
              <span>Chuỗi hiện tại</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("longest");
                setPage(1);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
                mode === "longest"
                  ? "bg-white text-purple-700 shadow-xs"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              <Trophy
                className={`h-4 w-4 ${mode === "longest" ? "text-purple-600" : ""}`}
              />
              <span>Kỷ lục chuỗi</span>
            </button>
          </div>

          {/* Active only checkbox toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm font-medium text-[var(--color-ink)]">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => {
                setOnlyActive(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-gray-300 text-[var(--color-red)] focus:ring-[var(--color-red)] cursor-pointer"
            />
            <span>
              Chỉ hiện người dùng có chuỗi &gt; 0{" "}
              <span className="text-[var(--color-muted)] font-normal">
                ({mode === "current" ? stats.activeCount : items.filter((i) => i.longestStreak > 0).length})
              </span>
            </span>
          </label>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)]" />
          <input
            type="text"
            placeholder="Tìm theo MSSV, tên thành viên hoặc email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-pale)]/50 py-2 pl-9 pr-4 text-xs sm:text-sm font-medium text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-red)] focus:bg-white focus:outline-none transition shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. PODIUM TOP 3 (Chỉ hiển thị khi có ít nhất 1 kết quả) */}
      {topThree.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-3">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-[var(--color-ink)]">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>
                Vinh danh Top 3 {mode === "current" ? "Chuỗi hiện tại" : "Kỷ lục chuỗi"}
              </span>
            </h3>
            <span className="rounded-full bg-[var(--color-pale)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-red)]">
              {filteredItems.length} thành viên
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topThree.map((item, index) => {
              const streak = mode === "current" ? item.currentStreak : item.longestStreak;
              const isFirst = index === 0;
              const isSecond = index === 1;

              return (
                <div
                  key={item.userId}
                  className={`relative flex flex-col justify-between rounded-xl border p-4 transition hover:shadow-md ${
                    isFirst
                      ? "border-amber-300 bg-linear-to-b from-amber-50/90 via-amber-50/40 to-white shadow-xs"
                      : isSecond
                      ? "border-slate-300 bg-linear-to-b from-slate-50/90 via-slate-50/40 to-white"
                      : "border-orange-200 bg-linear-to-b from-orange-50/90 via-orange-50/40 to-white"
                  }`}
                >
                  {/* Top Bar: Medal & Streak Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl" title={`Hạng ${index + 1}`}>
                        {medals[index]}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
                        Hạng {index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 rounded-full bg-white/90 border border-amber-200 px-2.5 py-1 shadow-xs">
                      <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                      <span className="text-sm font-black text-orange-600">
                        {streak} <span className="text-xs font-semibold">ngày</span>
                      </span>
                    </div>
                  </div>

                  {/* User Profile */}
                  <div className="mt-3.5 flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-xs bg-[var(--color-pale)] flex items-center justify-center font-bold text-[var(--color-ink)] text-sm">
                      {item.avatarUrl ? (
                        <Image
                          src={item.avatarUrl}
                          alt={item.displayName}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <span>{item.displayName.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="truncate font-extrabold text-sm text-[var(--color-ink)]">
                          {item.displayName}
                        </h4>
                        {item.role === "ADMIN" && (
                          <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[10px] font-bold text-purple-700">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs font-mono text-[var(--color-muted)]">
                        MSSV: {item.studentCode}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Stats info */}
                  <div className="mt-4 pt-3 border-t border-[var(--color-line)]/50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[var(--color-muted)]">
                      <span>{mode === "current" ? "Kỷ lục chuỗi:" : "Chuỗi hiện tại:"}</span>
                      <strong className="text-[var(--color-ink)]">
                        {mode === "current" ? item.longestStreak : item.currentStreak} ngày
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-[var(--color-muted)]">
                      <span>Hôm nay:</span>
                      {item.isTodayCheckedIn ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Đã điểm danh
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-[var(--color-muted)]">
                          <Clock className="h-3 w-3" /> Chưa check-in
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DETAILED LEADERBOARD TABLE */}
      <div className="rounded-2xl border border-[var(--color-line)] bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-line)] p-4 sm:px-5">
          <div>
            <h3 className="text-base font-extrabold text-[var(--color-ink)]">
              Bảng xếp hạng chi tiết
            </h3>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              Đang sắp xếp theo:{" "}
              <strong className="text-[var(--color-red)] font-semibold">
                {mode === "current" ? "Chuỗi hiện tại (ngày liên tục)" : "Chuỗi kỷ lục (dài nhất lịch sử)"}
              </strong>
            </p>
          </div>

          <span className="rounded-full bg-[var(--color-pale)] px-2.5 py-1 text-xs font-bold text-[var(--color-ink)] self-start sm:self-auto">
            Trang {currentPage}/{totalPages} • {filteredItems.length} kết quả
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--color-muted)] space-y-2">
            <p className="text-2xl">🔍</p>
            <p className="font-semibold text-[var(--color-ink)]">Không tìm thấy thành viên nào</p>
            <p className="text-xs">
              Thử tắt bộ lọc &quot;Chỉ hiện người dùng có chuỗi &gt; 0&quot; hoặc tìm bằng từ khóa khác.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] bg-[var(--color-pale)]/50 text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
                  <th scope="col" className="py-3 pl-4 pr-2 text-center w-14">
                    Thứ hạng
                  </th>
                  <th scope="col" className="py-3 px-3">
                    Thành viên
                  </th>
                  <th scope="col" className="py-3 px-3 text-center">
                    Chuỗi hiện tại
                  </th>
                  <th scope="col" className="py-3 px-3 text-center">
                    Kỷ lục chuỗi
                  </th>
                  <th scope="col" className="py-3 px-3 text-center">
                    Điểm danh hôm nay
                  </th>
                  <th scope="col" className="py-3 px-3 text-right">
                    Tổng lượt ăn
                  </th>
                  <th scope="col" className="py-3 pl-3 pr-4 text-right">
                    Check-in gần nhất
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {paginatedItems.map((item, index) => {
                  const absoluteRank = (currentPage - 1) * USERS_PER_PAGE + index + 1;
                  const primaryStreak = mode === "current" ? item.currentStreak : item.longestStreak;
                  const percentage = Math.min(100, Math.round((primaryStreak / benchmarkStreak) * 100));

                  return (
                    <tr
                      key={item.userId}
                      className="hover:bg-[var(--color-pale)]/40 transition-colors"
                    >
                      {/* Rank */}
                      <td className="py-3 pl-4 pr-2 text-center">
                        {absoluteRank === 1 ? (
                          <span className="text-lg" title="Quán quân">🥇</span>
                        ) : absoluteRank === 2 ? (
                          <span className="text-lg" title="Á quân 1">🥈</span>
                        ) : absoluteRank === 3 ? (
                          <span className="text-lg" title="Á quân 2">🥉</span>
                        ) : (
                          <span className="font-bold text-[var(--color-muted)]">
                            #{absoluteRank}
                          </span>
                        )}
                      </td>

                      {/* Member profile */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5 min-w-[180px]">
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[var(--color-line)] bg-[var(--color-pale)] flex items-center justify-center font-bold text-xs text-[var(--color-ink)]">
                            {item.avatarUrl ? (
                              <Image
                                src={item.avatarUrl}
                                alt={item.displayName}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            ) : (
                              <span>{item.displayName.slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate font-bold text-[var(--color-ink)]" title={item.displayName}>
                                {item.displayName}
                              </p>
                              {item.role === "ADMIN" && (
                                <span className="rounded bg-purple-100 px-1 py-0.2 text-[9px] font-bold text-purple-700">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <p className="truncate text-xs font-mono text-[var(--color-muted)]">
                              MSSV: {item.studentCode}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Current Streak */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`inline-flex items-center gap-1 font-bold ${
                              item.currentStreak > 0
                                ? "text-orange-600 font-extrabold"
                                : "text-[var(--color-muted)]"
                            }`}
                          >
                            <Flame
                              className={`h-4 w-4 ${
                                item.currentStreak > 0
                                  ? "fill-orange-500 text-orange-500 animate-pulse"
                                  : "text-gray-300"
                              }`}
                            />
                            <span>{item.currentStreak} ngày</span>
                          </span>

                          {mode === "current" && (
                            <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-[#f4ebe1]">
                              <div
                                className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-500 transition-all duration-300"
                                style={{ width: `${Math.max(4, percentage)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Longest Streak */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              item.longestStreak > 0
                                ? "text-purple-700 font-bold"
                                : "text-[var(--color-muted)]"
                            }`}
                          >
                            <Trophy className="h-3.5 w-3.5 text-purple-600" />
                            <span>{item.longestStreak} ngày</span>
                          </span>

                          {mode === "longest" && (
                            <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-[#f4ebe1]">
                              <div
                                className="h-full rounded-full bg-linear-to-r from-purple-400 to-indigo-600 transition-all duration-300"
                                style={{ width: `${Math.max(4, percentage)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Today Checked In */}
                      <td className="py-3 px-3 text-center">
                        {item.isTodayCheckedIn ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Đã ăn 🔥
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-xs font-medium text-[var(--color-muted)]">
                            <Clock className="h-3 w-3" /> Chưa ⏳
                          </span>
                        )}
                      </td>

                      {/* Total Check-ins */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-extrabold text-[var(--color-ink)]">
                          {item.totalCheckIns.toLocaleString("vi-VN")}
                        </span>
                        <span className="ml-1 text-xs text-[var(--color-muted)] font-normal">lượt</span>
                      </td>

                      {/* Last check in */}
                      <td className="py-3 pl-3 pr-4 text-right text-xs text-[var(--color-muted)]">
                        {item.lastCheckInAt ? formatRelativeTime(item.lastCheckInAt) : "Chưa có"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--color-line)] p-3 sm:px-5 text-xs sm:text-sm">
            <span className="text-[var(--color-muted)]">
              Hiển thị {(currentPage - 1) * USERS_PER_PAGE + 1} -{" "}
              {Math.min(currentPage * USERS_PER_PAGE, filteredItems.length)} trên tổng{" "}
              {filteredItems.length}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-lg border border-[var(--color-line)] bg-white px-2.5 py-1.5 font-bold text-[var(--color-ink)] hover:bg-[var(--color-pale)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-xs"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Trang trước</span>
              </button>

              <span className="px-2 font-bold text-[var(--color-ink)]">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 rounded-lg border border-[var(--color-line)] bg-white px-2.5 py-1.5 font-bold text-[var(--color-ink)] hover:bg-[var(--color-pale)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-xs"
              >
                <span className="hidden sm:inline">Trang sau</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
