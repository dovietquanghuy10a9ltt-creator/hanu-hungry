"use client";

import { useState } from "react";
import Link from "next/link";
import { dishSuggestions, type CatalogRestaurant } from "@/features/restaurants/search";

export function QuickSearch({ catalog }: { catalog: CatalogRestaurant[] }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const suggestions = dishSuggestions(catalog, query);
  return (
    <div className="relative z-20 space-y-2.5" onFocus={() => setFocused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <form action="/restaurants" className="quick-search">
        <span aria-hidden="true" className="text-xl sm:text-2xl leading-none select-none ml-2">🔍</span>
        <label htmlFor="home-search" className="sr-only">Tìm quán hoặc món ăn</label>
        <input id="home-search" type="search" name="q" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" placeholder="Gõ tên món, cafe sống ảo, lẩu 20/10… 🌸" className="min-w-0 flex-1 bg-transparent py-3 outline-none" aria-describedby={focused && suggestions.length ? "home-suggestions-title" : undefined} />
        <button className="button button-primary bg-gradient-to-r from-rose-600 to-[#b52a34] hover:from-rose-700 hover:to-[#96232c]" type="submit" aria-label="Tìm quán">Tìm <span aria-hidden="true">↗</span></button>
      </form>

      {/* Quick 20/10 tags */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
          🌸 Gợi ý 20/10:
        </span>
        {[
          { label: "📸 Cafe chụp hoa", q: "cafe" },
          { label: "🧋 Trà sữa", q: "trà sữa" },
          { label: "🍰 Bánh ngọt", q: "bánh" },
          { label: "🥘 Lẩu nướng", q: "lẩu" },
        ].map((item) => (
          <Link
            key={item.label}
            href={`/restaurants?q=${encodeURIComponent(item.q)}`}
            className="rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-0.5 font-semibold transition hover:scale-105 active:scale-95 shadow-2xs"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {focused && suggestions.length > 0 && <div className="search-suggestions"><p id="home-suggestions-title" className="eyebrow px-4 pb-2 pt-4">Món phù hợp</p><ul>{suggestions.map((dish) => <li key={dish.id}><Link className="suggestion-link" href={`/restaurants/${dish.restaurantId}`}><span>{dish.name}<small>{dish.restaurantName}</small></span><span aria-hidden="true">↗</span></Link></li>)}</ul><Link href={`/restaurants?q=${encodeURIComponent(query)}`} className="suggestion-link border-t border-[var(--color-line)] text-[var(--color-red)]">Xem tất cả kết quả →</Link></div>}
    </div>
  );
}
