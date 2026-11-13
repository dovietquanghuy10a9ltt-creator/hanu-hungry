import { Suspense } from "react";
import type { Metadata } from "next";
import { listCatalog } from "@/features/restaurants/catalog";
import { isDrinkDish } from "@/features/gacha/random";
import { GachaPageWrapper } from "@/features/gacha/components/GachaPageWrapper";

export const metadata: Metadata = {
  title: "Vòng quay Gacha Chọn món",
  description:
    "Chưa biết trưa nay ăn gì hay uống gì? Quay Gacha ngẫu nhiên theo quán, đồ ăn hoặc trà sữa để tìm ngay một điểm hẹn hợp gu quanh HANU chỉ trong 3 giây!",
  alternates: {
    canonical: "https://hanuhungry.id.vn/gacha",
  },
  openGraph: {
    title: "Vòng quay Gacha Chọn món | Hanu Hungry",
    description:
      "Không biết ăn gì? Hãy để vòng quay Gacha vũ trụ Hanu Hungry chọn giúp bạn một bữa ăn ưng ý quanh trường!",
    url: "https://hanuhungry.id.vn/gacha",
  },
};

export const revalidate = 3600;

export default async function GachaPage() {
  const catalog = await listCatalog();
  const restaurantNames = catalog.map((item) => item.name);
  const foodNames = catalog.flatMap((item) =>
    item.dishes.filter((dish) => !isDrinkDish(dish.name, item.category_slugs)).map((dish) => dish.name)
  );
  const drinkNames = catalog.flatMap((item) =>
    item.dishes.filter((dish) => isDrinkDish(dish.name, item.category_slugs)).map((dish) => dish.name)
  );

  return (
    <div className="gacha-page">
      <header className="gacha-intro">
        <p className="cosmic-heading">Tín hiệu từ vũ trụ</p>
        <h1>Hôm nay ăn gì?</h1>
        <p>Chiếc bụng đói cần một gợi ý. Vũ trụ thì có cả một danh sách.</p>
      </header>
      <Suspense
        fallback={
          <div className="py-12 text-center text-[var(--color-muted)] font-medium">
            Đang tải vòng quay...
          </div>
        }
      >
        <GachaPageWrapper
          catalog={catalog}
          restaurantNames={restaurantNames}
          foodNames={foodNames}
          drinkNames={drinkNames}
        />
      </Suspense>
    </div>
  );
}
