"use client";

import { useEffect, useState, useTransition } from "react";
import { quickCheckIn } from "@/features/history/actions";

type PendingCheckIn = {
  restaurantId: string;
  restaurantName: string;
  timestamp: number;
};

const STORAGE_KEY = "hanu_pending_checkin";
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function SmartCheckInRecall() {
  const [pending, setPending] = useState<PendingCheckIn | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function inspectStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setPending(null);
          return;
        }
        const data: PendingCheckIn = JSON.parse(raw);
        if (!data?.restaurantId || !data?.restaurantName || !data?.timestamp) {
          localStorage.removeItem(STORAGE_KEY);
          setPending(null);
          return;
        }
        // Remove expired entries older than 24 hours
        if (Date.now() - data.timestamp > MAX_AGE_MS) {
          localStorage.removeItem(STORAGE_KEY);
          setPending(null);
          return;
        }
        setPending(data);
      } catch {
        // Ignore JSON/Storage errors
      }
    }

    inspectStorage();

    const handleStorageUpdate = () => inspectStorage();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        inspectStorage();
      }
    };

    window.addEventListener("focus", inspectStorage);
    window.addEventListener("storage", inspectStorage);
    window.addEventListener("hanu_pending_checkin_updated", handleStorageUpdate);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", inspectStorage);
      window.removeEventListener("storage", inspectStorage);
      window.removeEventListener("hanu_pending_checkin_updated", handleStorageUpdate);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setPending(null);
  };

  const handleConfirm = () => {
    if (!pending) return;
    startTransition(async () => {
      try {
        const res = await quickCheckIn(pending.restaurantId);
        if (res.success) {
          setSuccessMessage(res.message);
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {
            // Ignore
          }
          setTimeout(() => {
            setPending(null);
            setSuccessMessage(null);
          }, 2500);
        } else {
          alert(res.message);
        }
      } catch {
        alert("Có lỗi xảy ra khi lưu lịch sử. Vui lòng thử lại.");
      }
    });
  };

  if (!pending) return null;

  return (
    <div
      role="region"
      aria-label="Gợi ý xác nhận đã ăn"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border-2 border-[var(--color-red)]/20 bg-white p-4 shadow-2xl transition-all duration-300"
    >
      {successMessage ? (
        <div className="flex items-center gap-3 py-2 text-sm font-bold text-emerald-700">
          <span className="text-2xl">🎉</span>
          <p className="leading-snug">{successMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-pale)] px-2.5 py-1 text-xs font-black uppercase tracking-wider text-[var(--color-red)]">
              🍜 Gợi ý thông minh
            </span>
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-[var(--color-muted)] transition hover:bg-neutral-100 hover:text-[var(--color-ink)]"
              aria-label="Đóng gợi ý"
            >
              ✕
            </button>
          </div>

          <div>
            <h4 className="text-sm font-extrabold text-[var(--color-ink)] leading-snug">
              Bạn vừa ghé <span className="text-[var(--color-red)]">{pending.restaurantName}</span>?
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
              Xác nhận đã ăn để tích lũy chuỗi ngày ăn ngon và lưu vào Nhật ký! 🔥
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              disabled={isPending}
              onClick={handleConfirm}
              className="button button-primary flex-1 py-2 text-xs font-bold disabled:opacity-60"
            >
              {isPending ? "Đang lưu..." : "✓ Xác nhận đã ăn"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleDismiss}
              className="button button-secondary py-2 px-3 text-xs font-semibold"
            >
              Không phải
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

