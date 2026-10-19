import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReviewForm } from "@/features/reviews/components/ReviewForm";
import { formatPrice, mapsUrl, readableText } from "@/features/restaurants/format";
import { getRestaurant } from "@/features/restaurants/data";
import { MapNavigationButton } from "@/features/restaurants/components/MapNavigationButton";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const restaurant = await getRestaurant(id);
  return { title: restaurant?.name || "Quán ăn" };
}

export default async function RestaurantPage({ params }: Props) {
  const { id } = await params;
  const restaurant = await getRestaurant(id);
  if (!restaurant) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: reviews }, { data: pastVisits }] = await Promise.all([
    supabase.from("reviews").select("id,user_id,rating,comment,created_at").eq("restaurant_id", id).order("created_at", { ascending: false }),
    user
      ? supabase
          .from("check_ins")
          .select("id, visited_at, dish_id, dishes(name)")
          .eq("restaurant_id", id)
          .eq("user_id", user.id)
          .order("visited_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);
  const userVisits = pastVisits ?? [];
  const reviewItems = reviews ?? [];
  const ratedReviews = reviewItems.filter((review) => review.rating !== null);
  const ratingAverage = ratedReviews.length
    ? ratedReviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) / ratedReviews.length
    : null;
  const ownReview = user ? reviewItems.find((review) => review.user_id === user.id) : null;
  const categories = restaurant.restaurant_categories.map((item) => item.categories?.name).filter((name): name is string => Boolean(name));
  const mapLink = mapsUrl(restaurant);
  const dishes = restaurant.dishes.filter((dish) => dish.is_active).sort((a, b) => a.name.localeCompare(b.name, "vi"));

  return (
    <div className="space-y-8">
      <div><Link href="/restaurants" className="text-sm font-bold text-[var(--color-red)]">← Tất cả quán</Link></div>
      <section className={restaurant.image_url ? "grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]" : "max-w-4xl"}>
        {restaurant.image_url && <div className="relative min-h-56 overflow-hidden rounded-xl sm:min-h-80"><Image src={restaurant.image_url} alt={`Không gian ${restaurant.name}`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" unoptimized /></div>}
        <div className="card space-y-5 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            {(categories.length ? categories : ["Chưa phân loại"]).map((category) => <span key={category} className="rounded-full bg-[var(--color-pale)] px-3 py-1.5 text-xs font-bold text-[var(--color-red)]">{category}</span>)}
          </div>
          <div><p className="eyebrow">Khám phá quanh Hanu</p><h1 className="mt-2 break-words text-3xl font-black leading-tight sm:text-4xl">{restaurant.name}</h1></div>
          <div className="space-y-3 text-sm">
            <p><span className="font-bold">Khu vực:</span> {readableText(restaurant.area, "Chưa có dữ liệu khu vực")}</p>
            <p><span className="font-bold">Địa chỉ:</span> {readableText(restaurant.address_text, "Chưa có dữ liệu vị trí")}</p>
            {restaurant.plus_code && <p className="break-all"><span className="font-bold">Plus Code:</span> {restaurant.plus_code}</p>}
            {ratingAverage !== null && <p><span className="font-bold">Đánh giá:</span> {ratingAverage.toFixed(1)}/5 ({reviewItems.length} lượt)</p>}
          </div>
          <p className="text-sm leading-6 text-[var(--color-muted)]">{readableText(restaurant.description)}</p>
          {mapLink ? <MapNavigationButton mapLink={mapLink} restaurantId={restaurant.id} restaurantName={restaurant.name} /> : <p className="rounded-xl bg-[var(--color-pale)] px-4 py-3 text-sm text-[var(--color-muted)]">Chưa có dữ liệu vị trí để mở bản đồ.</p>}
        </div>
      </section>

      {restaurant.notes && <section className="card p-5"><h2 className="text-lg font-extrabold">Ghi chú từ khảo sát</h2><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--color-muted)]">{restaurant.notes}</p></section>}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,.7fr)]">
        <div className="space-y-4"><div><p className="eyebrow">Thực đơn</p><h2 className="section-title mt-2">Món ăn & giá</h2></div>
          {dishes.length ? <div className="card divide-y divide-[var(--color-line)] overflow-hidden">{dishes.map((dish) => <div key={dish.id} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">{dish.image_url && <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--color-line)]"><Image src={dish.image_url} alt={dish.name} fill className="object-cover" sizes="56px" unoptimized /></div>}<div className="min-w-0 flex-1"><h3 className="break-words font-bold">{dish.name}</h3>{dish.notes && <p className="mt-1 break-words text-sm text-[var(--color-muted)]">{dish.notes}</p>}</div><span className="max-w-full break-words text-sm font-bold text-[var(--color-red)]">{formatPrice(dish.price_text, dish.price_min_vnd, dish.price_max_vnd)}</span></div>)}</div> : <div className="card p-6 text-sm text-[var(--color-muted)]">Thực đơn đang được cập nhật.</div>}
        </div>
        <div className="space-y-4">
          <div>
            <p className="eyebrow">Nhật ký ghé quán</p>
            <h2 className="section-title mt-2">Lịch sử của bạn</h2>
          </div>
          <div className="card space-y-4 p-5 sm:p-6">
            {!user ? (
              <div className="space-y-3 text-center py-4">
                <span className="text-3xl">📖</span>
                <p className="text-sm text-[var(--color-muted)]">
                  Đăng nhập để theo dõi và xem lại những lần bạn từng ghé ăn tại quán này.
                </p>
                <Link
                  href={`/login?next=${encodeURIComponent(`/restaurants/${id}`)}`}
                  className="button button-primary inline-flex text-xs px-4 py-2 font-bold"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            ) : userVisits.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-3">
                  <span className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
                    Tổng số lần đã ghé
                  </span>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-black text-emerald-700">
                    {userVisits.length} lần
                  </span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {userVisits.map((visit: any, index: number) => {
                    const date = new Date(visit.visited_at);
                    const formattedDate = new Intl.DateTimeFormat("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(date);
                    const formattedTime = new Intl.DateTimeFormat("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(date);

                    return (
                      <div
                        key={visit.id || index}
                        className="rounded-xl border border-[var(--color-line)] bg-[#fdfbf7] p-3 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-[var(--color-ink)]">
                          <span className="flex items-center gap-1.5">
                            <span>🗓️</span> {formattedDate}
                          </span>
                          <span className="text-[11px] text-[var(--color-muted)] font-mono">
                            ⏰ {formattedTime}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[11px] text-[var(--color-muted)] text-center pt-1 border-t border-[var(--color-line)]">
                  Lần ghé được tự động ghi nhận khi bạn mở Google Maps chỉ đường tới quán.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-center py-4">
                <span className="text-3xl">📍</span>
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  Bạn chưa từng ghé quán này
                </p>
                <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                  Bấm nút <strong>“Mở trên Google Maps”</strong> ở phía trên để tìm đường tới quán. Hệ thống sẽ tự động ghi nhớ và nhắc bạn lưu vào nhật ký ăn uống!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="reviews" className="space-y-5 scroll-mt-24"><div><p className="eyebrow">Cảm nhận của sinh viên</p><h2 className="section-title mt-2">Đánh giá quán</h2></div>
        {user ? (
          <ReviewForm restaurantId={restaurant.id} ownReview={ownReview} />
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            <Link href="/login" className="font-bold text-[var(--color-red)]">Đăng nhập</Link> để chia sẻ đánh giá.
          </p>
        )}
        {reviewItems.length ? <div className="grid gap-3 md:grid-cols-2">{reviewItems.map((review) => <article key={review.id} className="card p-5"><div className="flex items-center justify-between gap-2"><strong className="text-sm">{review.user_id === user?.id ? "Bạn" : "Sinh viên Hanu"}</strong>{review.rating !== null && <span className="text-sm font-bold text-[var(--color-red)]">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>}</div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">{review.comment}</p><time className="mt-3 block text-xs text-[var(--color-muted)]" dateTime={review.created_at}>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(review.created_at))}</time></article>)}</div> : <div className="card p-6 text-sm text-[var(--color-muted)]">Chưa có đánh giá. Hãy là người đầu tiên chia sẻ trải nghiệm.</div>}
      </section>
    </div>
  );
}
