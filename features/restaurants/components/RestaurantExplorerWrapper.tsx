"use client";

import { useSearchParams } from "next/navigation";
import { RestaurantExplorer } from "./RestaurantExplorer";
import type { CatalogRestaurant } from "@/features/restaurants/search";

export function RestaurantExplorerWrapper({
  catalog,
  categories,
}: {
  catalog: CatalogRestaurant[];
  categories: { id: string; name: string; slug: string }[];
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "";

  return (
    <RestaurantExplorer
      key={`${query}:${category}:${sort}`}
      catalog={catalog}
      categories={categories}
      initialQuery={query}
      initialCategory={category}
      initialSort={sort}
    />
  );
}
