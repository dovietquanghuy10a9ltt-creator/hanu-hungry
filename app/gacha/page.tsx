import type { Metadata } from "next";
import { listCatalog } from "@/features/restaurants/catalog";
import { GachaExperience } from "@/features/gacha/components/GachaExperience";

export const metadata: Metadata = { title: "Gacha - Tín hiệu từ vũ trụ" };
export default async function GachaPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const [params, catalog] = await Promise.all([searchParams, listCatalog()]);
  return <div className="gacha-page"><header className="gacha-intro"><p className="cosmic-heading">Tín hiệu từ vũ trụ</p><h1>Hôm nay ăn gì?</h1><p>Chiếc bụng đói cần một gợi ý. Vũ trụ thì có cả một danh sách.</p></header><GachaExperience restaurantNames={catalog.map((item) => item.name)} dishNames={catalog.flatMap((item) => item.dishes.map((dish) => dish.name))} initialMode={params.mode === "dish" ? "dish" : "restaurant"} /></div>;
}
