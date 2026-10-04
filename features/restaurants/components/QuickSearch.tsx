"use client";

import { useState } from "react";
import Link from "next/link";
import { dishSuggestions, type CatalogRestaurant } from "@/features/restaurants/search";

export function QuickSearch({ catalog }: { catalog: CatalogRestaurant[] }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const suggestions = dishSuggestions(catalog, query);
  return <div className="relative z-20" onFocus={() => setFocused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <form action="/restaurants" className="quick-search">
      <span aria-hidden="true" className="search-symbol">⌕</span>
      <label htmlFor="home-search" className="sr-only">Tìm quán hoặc món ăn</label>
      <input id="home-search" type="search" name="q" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" placeholder="Gõ tên món bạn đang thèm…" className="min-w-0 flex-1 bg-transparent py-3 outline-none" aria-describedby={focused && suggestions.length ? "home-suggestions-title" : undefined} />
      <button className="button button-primary" type="submit" aria-label="Tìm quán">Tìm <span aria-hidden="true">↗</span></button>
    </form>
    {focused && suggestions.length > 0 && <div className="search-suggestions"><p id="home-suggestions-title" className="eyebrow px-4 pb-2 pt-4">Món phù hợp</p><ul>{suggestions.map((dish) => <li key={dish.id}><Link className="suggestion-link" href={`/restaurants/${dish.restaurantId}`}><span>{dish.name}<small>{dish.restaurantName}</small></span><span aria-hidden="true">↗</span></Link></li>)}</ul><Link href={`/restaurants?q=${encodeURIComponent(query)}`} className="suggestion-link border-t border-[var(--color-line)] text-[var(--color-red)]">Xem tất cả kết quả →</Link></div>}
  </div>;
}
