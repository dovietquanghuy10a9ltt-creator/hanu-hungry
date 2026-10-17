import Image from "next/image";
import Link from "next/link";
import { formatVnd, readableText } from "@/features/restaurants/format";
import type { RestaurantSummary } from "@/features/restaurants/types";

export function RestaurantCard({ restaurant }: { restaurant: RestaurantSummary }) {
  const isWomensDayPick =
    restaurant.categories?.some((c) => /cà phê|cafe|đồ uống|trà sữa|bánh|lẩu|nướng/i.test(c)) ||
    /cafe|tea|coffee|bánh|trà sữa|lẩu/i.test(restaurant.name);

  return <Link href={`/restaurants/${restaurant.id}`} className={`restaurant-card group ${restaurant.image_url ? "has-photo" : ""}`}>
    {restaurant.image_url && (
      <div className="relative aspect-[16/10] overflow-hidden">
        {isWomensDayPick && (
          <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-white shadow-xs">
            🌸 Điểm hẹn 20/10
          </span>
        )}
        <Image src={restaurant.image_url} alt={`Không gian ${restaurant.name}`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" unoptimized />
      </div>
    )}
    <div className="flex h-full flex-col gap-3 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3"><p className="restaurant-category">{restaurant.categories?.slice(0, 2).join(" · ") || "Quán quanh trường"}</p><span className="card-arrow" aria-hidden="true">↗</span></div>
      <h3 className="restaurant-name">{restaurant.name}</h3>
      <p className="text-sm leading-relaxed text-[var(--color-muted)]">{readableText(restaurant.area || restaurant.address_text, "Địa chỉ đang cập nhật")}</p>
      <div className="mt-auto border-t border-[var(--color-line)] pt-4"><p className="text-sm text-[var(--color-red)]">{restaurant.min_price_vnd === null ? "Chưa có giá chính thức" : <strong className="text-base sm:text-lg">{restaurant.max_price_vnd && restaurant.max_price_vnd > restaurant.min_price_vnd ? `${formatVnd(restaurant.min_price_vnd)} - ${formatVnd(restaurant.max_price_vnd)}` : formatVnd(restaurant.min_price_vnd)}</strong>}</p></div>
    </div>
  </Link>;
}
