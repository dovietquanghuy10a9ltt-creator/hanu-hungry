"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { RestaurantCard } from "@/components/shared/restaurant-card";
import { dishSuggestions, filterCatalog, type CatalogRestaurant } from "@/features/restaurants/search";

export function RestaurantExplorer({
  catalog,
  categories,
  initialQuery,
  initialCategory,
  initialSort = "",
}: {
  catalog: CatalogRestaurant[];
  categories: { id: string; name: string; slug: string }[];
  initialQuery: string;
  initialCategory: string;
  initialPrice?: string;
  initialSort?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);
  const restaurants = filterCatalog(catalog, query, category, undefined, sortBy);
  const suggestions = dishSuggestions(restaurants, query);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("category", category);
    if (sortBy) params.set("sort", sortBy);
    const url = params.size ? `/restaurants?${params}` : "/restaurants";
    window.history.replaceState(null, "", url);
  }, [query, category, sortBy]);

  const reset = () => {
    setQuery("");
    setCategory("");
    setSortBy("");
  };

  const hasFilter = Boolean(query || category || sortBy);

  return (
    <div className="space-y-7">
      <form
        action="/restaurants"
        onSubmit={(event) => event.preventDefault()}
        className="rounded-2xl border border-[var(--color-line)] bg-[#f1eadd] p-4 sm:p-5 space-y-3.5 shadow-xs"
      >
        {/* Header với label và nút Xóa bộ lọc ở góc phải */}
        <div className="flex items-center justify-between">
          <label htmlFor="search-restaurant-q" className="text-xs sm:text-sm font-bold text-[var(--color-ink)]">
            Tên quán hoặc món
          </label>
          {hasFilter && (
            <button
              type="button"
              onClick={reset}
              className="text-xs font-bold text-[var(--color-red)] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>✕</span> Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Dòng 1: Thanh tìm kiếm */}
        <div className="relative">
          <span
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 select-none flex items-center justify-center leading-none"
            aria-hidden="true"
          >
            <Search className="w-5 h-5 text-stone-400" />
          </span>
          <input
            id="search-restaurant-q"
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Thử gõ ‘b’ để tìm bún, bánh…"
            autoComplete="off"
            style={{ paddingLeft: "42px" }}
            className="field w-full text-sm !pl-11"
          />
        </div>

        {/* Dòng 2: 2 dropdown chọn Danh mục và Quán ăn nhiều nhất */}
        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          <div>
            <label htmlFor="search-restaurant-category" className="block text-xs font-bold text-[var(--color-ink)] mb-1">
              Danh mục
            </label>
            <div className="relative">
              <select
                id="search-restaurant-category"
                name="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                  paddingRight: "26px",
                  paddingLeft: "10px",
                }}
                className="field w-full text-xs sm:text-sm py-2 cursor-pointer bg-white"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-muted)] select-none" aria-hidden="true">
                ▼
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="search-restaurant-sort" className="block text-xs font-bold text-[var(--color-ink)] mb-1">
              Xếp theo quán
            </label>
            <div className="relative">
              <select
                id="search-restaurant-sort"
                name="sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                  paddingRight: "26px",
                  paddingLeft: "10px",
                }}
                className="field w-full text-xs sm:text-sm py-2 cursor-pointer bg-white"
              >
                <option value="">Tất cả quán</option>
                <option value="most_eaten">🔥 Ăn nhiều nhất</option>
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-muted)] select-none" aria-hidden="true">
                ▼
              </span>
            </div>
          </div>
        </div>
      </form>

      {suggestions.length > 0 && (
        <section className="dish-match-section">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl">Món khớp từ khóa</h2>
            <span className="text-xs text-[var(--color-muted)]">Ghé quán để xem thực đơn</span>
          </div>
          <div className="mt-3 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((dish) => (
              <Link key={dish.id} href={`/restaurants/${dish.restaurantId}`} className="dish-match">
                <div>
                  <strong>{dish.name}</strong>
                  <small>{dish.restaurantName}</small>
                </div>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-3">
        <p aria-live="polite" role="status" className="text-sm">
          <strong className="text-[var(--color-red)]">{restaurants.length}</strong> quán phù hợp{query && <> với “{query}”</>}
          {sortBy === "most_eaten" && <span className="ml-1 text-xs text-[var(--color-muted)]">(sắp xếp theo lượt ăn trên hệ thống)</span>}
        </p>
        <span className="text-xs text-[var(--color-muted)]">Quanh Đại học Hà Nội</span>
      </div>

      {restaurants.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true" className="text-4xl">🔍</span>
          <h2>Chưa gặp đúng quán rồi</h2>
          <p>Thử từ khóa khác hoặc chuyển danh mục nhé.</p>
          <button className="button button-outline mt-5 cursor-pointer" onClick={reset}>
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
