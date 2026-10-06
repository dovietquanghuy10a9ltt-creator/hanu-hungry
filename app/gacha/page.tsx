import type { Metadata } from "next";
import { listCatalog } from "@/features/restaurants/catalog";
import { isDrinkDish } from "@/features/gacha/actions";
import { GachaExperience, type GachaMode } from "@/features/gacha/components/GachaExperience";

export const metadata: Metadata = { title: "Gacha - Tín hiệu từ vũ trụ" };
export default async function GachaPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const [params, catalog] = await Promise.all([searchParams, listCatalog()]);
  const initialMode: GachaMode = (params.mode === "food" || params.mode === "dish") ? "food" : params.mode === "drink" ? "drink" : "restaurant";
  const restaurantNames = catalog.map((item) => item.name);
  const foodNames = catalog.flatMap((item) =>
    item.dishes.filter((dish) => !isDrinkDish(dish.name, item.category_slugs)).map((dish) => dish.name)
  );
  const drinkNames = catalog.flatMap((item) =>
    item.dishes.filter((dish) => isDrinkDish(dish.name, item.category_slugs)).map((dish) => dish.name)
  );

  return <div className="gacha-page"><header className="gacha-intro"><p className="cosmic-heading">Tín hiệu từ vũ trụ</p><h1>Hôm nay ăn gì?</h1><p>Chiếc bụng đói cần một gợi ý. Vũ trụ thì có cả một danh sách.</p></header><GachaExperience restaurantNames={restaurantNames} foodNames={foodNames} drinkNames={drinkNames} initialMode={initialMode} /></div>;
}
