import type { Metadata } from "next";
import { RestaurantCard } from "@/components/shared/restaurant-card";
import { listCategories, listRestaurants } from "@/features/restaurants/data";

export const metadata: Metadata = { title: "Khám phá quán ăn" };

type Search = { q?: string; category?: string; maxPrice?: string };

export default async function RestaurantsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const category = typeof params.category === "string" ? params.category.trim().slice(0, 100) : "";
  const rawPrice = Number(params.maxPrice);
  const maxPrice = params.maxPrice && Number.isSafeInteger(rawPrice) && rawPrice > 0 && rawPrice <= 10000000 ? rawPrice : undefined;
  const [restaurants, categories] = await Promise.all([
    listRestaurants({ query, category, maxPrice, limit: 100 }),
    listCategories(),
  ]);

  return (
    <div className="space-y-7">
      <div><p className="eyebrow">Tìm món hợp gu</p><h1 className="section-title mt-2">Khám phá quán ăn</h1><p className="mt-2 text-sm text-[var(--color-muted)]">Tìm theo tên quán, tên món, danh mục và mức giá từ dữ liệu khảo sát.</p></div>
      <form action="/restaurants" className="card grid gap-3 p-4 md:grid-cols-[minmax(0,2fr)_minmax(150px,1fr)_minmax(145px,1fr)_auto] md:items-end">
        <label className="block min-w-0 text-sm font-bold">Từ khóa<input type="search" name="q" defaultValue={query} placeholder="Ví dụ: bún, cà phê..." className="field mt-1.5" /></label>
        <label className="block min-w-0 text-sm font-bold">Danh mục<select name="category" defaultValue={category} className="field mt-1.5"><option value="">Tất cả</option>{categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
        <label className="block min-w-0 text-sm font-bold">Giá tối đa<input type="number" name="maxPrice" min="1" max="10000000" step="1000" defaultValue={maxPrice} placeholder="Ví dụ: 50000" inputMode="numeric" className="field mt-1.5" /></label>
        <button type="submit" className="button button-primary w-full md:w-auto">Áp dụng</button>
      </form>
      <p className="text-sm font-semibold text-[var(--color-muted)]">{restaurants.length} quán phù hợp</p>
      {restaurants.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{restaurants.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div> : <div className="card px-6 py-12 text-center"><p className="text-lg font-bold">Chưa tìm thấy quán phù hợp</p><p className="mt-2 text-sm text-[var(--color-muted)]">Thử từ khóa khác hoặc bỏ bớt bộ lọc.</p></div>}
    </div>
  );
}
