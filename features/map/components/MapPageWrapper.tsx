"use client";

import dynamic from "next/dynamic";
import type { CatalogRestaurant } from "@/features/restaurants/catalog";

const MapPageClient = dynamic(
  () =>
    import("./MapPageClient").then((mod) => mod.MapPageClient),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-[#faf7ef] text-stone-500">
        <div className="h-10 w-10 border-4 border-[var(--color-red)] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="font-heading font-black text-sm text-[var(--color-ink)]">
          Đang nạp bản đồ ẩm thực HANU...
        </p>
      </div>
    ),
  }
);

export function MapPageWrapper({
  initialCatalog,
}: {
  initialCatalog: CatalogRestaurant[];
}) {
  return <MapPageClient initialCatalog={initialCatalog} />;
}
