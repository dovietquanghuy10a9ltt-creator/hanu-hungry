import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { listCategories } from "@/features/restaurants/data";
import { listCatalog } from "@/features/restaurants/catalog";
import { RestaurantExplorerWrapper } from "@/features/restaurants/components/RestaurantExplorerWrapper";

export const metadata: Metadata = {
  title: "Danh sách Quán ăn quanh HANU",
  description:
    "Tìm kiếm và lọc hơn 50+ quán ăn ngon, bún, phở, cơm tấm, đồ ăn vặt, trà sữa quanh khu vực Đại học Hà Nội (Triều Khúc, Phùng Khoang) theo danh mục và khoảng giá.",
  alternates: {
    canonical: "https://hanuhungry.id.vn/restaurants",
  },
  openGraph: {
    title: "Danh sách Quán ăn quanh HANU | Hanu Hungry",
    description:
      "Tìm kiếm và lọc hơn 50+ quán ăn ngon, bún, phở, cơm tấm, đồ ăn vặt, trà sữa quanh khu vực Đại học Hà Nội.",
    url: "https://hanuhungry.id.vn/restaurants",
  },
};

export const revalidate = 3600;

export default async function RestaurantsPage() {
  const [catalog, categories] = await Promise.all([listCatalog(), listCategories()]);
  return (
    <div className="space-y-8">
      <header className="page-intro flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Sổ địa điểm · Hanu</p>
          <h1 className="section-title mt-3">Một vòng quanh trường.</h1>
          <p className="mt-3 max-w-xl text-[var(--color-muted)]">
            Từ món quen đến quán mới. Gõ một từ, chọn danh mục — tìm chỗ hợp gu của bạn.
          </p>
        </div>
        <Link
          href="/map"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--color-red)] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#831e1c] transition active:translate-y-0.5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <span>🗺️ Xem trên bản đồ</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </header>
      <Suspense
        fallback={
          <div className="py-12 text-center text-[var(--color-muted)] font-medium">
            Đang tải danh sách quán...
          </div>
        }
      >
        <RestaurantExplorerWrapper
          catalog={catalog}
          categories={categories}
        />
      </Suspense>
    </div>
  );
}
