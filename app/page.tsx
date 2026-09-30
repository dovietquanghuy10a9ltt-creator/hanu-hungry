import Link from "next/link";
import { RestaurantCard } from "@/components/shared/restaurant-card";
import { listCategories, listRestaurants } from "@/features/restaurants/data";
import { siteConfig } from "@/config/site";

export default async function HomePage() {
  const [restaurants, categories] = await Promise.all([
    listRestaurants({ limit: 6 }),
    listCategories(),
  ]);

  return (
    <div className="space-y-12 md:space-y-16">
      <section className="brand-gradient relative overflow-hidden rounded-[1.75rem] px-5 py-10 text-white sm:px-9 md:grid md:min-h-[390px] md:grid-cols-[1.25fr_.75fr] md:items-center md:px-14 md:py-14">
        <div className="relative z-10 max-w-2xl space-y-5">
          <p className="inline-flex rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold tracking-wide">DÀNH CHO SINH VIÊN HANU</p>
          <h1 className="text-[clamp(2.25rem,8vw,4.6rem)] font-black leading-[1.04] tracking-tight">{siteConfig.tagline}</h1>
          <p className="max-w-xl text-sm leading-6 text-white/95 sm:text-base">Khám phá quán và món ăn quanh trường từ dữ liệu khảo sát thực tế. Tìm đúng món bạn thích, lưu lại những lần đã ăn.</p>
          <form action="/restaurants" className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row">
            <label className="sr-only" htmlFor="home-search">Tìm quán hoặc món ăn</label>
            <input id="home-search" name="q" placeholder="Bạn muốn ăn gì hôm nay?" className="field min-w-0 flex-1 border-0 text-[var(--color-ink)]" />
            <button type="submit" className="button button-primary shrink-0">Tìm quán ngay</button>
          </form>
        </div>
        <div className="pointer-events-none relative mt-8 flex justify-center md:mt-0" aria-hidden="true">
          <span className="absolute top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-white/15 blur-2xl md:h-72 md:w-72" />
          <span className="relative text-[9rem] leading-none drop-shadow-2xl sm:text-[11rem] md:text-[15rem]">🍲</span>
        </div>
      </section>

      <section className="space-y-5">
        <div><p className="eyebrow">Khám phá theo sở thích</p><h2 className="section-title mt-2">Hôm nay bạn thèm gì?</h2></div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.length ? categories.map((category) => (
            <Link key={category.id} href={`/restaurants?category=${encodeURIComponent(category.slug)}`} className="button button-secondary shrink-0 text-sm">{category.name}</Link>
          )) : <p className="text-sm text-[var(--color-muted)]">Danh mục đang được cập nhật.</p>}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="eyebrow">Dữ liệu khảo sát</p><h2 className="section-title mt-2">Quán ăn quanh HANU</h2></div>
          <Link href="/restaurants" className="button button-outline">Xem tất cả →</Link>
        </div>
        {restaurants.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{restaurants.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div>
        ) : (
          <div className="card p-8 text-center text-[var(--color-muted)]">Dữ liệu quán đang được cập nhật.</div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card bg-[var(--color-pale)] p-6 sm:p-8"><span className="text-4xl" aria-hidden="true">🎲</span><h2 className="mt-3 text-2xl font-extrabold">Chưa biết ăn gì?</h2><p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">Để Gacha chọn ngẫu nhiên một quán từ dữ liệu thật cho bạn.</p><Link href="/gacha" className="button button-primary mt-5">Thử vận may</Link></div>
        <div className="card p-6 sm:p-8"><span className="text-4xl" aria-hidden="true">📝</span><h2 className="mt-3 text-2xl font-extrabold">Lưu lại bữa ăn</h2><p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">Bấm “Đã ăn” tại trang quán để xem lịch sử và nhịp ăn uống của mình.</p><Link href="/history" className="button button-secondary mt-5">Xem lịch sử</Link></div>
      </section>
    </div>
  );
}
