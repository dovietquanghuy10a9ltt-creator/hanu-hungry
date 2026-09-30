import Image from "next/image";
import Link from "next/link";
import { formatVnd, readableText } from "@/features/restaurants/format";
import type { RestaurantSummary } from "@/features/restaurants/types";

export function RestaurantCard({ restaurant }: { restaurant: RestaurantSummary }) {
  return (
    <Link href={`/restaurants/${restaurant.id}`} className="card group block min-w-0 overflow-hidden transition-transform hover:-translate-y-1">
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-[var(--color-pale)]">
        {restaurant.image_url ? (
          <Image src={restaurant.image_url} alt={restaurant.name} fill className="object-cover transition-transform group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" unoptimized />
        ) : (
          <span aria-hidden="true" className="text-6xl opacity-60">🍜</span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex flex-wrap gap-1.5">
          {(restaurant.categories?.length ? restaurant.categories : ["Chưa phân loại"]).slice(0, 2).map((category) => (
            <span key={category} className="rounded-full bg-[var(--color-pale)] px-2.5 py-1 text-xs font-semibold text-[var(--color-red)]">{category}</span>
          ))}
        </div>
        <h3 className="break-words text-lg font-extrabold leading-snug group-hover:text-[var(--color-red)]">{restaurant.name}</h3>
        <p className="line-clamp-2 text-sm text-[var(--color-muted)]">{readableText(restaurant.area || restaurant.address_text, "Chưa có dữ liệu vị trí")}</p>
        <p className="text-sm font-bold text-[var(--color-red)]">{restaurant.min_price_vnd === null ? "Chưa có dữ liệu giá" : `Từ ${formatVnd(restaurant.min_price_vnd)}`}</p>
      </div>
    </Link>
  );
}
