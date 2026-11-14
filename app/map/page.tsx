import type { Metadata } from "next";
import { listCatalog } from "@/features/restaurants/catalog";
import { MapPageWrapper } from "@/features/map/components/MapPageWrapper";

export const metadata: Metadata = {
  title: "Bản đồ ẩm thực HANU",
  description:
    "Bản đồ tương tác 50+ quán ăn ngon quanh Đại học Hà Nội (HANU). Xem vị trí các quán theo ngõ A4, ngõ 1, cổng trường và khoảng cách đi bộ.",
  alternates: {
    canonical: "https://hanuhungry.id.vn/map",
  },
  openGraph: {
    title: "Bản đồ ẩm thực HANU | Hanu Hungry",
    description:
      "Bản đồ tương tác 50+ quán ăn ngon quanh Đại học Hà Nội (HANU). Xem vị trí các quán theo ngõ A4, ngõ 1, cổng trường và khoảng cách đi bộ.",
    url: "https://hanuhungry.id.vn/map",
  },
};

export const revalidate = 3600;

export default async function MapPage() {
  const catalog = await listCatalog();
  return <MapPageWrapper initialCatalog={catalog} />;
}
