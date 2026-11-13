"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-context";
import { createClient } from "@/lib/supabase/client";

type UserVisit = {
  id: string;
  visited_at: string;
  dish_id: string | null;
  dishes: { name: string } | null;
};

export function RestaurantUserVisits({ restaurantId }: { restaurantId: string }) {
  const { loading: authLoading, authenticated, user } = useAuth();
  const [visits, setVisits] = useState<UserVisit[] | null>(null);

  useEffect(() => {
    if (!authenticated || !user) return;
    const currentUserId = user.id;

    let active = true;
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("check_ins")
          .select("id, visited_at, dish_id, dishes(name)")
          .eq("restaurant_id", restaurantId)
          .eq("user_id", currentUserId)
          .order("visited_at", { ascending: false });

        if (active) {
          setVisits((data as unknown as UserVisit[]) ?? []);
        }
      } catch {
        if (active) setVisits([]);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [restaurantId, authenticated, user]);

  if (authLoading || (authenticated && visits === null)) {
    return (
      <div className="py-6 text-center text-xs text-[var(--color-muted)] animate-pulse">
        Đang nạp lịch sử ghé quán...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="space-y-3 text-center py-4">
        <span className="text-3xl">📖</span>
        <p className="text-sm text-[var(--color-muted)]">
          Đăng nhập để theo dõi và xem lại những lần bạn từng ghé ăn tại quán này.
        </p>
        <Link
          href={`/login?next=${encodeURIComponent(`/restaurants/${restaurantId}`)}`}
          className="button button-primary inline-flex text-xs px-4 py-2 font-bold"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const visitItems = visits ?? [];

  if (visitItems.length === 0) {
    return (
      <div className="space-y-3 text-center py-4">
        <span className="text-3xl">📍</span>
        <p className="text-sm font-semibold text-[var(--color-ink)]">
          Bạn chưa từng ghé quán này
        </p>
        <p className="text-xs text-[var(--color-muted)] leading-relaxed">
          Bấm nút <strong>“Chọn quán này”</strong> hoặc <strong>“Chỉ đường Google Maps”</strong> ở phía trên để lưu vào nhật ký ăn uống và duy trì chuỗi ăn liên tiếp!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-3">
        <span className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
          Tổng số lần đã ghé
        </span>
        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-black text-emerald-700">
          {visitItems.length} lần
        </span>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {visitItems.map((visit, index: number) => {
          const date = new Date(visit.visited_at);
          const formattedDate = new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(date);
          const formattedTime = new Intl.DateTimeFormat("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(date);

          return (
            <div
              key={visit.id || index}
              className="rounded-xl border border-[var(--color-line)] bg-[#fdfbf7] p-3 text-xs"
            >
              <div className="flex items-center justify-between font-bold text-[var(--color-ink)]">
                <span className="flex items-center gap-1.5">
                  <span>🗓️</span> {formattedDate}
                </span>
                <span className="text-[11px] text-[var(--color-muted)] font-mono">
                  ⏰ {formattedTime}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-[var(--color-muted)] text-center pt-1 border-t border-[var(--color-line)]">
        Lần ghé được ghi nhận khi bạn xác nhận ăn ở quán hoặc mở Google Maps chỉ đường.
      </p>
    </div>
  );
}
