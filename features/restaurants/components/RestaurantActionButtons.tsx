"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CheckCircle, Flame, Loader2 } from "lucide-react";
import { quickCheckIn } from "@/features/history/actions";

type Props = {
  mapLink?: string | null;
  restaurantId: string;
  restaurantName: string;
  isLoggedIn?: boolean;
  initialCheckedInToday?: boolean;
};

export function RestaurantActionButtons({
  mapLink,
  restaurantId,
  isLoggedIn = false,
  initialCheckedInToday = false,
}: Props) {
  const router = useRouter();
  const [isCheckedIn, setIsCheckedIn] = useState(initialCheckedInToday);
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCheckIn = () => {
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(`/restaurants/${restaurantId}`)}`);
      return;
    }

    startTransition(async () => {
      try {
        const res = await quickCheckIn(restaurantId);
        if (res.success) {
          setIsCheckedIn(true);
          setToastMessage(res.message);
          router.refresh();
          setTimeout(() => setToastMessage(null), 4000);
        } else {
          alert(res.message);
        }
      } catch {
        alert("Có lỗi xảy ra khi xác nhận ăn. Vui lòng thử lại!");
      }
    });
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-wrap items-center gap-3">
        {/* Nút 1: Mở Google Maps */}
        {mapLink ? (
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-secondary flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold"
          >
            <MapPin className="h-4 w-4 shrink-0 text-[var(--color-red)]" />
            <span>Chỉ đường Google Maps ↗</span>
          </a>
        ) : (
          <span className="rounded-xl bg-[var(--color-pale)] px-4 py-2 text-xs text-[var(--color-muted)]">
            Chưa có vị trí Maps
          </span>
        )}

        {/* Nút 2: Chọn ăn quán đó & Cộng chuỗi luôn */}
        <button
          type="button"
          onClick={handleCheckIn}
          disabled={isPending || isCheckedIn}
          className={`button flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold transition-all cursor-pointer ${
            isCheckedIn
              ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-default"
              : "button-primary"
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : isCheckedIn ? (
            <>
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Đã chọn hôm nay ✓</span>
            </>
          ) : (
            <>
              <Flame className="h-4 w-4 shrink-0 fill-amber-300 text-amber-300 animate-pulse" />
              <span>Chọn quán này</span>
            </>
          )}
        </button>
      </div>

      {/* Thông báo tức thì khi cộng chuỗi thành công */}
      {toastMessage && (
        <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs sm:text-sm font-bold text-emerald-800 animate-fadeIn">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
