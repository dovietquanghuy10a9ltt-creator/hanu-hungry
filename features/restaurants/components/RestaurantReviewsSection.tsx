"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-context";
import { ReviewForm } from "@/features/reviews/components/ReviewForm";

export type PublicReviewItem = {
  id: string;
  user_id: string;
  rating: number | null;
  comment: string;
  created_at: string;
};

export function RestaurantReviewsSection({
  restaurantId,
  reviews,
}: {
  restaurantId: string;
  reviews: PublicReviewItem[];
}) {
  const { loading, authenticated, user } = useAuth();
  const ownReview = user ? reviews.find((review) => review.user_id === user.id) : null;

  return (
    <section id="reviews" className="space-y-5 scroll-mt-24">
      <div>
        <p className="eyebrow">Cảm nhận của sinh viên</p>
        <h2 className="section-title mt-2">Đánh giá quán</h2>
      </div>

      {loading ? (
        <div className="py-4 text-xs text-[var(--color-muted)] animate-pulse">
          Đang kiểm tra tài khoản...
        </div>
      ) : authenticated ? (
        <ReviewForm restaurantId={restaurantId} ownReview={ownReview} />
      ) : (
        <p className="text-sm text-[var(--color-muted)]">
          <Link
            href={`/login?next=${encodeURIComponent(`/restaurants/${restaurantId}#reviews`)}`}
            className="font-bold text-[var(--color-red)]"
          >
            Đăng nhập
          </Link>{" "}
          để chia sẻ đánh giá.
        </p>
      )}

      {reviews.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="card p-5">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-sm">
                  {user && review.user_id === user.id ? "Bạn" : "Sinh viên Hanu"}
                </strong>
                {review.rating !== null && (
                  <span className="text-sm font-bold text-[var(--color-red)]">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">
                {review.comment}
              </p>
              <time
                className="mt-3 block text-xs text-[var(--color-muted)]"
                dateTime={review.created_at}
              >
                {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(
                  new Date(review.created_at)
                )}
              </time>
            </article>
          ))}
        </div>
      ) : (
        <div className="card p-6 text-sm text-[var(--color-muted)]">
          Chưa có đánh giá. Hãy là người đầu tiên chia sẻ trải nghiệm.
        </div>
      )}
    </section>
  );
}
