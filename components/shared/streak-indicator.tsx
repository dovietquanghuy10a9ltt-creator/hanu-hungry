"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Flame, Calendar, Trophy } from "lucide-react";

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

      {/* 2. Duolingo-style Streak Popover */}
      {isOpen && (
        <div className="fixed inset-x-3 top-16 mx-auto max-w-sm sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-88 sm:max-w-none sm:mx-0 rounded-3xl border border-[var(--color-line)] bg-white p-5 shadow-2xl z-50 animate-fadeIn space-y-4">
          {/* Header Flame & Streak Count */}
          <div className="flex flex-col items-center text-center space-y-1.5">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full p-2.5 shadow-inner ${
                isTodayCheckedIn
                  ? "bg-gradient-to-b from-amber-100 to-orange-100 border-2 border-orange-300"
                  : "bg-gray-100 border-2 border-gray-200"
              }`}
            >
              <Flame
                className={`h-10 w-10 ${
                  isTodayCheckedIn
                    ? "text-orange-500 fill-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)] animate-bounce"
                    : "text-gray-400 opacity-50"
                }`}
              />
            </div>

            <h3 className="text-xl font-black text-[var(--color-ink)]">
              {currentStreak > 0 ? `Chuỗi ${currentStreak} ngày!` : "Chưa có chuỗi ngày"}
            </h3>

            <p className="text-xs text-[var(--color-muted)] leading-relaxed max-w-[260px]">
              {isTodayCheckedIn
                ? "Ngọn lửa của bạn đang bùng cháy rực rỡ hôm nay! Nhớ tiếp tục check-in vào ngày mai."
                : currentStreak > 0
                ? "Đốm lửa đang ngủ say! Hãy ăn một bữa và check-in hôm nay để giữ chuỗi không bị tắt."
                : "Hãy check-in quán ăn đầu tiên hôm nay để bắt đầu chuỗi ngọn lửa của bạn!"}
            </p>
          </div>

          {/* 3. Duolingo Weekly 7-Day Calendar Tracker */}
          <div className="rounded-2xl border border-[var(--color-line)] bg-[#fcfaf7] p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--color-muted)] px-1 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-stone-500" />
                <span>Tuần này</span>
              </span>
              {isTodayCheckedIn && (
                <span className="text-emerald-600 flex items-center gap-1 font-extrabold">
                  <span>✓</span> Đã hoàn thành
                </span>
              )}
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center">
              {weekDays.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs font-black transition-all ${
                      day.checkedIn
                        ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xs"
                        : day.isToday
                        ? "border-2 border-dashed border-orange-400 bg-orange-50 text-orange-600 animate-pulse"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {day.checkedIn ? (
                      <Flame className="h-4 w-4 text-white fill-white" />
                    ) : day.isToday ? (
                      <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500 opacity-60" />
                    ) : (
                      <span className="text-[10px]">•</span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      day.isToday
                        ? "text-orange-600 font-extrabold"
                        : "text-[var(--color-muted)]"
                    }`}
                  >
                    {day.dayLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Best Record & Actions */}
          <div className="flex items-center justify-between text-xs border-t border-[var(--color-line)] pt-3 px-1">
            <span className="text-[var(--color-muted)]">Kỷ lục chuỗi dài nhất:</span>
            <span className="font-extrabold text-[var(--color-red)] flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5 text-amber-500 inline" /> {longestStreak} ngày
            </span>
          </div>

          <div className="grid gap-2 pt-1">
            <Link
              href="/restaurants"
              onClick={() => setIsOpen(false)}
              className="button button-primary w-full text-center py-2.5 text-xs font-bold rounded-xl"
            >
              Khám phá quán ăn & Check-in
            </Link>
            <Link
              href="/history"
              onClick={() => setIsOpen(false)}
              className="button button-secondary w-full text-center py-2 text-xs font-semibold rounded-xl"
            >
              Xem nhật ký ăn uống
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

