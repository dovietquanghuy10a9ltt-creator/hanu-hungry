import Link from "next/link";
import type { Metadata } from "next";
import { RestaurantCard } from "@/components/shared/restaurant-card";
import { pickRandom } from "@/features/gacha/random";
import { listRestaurants } from "@/features/restaurants/data";
import { formatPrice } from "@/features/restaurants/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Gacha - Ăn gì hôm nay?" };

type DishChoice = {
  id: string;
  name: string;
  price_text: string | null;
  price_min_vnd: number | null;
  price_max_vnd: number | null;
  restaurants: { id: string; name: string; area: string | null; is_active: boolean } | null;
};

export default async function GachaPage({ searchParams }: { searchParams: Promise<{ mode?: string; roll?: string }> }) {
  const params = await searchParams;
  const mode = params.mode === "dish" ? "dish" : "restaurant";
  const supabase = await createClient();
  const restaurantChoice = mode === "restaurant" ? pickRandom(await listRestaurants({ limit: 100 })) : null;
  let dishChoice: DishChoice | null = null;
  if (mode === "dish") {
    const { data, error } = await supabase.from("dishes").select("id,name,price_text,price_min_vnd,price_max_vnd,restaurants(id,name,area,is_active)").eq("is_active", true).limit(2000);
    if (error) throw new Error("Không thể chọn món lúc này. Vui lòng thử lại.");
    const eligible = ((data ?? []) as unknown as DishChoice[]).filter((dish) => dish.restaurants?.is_active);
    dishChoice = pickRandom(eligible);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <div className="text-center"><p className="eyebrow">Để vị giác quyết định</p><h1 className="section-title mt-2">Hôm nay ăn gì?</h1><p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">Một lựa chọn ngẫu nhiên từ quán và món ăn trong dữ liệu khảo sát.</p></div>
      <div className="flex justify-center gap-2"><Link href="/gacha?mode=restaurant" className={`button ${mode === "restaurant" ? "button-primary" : "button-secondary"}`}>Chọn quán</Link><Link href="/gacha?mode=dish" className={`button ${mode === "dish" ? "button-primary" : "button-secondary"}`}>Chọn món</Link></div>
      <div className="mx-auto max-w-xl">
        {restaurantChoice ? <RestaurantCard restaurant={restaurantChoice} /> : dishChoice ? (
          <div className="card overflow-hidden"><div className="brand-gradient flex min-h-52 items-center justify-center text-8xl" aria-hidden="true">🍴</div><div className="space-y-3 p-6"><p className="eyebrow">Món được chọn</p><h2 className="break-words text-2xl font-black">{dishChoice.name}</h2><p className="text-sm text-[var(--color-muted)]">Tại {dishChoice.restaurants?.name}</p><p className="font-bold text-[var(--color-red)]">{formatPrice(dishChoice.price_text, dishChoice.price_min_vnd, dishChoice.price_max_vnd)}</p><Link href={`/restaurants/${dishChoice.restaurants?.id}`} className="button button-primary">Xem quán</Link></div></div>
        ) : <div className="card p-10 text-center text-sm text-[var(--color-muted)]">Chưa có dữ liệu phù hợp để chọn. Hãy thử chế độ khác.</div>}
      </div>
      <form action="/gacha" method="GET" className="text-center"><input type="hidden" name="mode" value={mode} /><button type="submit" className="button button-primary min-w-44">🎲 Chọn lại</button></form>
    </div>
  );
}
