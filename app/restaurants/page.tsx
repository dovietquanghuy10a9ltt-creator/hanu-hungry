import type { Metadata } from "next";
import { listCategories } from "@/features/restaurants/data";
import { listCatalog } from "@/features/restaurants/catalog";
import { parseMaxPrice } from "@/features/restaurants/search";
import { RestaurantExplorer } from "@/features/restaurants/components/RestaurantExplorer";

export const metadata: Metadata = { title: "Khám phá quán ăn" };
type Search = { q?: string; category?: string; maxPrice?: string };

export default async function RestaurantsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const category = typeof params.category === "string" ? params.category.slice(0, 100) : "";
  const maxPrice = parseMaxPrice(params.maxPrice);
  const [catalog, categories] = await Promise.all([listCatalog(), listCategories()]);
  return <div className="space-y-8"><header className="page-intro"><div><p className="eyebrow">Sổ địa điểm · HANU</p><h1 className="section-title mt-3">Một vòng quanh trường.</h1><p className="mt-3 max-w-xl text-[var(--color-muted)]">Từ món quen đến quán mới. Gõ một từ, chọn một mức giá — tìm chỗ hợp gu của bạn.</p></div><span className="intro-number" aria-hidden="true">01</span></header><RestaurantExplorer key={`${query}:${category}:${maxPrice}`} catalog={catalog} categories={categories} initialQuery={query} initialCategory={category} initialPrice={maxPrice ? String(maxPrice) : ""} /></div>;
}
