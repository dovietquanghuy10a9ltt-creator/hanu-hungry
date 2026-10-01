import Image from "next/image";
import Link from "next/link";
import { formatVnd, readableText } from "@/features/restaurants/format";
import type { RestaurantSummary } from "@/features/restaurants/types";

export function RestaurantCard({ restaurant }: { restaurant: RestaurantSummary }) {
  return <Link href={`/restaurants/${restaurant.id}`} className={`restaurant-card group ${restaurant.image_url ? "has-photo" : ""}`}>
    {restaurant.image_url && <div className="relative aspect-[16/10] overflow-hidden"><Image src={restaurant.image_url} alt={`Không gian ${restaurant.name}`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" unoptimized /></div>}
    <div className="flex h-full flex-col gap-3 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3"><p className="restaurant-category">{restaurant.categories?.slice(0, 2).join(" · ") || "Quán quanh trường"}</p><span className="card-arrow" aria-hidden="true">↗</span></div>
      <h3 className="restaurant-name">{restaurant.name}</h3>
      <p className="text-sm leading-relaxed text-[var(--color-muted)]">{readableText(restaurant.area || restaurant.address_text, "Địa chỉ đang cập nhật")}</p>
      <div className="mt-auto border-t border-[var(--color-line)] pt-4"><p className="text-sm text-[var(--color-red)]">{restaurant.min_price_vnd === null ? "Giá đang cập nhật" : <>Từ <strong className="text-lg">{formatVnd(restaurant.min_price_vnd)}</strong></>}</p></div>
    </div>
  </Link>;
}
