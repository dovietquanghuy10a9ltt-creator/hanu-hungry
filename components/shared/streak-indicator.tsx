"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Flame, Calendar, Trophy, Utensils, ChevronRight } from "lucide-react";

export interface WeekDayStreak {
  dayLabel: string;
  isToday: boolean;
  checkedIn: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  isTodayCheckedIn: boolean;
  weekDays: WeekDayStreak[];
}

export function StreakIndicator({ streak }: { streak: StreakData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const showCelebration = searchParams.get("added") === "1" && !isDismissed;

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const closeCelebration = () => {
    setIsDismissed(true);
    // Remove ?added=1 from URL without full reload
    const params = new URLSearchParams(searchParams.toString());
    params.delete("added");
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  const { currentStreak, longestStreak, isTodayCheckedIn, weekDays } = streak;

  return (
    <div className="relative" ref={popoverRef}>
      {/* 1. Navbar Flame Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex min-h-9 sm:min-h-11 items-center gap-1.5 rounded-full px-2 sm:px-3 text-xs sm:text-sm font-black transition cursor-pointer select-none ${
          isTodayCheckedIn
            ? "border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 text-orange-600 shadow-xs hover:border-orange-400 hover:shadow-sm"
            : "border border-[var(--color-line)] bg-[var(--color-pale)] text-[var(--color-muted)] hover:bg-[#ebdccc] hover:text-[var(--color-ink)]"
        }`}
        title={
          isTodayCheckedIn
            ? `Chuỗi ${currentStreak} ngày đang cháy rực rỡ! 🔥`
            : currentStreak > 0
            ? `Chuỗi ${currentStreak} ngày — Đốm lửa đang tắt, hãy ăn hôm nay để giữ chuỗi!`
            : "Chưa có chuỗi ngày — Check-in ăn uống hôm nay để thắp lửa!"
        }
        aria-label="Thông tin chuỗi ăn uống"
      >
        {/* Flame Icon */}
        <Flame
          className={`h-5 w-5 sm:h-5.5 sm:w-5.5 transition-transform duration-300 group-hover:scale-115 ${
            isTodayCheckedIn
              ? "text-orange-500 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse"
              : "text-stone-400 opacity-60"
          }`}
        />

        {/* Streak Number */}
        <span
          className={`font-black ${
            isTodayCheckedIn
              ? "text-orange-600"
              : "text-[var(--color-muted)]"
          }`}
        >
          {currentStreak}
        </span>
      </button>

      {/* 2. Elevated Streak Popover */}
      {isOpen && (
        <div className="fixed inset-x-3 top-16 mx-auto max-w-sm sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2.5 sm:w-92 sm:max-w-none sm:mx-0 rounded-3xl border border-amber-200/90 bg-gradient-to-b from-[#fffefc] via-white to-[#fbf7f0] p-5 sm:p-6 shadow-[0_20px_50px_rgba(74,53,37,0.18),0_4px_16px_rgba(0,0,0,0.06)] z-50 animate-fadeIn space-y-4.5">
          {/* Header Flame Hero & Streak Count */}
          <div className="flex flex-col items-center text-center space-y-2">
            {/* Multi-layered Glowing Flame Hero */}
            <div className="relative flex items-center justify-center my-1">
              {isTodayCheckedIn ? (
                <>
                  <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-amber-400/40 via-orange-500/35 to-red-400/30 blur-xl animate-pulse" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 p-3 shadow-lg shadow-orange-500/30 ring-4 ring-amber-100 ring-offset-2 ring-offset-white">
                    <Flame className="h-11 w-11 text-white fill-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)] animate-bounce" />
                  </div>
                </>
              ) : (
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-stone-100 to-stone-200 border-2 border-stone-200/80 shadow-inner">
                  <Flame className="h-10 w-10 text-stone-400 opacity-60" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-[var(--color-ink)] tracking-tight">
                {currentStreak > 0 ? `Chuỗi ${currentStreak} ngày!` : "Chưa có chuỗi ngày"}
              </h3>

              {isTodayCheckedIn ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-black text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Đã thắp sáng hôm nay
                </span>
              ) : currentStreak > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-black text-amber-800">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  Đang chờ bạn check-in
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-[11px] font-bold text-stone-600">
                  Bắt đầu chuỗi ngay hôm nay
                </span>
              )}
            </div>

            <p className="text-xs text-[var(--color-muted)] leading-relaxed max-w-[270px]">
              {isTodayCheckedIn
                ? "Ngọn lửa của bạn đang bùng cháy rực rỡ! Hãy giữ vững phong độ và tiếp tục check-in vào ngày mai nhé."
                : currentStreak > 0
                ? "Đốm lửa đang chờ bạn! Hãy ghé một quán ăn và check-in hôm nay để không gián đoạn chuỗi ngày."
                : "Check-in quán ăn đầu tiên hôm nay để thắp sáng chuỗi ngọn lửa ẩm thực của bạn!"}
            </p>
          </div>

          {/* Connected 7-Day Achievement Track */}
          <div className="rounded-2xl border border-[var(--color-line)] bg-gradient-to-b from-[#fdfbf8] to-[#f7f1e7] p-3.5 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs px-0.5">
              <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-[var(--color-ink)] uppercase tracking-wider">
                <Calendar className="h-3.5 w-3.5 text-orange-500" />
                <span>Tiến độ tuần này</span>
              </span>
              {isTodayCheckedIn && (
                <span className="text-emerald-700 font-extrabold text-[11px] flex items-center gap-1">
                  <span>✓</span> Hoàn thành
                </span>
              )}
            </div>

            {/* Connecting progress track rail */}
            <div className="relative pt-1 pb-0.5">
              {/* Continuous horizontal connecting rail behind icons */}
              <div className="absolute top-[17px] left-3.5 right-3.5 h-1 -translate-y-1/2 bg-stone-200/90 rounded-full z-0" />

              <div className="grid grid-cols-7 gap-1 text-center relative z-10">
                {weekDays.map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full text-xs font-black transition-all ${
                        day.checkedIn
                          ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm ring-2 ring-white scale-105"
                          : day.isToday
                          ? "border-2 border-dashed border-orange-400 bg-orange-50 text-orange-600 ring-2 ring-orange-200 animate-pulse"
                          : "bg-white border border-stone-200 text-stone-400 shadow-2xs"
                      }`}
                    >
                      {day.checkedIn ? (
                        <Flame className="h-4 w-4 text-white fill-white drop-shadow-xs" />
                      ) : day.isToday ? (
                        <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500 opacity-70" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-stone-300" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-extrabold ${
                        day.isToday
                          ? "text-orange-600 underline decoration-2 underline-offset-2"
                          : day.checkedIn
                          ? "text-stone-700"
                          : "text-stone-400"
                      }`}
                    >
                      {day.dayLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Longest Streak Trophy Card */}
          <div className="flex items-center justify-between rounded-xl border border-amber-200/70 bg-gradient-to-r from-amber-50/80 to-orange-50/60 px-3.5 py-2.5 text-xs">
            <span className="text-stone-600 font-bold">Kỷ lục chuỗi dài nhất:</span>
            <span className="font-black text-amber-900 bg-white/90 border border-amber-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span>{longestStreak} ngày liên tiếp</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid gap-2 pt-0.5">
            <Link
              href="/restaurants"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-red)] to-red-700 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:from-red-700 hover:to-red-800 active:scale-[0.98] transition cursor-pointer"
            >
              <Utensils className="h-3.5 w-3.5" />
              <span>Khám phá quán ăn & Check-in</span>
            </Link>
            <Link
              href="/history"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-stone-50 hover:bg-[var(--color-pale)] px-4 py-2 text-xs font-bold text-[var(--color-ink)] transition cursor-pointer"
            >
              <span>Xem nhật ký ăn uống</span>
              <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
            </Link>
          </div>
        </div>
      )}

      {/* 4. Duolingo Celebration Overlay (Khi vừa check-in hoàn thành) */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl border-4 border-amber-300 bg-white p-6 sm:p-8 text-center shadow-2xl animate-scaleUp space-y-6">
            {/* Sparkles & Giant Fire Ignition */}
            <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 opacity-30 blur-xl animate-ping" />
              
              {/* Giant Flame */}
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-300 p-4 shadow-xl animate-bounce">
                <Flame className="h-18 w-18 text-white fill-white drop-shadow-md" />
              </div>
            </div>

            {/* Celebration text */}
            <div className="space-y-2">
              <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-orange-700">
                Thắp sáng chuỗi thành công!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)]">
                Chuỗi {currentStreak} Ngày!
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">
                Bạn đã duy trì ngọn lửa ăn uống đều đặn! Mỗi ngày check-in là một bước gắn kết cùng ẩm thực Hanu.
              </p>
            </div>

            {/* Duolingo Continue Button */}
            <button
              type="button"
              onClick={closeCelebration}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 text-base font-black uppercase tracking-wider text-white shadow-lg transition hover:from-orange-600 hover:to-amber-600 active:scale-95 cursor-pointer"
            >
              <span>Tiếp tục</span>
              <Flame className="h-5 w-5 text-white fill-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

