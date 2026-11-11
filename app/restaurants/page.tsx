import { Suspense } from "react";
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
      <header className="page-intro">
        <div>
          <p className="eyebrow">Sổ địa điểm · Hanu</p>
          <h1 className="section-title mt-3">Một vòng quanh trường.</h1>
          <p className="mt-3 max-w-xl text-[var(--color-muted)]">
            Từ món quen đến quán mới. Gõ một từ, chọn danh mục — tìm chỗ hợp gu của bạn.
          </p>
        </div>
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
