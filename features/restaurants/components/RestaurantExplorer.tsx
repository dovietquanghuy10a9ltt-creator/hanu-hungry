"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RestaurantCard } from "@/components/shared/restaurant-card";
import { dishSuggestions, filterCatalog, parseMaxPrice, type CatalogRestaurant } from "@/features/restaurants/search";
import { formatVnd } from "@/features/restaurants/format";

export function RestaurantExplorer({ catalog, categories, initialQuery, initialCategory, initialPrice }: { catalog: CatalogRestaurant[]; categories: { id: string; name: string; slug: string }[]; initialQuery: string; initialCategory: string; initialPrice: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [price, setPrice] = useState(initialPrice);
  const maxPrice = parseMaxPrice(price);
  const priceError = price !== "" && maxPrice === undefined;
  const restaurants = filterCatalog(catalog, query, category, maxPrice);
  const suggestions = dishSuggestions(restaurants, query, maxPrice);
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("category", category);
    if (maxPrice) params.set("maxPrice", String(maxPrice));
    const url = params.size ? `/restaurants?${params}` : "/restaurants";
    window.history.replaceState(null, "", url);
  }, [query, category, maxPrice]);
  const reset = () => { setQuery(""); setCategory(""); setPrice(""); };
  return <div className="space-y-7">
    <form action="/restaurants" onSubmit={(event) => event.preventDefault()} className="explore-filters">
      <label className="filter-label md:col-span-2">Tên quán hoặc món<span className="input-wrap"><span aria-hidden="true">⌕</span><input type="search" name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Thử gõ ‘b’ để tìm bún, bánh…" autoComplete="off" className="field" /></span></label>
      <label className="filter-label">Danh mục<select name="category" value={category} onChange={(event) => setCategory(event.target.value)} className="field mt-2"><option value="">Tất cả danh mục</option>{categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
      <label className="filter-label">Ngân sách tối đa<span className="input-wrap price-input"><input type="text" name="maxPrice" inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value.replace(/[^0-9]/g, "").slice(0, 8))} placeholder="Ví dụ: 70000" className="field" aria-invalid={priceError} aria-describedby="price-help" /><span>đ</span></span></label>
      <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-4"><div className="flex flex-wrap items-center gap-2"><span className="text-xs text-[var(--color-muted)]">Gợi ý ngân sách</span>{[30000,50000,70000].map((value) => <button type="button" key={value} onClick={() => setPrice(price === String(value) ? "" : String(value))} aria-pressed={maxPrice === value} className={`budget-chip ${maxPrice === value ? "is-active" : ""}`}>{formatVnd(value)}</button>)}</div><button type="button" onClick={reset} className="text-sm text-[var(--color-red)] underline underline-offset-4">Xóa bộ lọc</button></div>
      <p id="price-help" className={`text-xs md:col-span-4 ${priceError ? "text-red-700" : "text-[var(--color-muted)]"}`}>{priceError ? "Nhập giá từ 1 đến 10.000.000 đ." : maxPrice ? `Tìm món có giá từ ${formatVnd(maxPrice)} trở xuống. Kết quả cập nhật ngay khi bạn gõ.` : "Kết quả cập nhật ngay khi bạn gõ, không cần bấm tìm kiếm."}</p>
    </form>
    {suggestions.length > 0 && <section className="dish-match-section"><div className="flex items-baseline justify-between gap-3"><h2 className="text-xl">Món khớp từ khóa</h2><span className="text-xs text-[var(--color-muted)]">Ghé quán để xem thực đơn</span></div><div className="mt-3 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">{suggestions.map((dish) => <Link key={dish.id} href={`/restaurants/${dish.restaurantId}`} className="dish-match"><div><strong>{dish.name}</strong><small>{dish.restaurantName}</small></div><span aria-hidden="true">↗</span></Link>)}</div></section>}
    <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-3"><p aria-live="polite" role="status" className="text-sm"><strong className="text-[var(--color-red)]">{restaurants.length}</strong> quán phù hợp{query && <> với “{query}”</>}</p><span className="text-xs text-[var(--color-muted)]">Quanh Đại học Hà Nội</span></div>
    {restaurants.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{restaurants.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div> : <div className="empty-state"><span aria-hidden="true">⌕</span><h2>Chưa gặp đúng quán rồi</h2><p>Thử từ khóa khác hoặc nới ngân sách một chút nhé.</p><button className="button button-outline mt-5" onClick={reset}>Xóa bộ lọc</button></div>}
  </div>;
}
