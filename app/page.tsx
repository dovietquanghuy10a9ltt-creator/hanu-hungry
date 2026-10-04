import Link from "next/link";
import { RestaurantCard } from "@/components/shared/restaurant-card";
import { listCategories } from "@/features/restaurants/data";
import { listCatalog } from "@/features/restaurants/catalog";
import { QuickSearch } from "@/features/restaurants/components/QuickSearch";

export default async function HomePage() {
  const [catalog, categories] = await Promise.all([listCatalog(), listCategories()]);
  const restaurants = catalog.slice(0, 6);
  return <div className="home-page">
    <section className="home-hero"><div className="hero-copy"><p className="eyebrow">Chiếc bụng đói · Một vòng HANU</p><h1>Quanh trường.<br />Quanh bàn.<br /><span>Quanh một bữa ngon.</span></h1><p className="hero-description">Những quán quen, những món chưa thử. Một cuốn sổ nhỏ giúp bạn tìm chỗ ăn hợp gu, vừa túi tiền.</p><QuickSearch catalog={catalog} /><div className="hero-meta"><span>{catalog.length} quán trong sổ</span><span>Đại học Hà Nội & vùng lân cận</span></div></div><div className="hero-poster"><div className="poster-top"><span>HÀ NỘI</span><span>ĂN GÌ / 01</span></div><div className="poster-word">đói<br /><span>chưa?</span></div><div className="poster-orbit" aria-hidden="true">✳</div><div className="poster-note">Đi một vòng nhỏ.<br />Gặp một quán ngon.</div><Link href="/gacha" className="poster-link">Để vũ trụ chọn giúp <span>↗</span></Link></div></section>
    <section className="home-categories"><p className="eyebrow">Bạn đang thèm gì?</p><div className="category-strip">{categories.map((category) => <Link key={category.id} href={`/restaurants?category=${encodeURIComponent(category.slug)}`}>{category.name}<span aria-hidden="true">↗</span></Link>)}</div></section>
    <section className="space-y-6"><div className="section-heading"><div><p className="eyebrow">Địa điểm trong sổ</p><h2 className="section-title mt-3">Hẹn nhau ở quán.</h2></div><Link href="/restaurants" className="text-link">Khám phá tất cả ↗</Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{restaurants.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div></section>
    <section className="home-bottom"><Link href="/gacha" className="gacha-invitation"><span className="cosmic-heading">Tín hiệu từ vũ trụ</span><h2>Không biết ăn gì?<br />Quay một vòng xem sao.</h2><span className="button button-primary mt-5">Thử Gacha ↗</span><span className="invitation-star" aria-hidden="true">✦</span></Link><Link href="/history" className="history-invitation"><span className="eyebrow">Nhật ký của bạn</span><h2>Bữa ngon thì<br />nhớ lâu một chút.</h2><p>Lưu quán đã ghé, món đã thử. Lần tới rủ bạn bè đi cùng.</p><span className="text-link mt-5">Mở nhật ký ↗</span></Link></section>
  </div>;
}
