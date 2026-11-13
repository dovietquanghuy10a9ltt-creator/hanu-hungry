import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Star } from "lucide-react";
import { formatPrice, mapsUrl, readableText } from "@/features/restaurants/format";
import { getRestaurant } from "@/features/restaurants/data";
import { listCatalog } from "@/features/restaurants/catalog";
import { RestaurantActionButtons } from "@/features/restaurants/components/RestaurantActionButtons";
import { RestaurantUserVisits } from "@/features/restaurants/components/RestaurantUserVisits";
import { RestaurantReviewsSection, type PublicReviewItem } from "@/features/restaurants/components/RestaurantReviewsSection";
import { createPublicClient } from "@/lib/supabase/public";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const catalog = await listCatalog();
    return catalog.map((r) => ({ id: r.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const restaurant = await getRestaurant(id);
  if (!restaurant) return { title: "Quán ăn" };
  const categories = restaurant.restaurant_categories
    .map((item) => item.categories?.name)
    .filter(Boolean)
    .join(", ");
  const description = `${restaurant.name} - ${restaurant.area || "quanh khu vực Đại học Hà Nội"}. ${categories ? `Phục vụ: ${categories}. ` : ""}Xem thực đơn, giá cả và đánh giá thực tế từ sinh viên HANU.`;
  return {
    title: restaurant.name,
    description,
    alternates: {
      canonical: `https://hanuhungry.id.vn/restaurants/${restaurant.id}`,
    },
    openGraph: {
      title: `${restaurant.name} | Hanu Hungry`,
      description,
      url: `https://hanuhungry.id.vn/restaurants/${restaurant.id}`,
      images: restaurant.image_url ? [{ url: restaurant.image_url, alt: restaurant.name }] : undefined,
    },
  };
}

export default async function RestaurantPage({ params }: Props) {
  const { id } = await params;
  const restaurant = await getRestaurant(id);
  if (!restaurant) notFound();

  const supabase = createPublicClient();
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("id,user_id,rating,comment,created_at")
    .eq("restaurant_id", id)
    .order("created_at", { ascending: false });

  const reviewItems: PublicReviewItem[] = (reviewsData ?? []) as PublicReviewItem[];
  const ratedReviews = reviewItems.filter((review) => review.rating !== null);
  const ratingAverage = ratedReviews.length
    ? ratedReviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) / ratedReviews.length
    : null;

  const categories = restaurant.restaurant_categories
    .map((item) => item.categories?.name)
    .filter((name): name is string => Boolean(name));
  const mapLink = mapsUrl(restaurant);
  const dishes = restaurant.dishes
    .filter((dish) => dish.is_active)
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));

  return (
    <div className="space-y-8">
      <div>
        <Link href="/restaurants" className="text-sm font-bold text-[var(--color-red)]">
          ← Tất cả quán
        </Link>
      </div>

      <section
        className={
          restaurant.image_url
            ? "grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]"
            : "max-w-4xl"
        }
      >
        {restaurant.image_url && (
          <div className="relative min-h-56 overflow-hidden rounded-xl sm:min-h-80">
            <Image
              src={restaurant.image_url}
              alt={`Không gian ${restaurant.name}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
              unoptimized
            />
          </div>
        )}

        <div className="card space-y-5 p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            {(categories.length ? categories : ["Chưa phân loại"]).map((category) => (
              <span
                key={category}
                className="rounded-full bg-[var(--color-pale)] px-3 py-1.5 text-xs font-bold text-[var(--color-red)]"
              >
                {category}
              </span>
            ))}
          </div>

          <div>
            <p className="eyebrow">Khám phá quanh Hanu</p>
            <h1 className="mt-2 break-words text-3xl font-black leading-tight sm:text-4xl">
              {restaurant.name}
            </h1>
          </div>

          <div className="space-y-3 text-sm">
            <p>
              <span className="font-bold">Khu vực:</span>{" "}
              {readableText(restaurant.area, "Chưa có dữ liệu khu vực")}
            </p>
            <p>
              <span className="font-bold">Địa chỉ:</span>{" "}
              {readableText(restaurant.address_text, "Chưa có dữ liệu vị trí")}
            </p>
            {restaurant.plus_code && (
              <p className="break-all">
                <span className="font-bold">Plus Code:</span> {restaurant.plus_code}
              </p>
            )}
            {ratingAverage !== null && (
              <p className="flex items-center gap-1.5">
                <span className="font-bold">Đánh giá:</span>
                <span className="inline-flex items-center gap-1 font-extrabold text-[#d97706]">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400 inline" />
                  <span>{ratingAverage.toFixed(1)}/5</span>
                </span>
                <span className="text-[var(--color-muted)]">({reviewItems.length} lượt)</span>
              </p>
            )}
          </div>

          <p className="text-sm leading-6 text-[var(--color-muted)]">
            {readableText(restaurant.description)}
          </p>

          {mapLink ? (
            <RestaurantActionButtons
              mapLink={mapLink}
              restaurantId={restaurant.id}
              restaurantName={restaurant.name}
            />
          ) : (
            <p className="rounded-xl bg-[var(--color-pale)] px-4 py-3 text-sm text-[var(--color-muted)]">
              Chưa có dữ liệu vị trí để mở bản đồ.
            </p>
          )}
        </div>
      </section>

      {restaurant.notes && (
        <section className="card p-5">
          <h2 className="text-lg font-extrabold">Ghi chú từ khảo sát</h2>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--color-muted)]">
            {restaurant.notes}
          </p>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,.7fr)]">
        <div className="space-y-4">
          <div>
            <p className="eyebrow">Thực đơn</p>
            <h2 className="section-title mt-2">Món ăn & giá</h2>
          </div>
          {dishes.length ? (
            <div className="card divide-y divide-[var(--color-line)] overflow-hidden">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5"
                >
                  {dish.image_url && (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--color-line)]">
                      <Image
                        src={dish.image_url}
                        alt={dish.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-bold">{dish.name}</h3>
                    {dish.notes && (
                      <p className="mt-1 break-words text-sm text-[var(--color-muted)]">
                        {dish.notes}
                      </p>
                    )}
                  </div>
                  <span className="max-w-full break-words text-sm font-bold text-[var(--color-red)]">
                    {formatPrice(dish.price_text, dish.price_min_vnd, dish.price_max_vnd)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-6 text-sm text-[var(--color-muted)]">
              Thực đơn đang được cập nhật.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="eyebrow">Nhật ký ghé quán</p>
            <h2 className="section-title mt-2">Lịch sử của bạn</h2>
          </div>
          <div className="card space-y-4 p-5 sm:p-6">
            <RestaurantUserVisits restaurantId={restaurant.id} />
          </div>
        </div>
      </section>

      <RestaurantReviewsSection
        restaurantId={restaurant.id}
        reviews={reviewItems}
      />
    </div>
  );
}
