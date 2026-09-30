import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createCheckIn } from "@/features/history/actions";
import { createReview, deleteReview, updateReview } from "@/features/reviews/actions";
import { formatPrice, mapsUrl, readableText } from "@/features/restaurants/format";
import { getRestaurant } from "@/features/restaurants/data";
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
  const [{ data: { user } }, { data: reviews }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("reviews").select("id,user_id,rating,comment,created_at").eq("restaurant_id", id).order("created_at", { ascending: false }),
  ]);
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
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]">
        <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-[1.5rem] bg-[var(--color-pale)] sm:min-h-80">
          {restaurant.image_url ? <Image src={restaurant.image_url} alt={restaurant.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" unoptimized /> : <span className="text-8xl opacity-60" aria-hidden="true">🍽️</span>}
        </div>
        <div className="card space-y-5 p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">{(categories.length ? categories : ["Chưa phân loại"]).map((category) => <span key={category} className="rounded-full bg-[var(--color-pale)] px-3 py-1.5 text-xs font-bold text-[var(--color-red)]">{category}</span>)}</div>
          <div><p className="eyebrow">Khám phá quanh HANU</p><h1 className="mt-2 break-words text-3xl font-black leading-tight sm:text-4xl">{restaurant.name}</h1></div>
          <div className="space-y-3 text-sm">
            <p><span className="font-bold">Khu vực:</span> {readableText(restaurant.area, "Chưa có dữ liệu khu vực")}</p>
            <p><span className="font-bold">Địa chỉ:</span> {readableText(restaurant.address_text, "Chưa có dữ liệu vị trí")}</p>
            {restaurant.plus_code && <p className="break-all"><span className="font-bold">Plus Code:</span> {restaurant.plus_code}</p>}
            {ratingAverage !== null && <p><span className="font-bold">Đánh giá:</span> {ratingAverage.toFixed(1)}/5 ({reviewItems.length} lượt)</p>}
          </div>
          <p className="text-sm leading-6 text-[var(--color-muted)]">{readableText(restaurant.description)}</p>
          {mapLink ? <a href={mapLink} target="_blank" rel="noopener noreferrer" className="button button-primary w-full sm:w-auto">Mở trên Google Maps ↗</a> : <p className="rounded-xl bg-[var(--color-pale)] px-4 py-3 text-sm text-[var(--color-muted)]">Chưa có dữ liệu vị trí để mở bản đồ.</p>}
        </div>
      </section>

      {restaurant.notes && <section className="card p-5"><h2 className="text-lg font-extrabold">Ghi chú từ khảo sát</h2><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--color-muted)]">{restaurant.notes}</p></section>}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,.7fr)]">
        <div className="space-y-4"><div><p className="eyebrow">Thực đơn</p><h2 className="section-title mt-2">Món ăn & giá</h2></div>
          {dishes.length ? <div className="card divide-y divide-[var(--color-line)] overflow-hidden">{dishes.map((dish) => <div key={dish.id} className="flex flex-wrap items-start justify-between gap-2 p-4 sm:p-5"><div className="min-w-0 flex-1"><h3 className="break-words font-bold">{dish.name}</h3>{dish.notes && <p className="mt-1 break-words text-sm text-[var(--color-muted)]">{dish.notes}</p>}</div><span className="max-w-full break-words text-sm font-bold text-[var(--color-red)]">{formatPrice(dish.price_text, dish.price_min_vnd, dish.price_max_vnd)}</span></div>)}</div> : <div className="card p-6 text-sm text-[var(--color-muted)]">Thực đơn đang được cập nhật.</div>}
        </div>
        <div className="space-y-4"><div><p className="eyebrow">Nhật ký ăn uống</p><h2 className="section-title mt-2">Bạn đã ăn ở đây?</h2></div>
          <div className="card space-y-4 p-5"><p className="text-sm leading-6 text-[var(--color-muted)]">Chỉ khi bạn bấm “Đã ăn”, lần ghé quán mới được lưu vào lịch sử.</p>
            {user ? <form action={createCheckIn} className="space-y-3"><input type="hidden" name="restaurantId" value={restaurant.id} /><label className="block text-sm font-bold">Món đã ăn (không bắt buộc)<select name="dishId" className="field mt-1.5"><option value="">Chỉ lưu quán</option>{dishes.map((dish) => <option key={dish.id} value={dish.id}>{dish.name}</option>)}</select></label><button type="submit" className="button button-primary w-full">✓ Đã ăn</button></form> : <Link href={`/login?next=${encodeURIComponent(`/restaurants/${id}`)}`} className="button button-primary w-full">Đăng nhập để lưu</Link>}
          </div>
        </div>
      </section>

      <section id="reviews" className="space-y-5 scroll-mt-24"><div><p className="eyebrow">Cảm nhận của sinh viên</p><h2 className="section-title mt-2">Đánh giá quán</h2></div>
        {user ? <div className="card max-w-3xl p-5 sm:p-6"><h3 className="font-extrabold">{ownReview ? "Sửa đánh giá của bạn" : "Chia sẻ trải nghiệm của bạn"}</h3><form action={ownReview ? updateReview : createReview} className="mt-4 space-y-4"><input type="hidden" name="restaurantId" value={restaurant.id} />{ownReview && <input type="hidden" name="id" value={ownReview.id} />}<label className="block text-sm font-bold">Số sao<select name="rating" defaultValue={ownReview?.rating || 5} className="field mt-1.5">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} sao</option>)}</select></label><label className="block text-sm font-bold">Nhận xét<textarea name="comment" rows={4} minLength={3} maxLength={2000} required defaultValue={ownReview?.comment || ""} placeholder="Món ăn, không gian, trải nghiệm..." className="field mt-1.5 min-h-28 resize-y" /></label><button type="submit" className="button button-primary">{ownReview ? "Lưu thay đổi" : "Gửi đánh giá"}</button></form>{ownReview && <form action={deleteReview} className="mt-3"><input type="hidden" name="id" value={ownReview.id} /><input type="hidden" name="restaurantId" value={restaurant.id} /><button type="submit" className="min-h-11 text-sm font-bold text-[var(--color-red)]">Xóa đánh giá của tôi</button></form>}</div> : <p className="text-sm text-[var(--color-muted)]"><Link href="/login" className="font-bold text-[var(--color-red)]">Đăng nhập</Link> để chia sẻ đánh giá.</p>}
        {reviewItems.length ? <div className="grid gap-3 md:grid-cols-2">{reviewItems.map((review) => <article key={review.id} className="card p-5"><div className="flex items-center justify-between gap-2"><strong className="text-sm">{review.user_id === user?.id ? "Bạn" : "Sinh viên HANU"}</strong>{review.rating !== null && <span className="text-sm font-bold text-[var(--color-red)]">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>}</div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">{review.comment}</p><time className="mt-3 block text-xs text-[var(--color-muted)]" dateTime={review.created_at}>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(review.created_at))}</time></article>)}</div> : <div className="card p-6 text-sm text-[var(--color-muted)]">Chưa có đánh giá. Hãy là người đầu tiên chia sẻ trải nghiệm.</div>}
      </section>
    </div>
  );
}
