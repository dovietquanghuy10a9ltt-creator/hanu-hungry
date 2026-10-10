"use client";

import { useState } from "react";
import { createReview, updateReview, deleteReview } from "@/features/reviews/actions";

interface ReviewFormProps {
  restaurantId: string;
  ownReview?: {
    id: string;
    rating: number | null;
    comment: string | null;
  } | null;
}

const RATING_LABELS: Record<number, string> = {
  1: "Rất tệ",
  2: "Không hài lòng",
  3: "Bình thường",
  4: "Hài lòng",
  5: "Tuyệt vời",
};

export function ReviewForm({ restaurantId, ownReview }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(ownReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [commentText, setCommentText] = useState<string>(ownReview?.comment || "");

  const activeRating = hoverRating || rating;
  const isEditing = Boolean(ownReview);

  return (
    <div className="card max-w-3xl p-5 sm:p-6 space-y-5">
      <div>
        <h3 className="text-base sm:text-lg font-extrabold text-[var(--color-ink)]">
          {isEditing ? "Chỉnh sửa đánh giá của bạn" : "Chia sẻ trải nghiệm của bạn"}
        </h3>
        <p className="text-xs text-[var(--color-muted)] mt-0.5">
          {isEditing
            ? "Cập nhật số sao hoặc nhận xét của bạn về quán ăn này."
            : "Đánh giá bằng sao giúp cộng đồng sinh viên Hanu chọn quán chuẩn xác hơn."}
        </p>
      </div>

      <form action={isEditing ? updateReview : createReview} className="space-y-5">
        <input type="hidden" name="restaurantId" value={restaurantId} />
        {ownReview && <input type="hidden" name="id" value={ownReview.id} />}
        <input type="hidden" name="rating" value={rating} />

        {/* 1. Google Maps-style Interactive Stars */}
        <div className="rounded-2xl border border-[var(--color-line)] bg-[#fdfbf7] p-4 sm:p-5 flex flex-col items-center justify-center text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
            Xếp hạng quán ăn
          </p>

          <div
            className="flex items-center gap-2 sm:gap-3 py-1"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= activeRating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  className="p-1 transition-transform duration-150 hover:scale-125 active:scale-95 cursor-pointer focus:outline-none"
                  aria-label={`${star} sao - ${RATING_LABELS[star]}`}
                >
                  <svg
                    className={`h-8 w-8 sm:h-10 sm:w-10 transition-colors duration-200 ${
                      isFilled
                        ? "fill-[#f59e0b] text-[#f59e0b] drop-shadow-xs"
                        : "fill-transparent text-gray-300 stroke-[1.5]"
                    }`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              );
            })}
          </div>

          <div className="min-h-6 flex items-center justify-center">
            {activeRating > 0 ? (
              <span className="text-sm font-extrabold text-[var(--color-red)] animate-fadeIn">
                ⭐ {activeRating}/5 sao — {RATING_LABELS[activeRating]}
              </span>
            ) : (
              <span className="text-xs text-[var(--color-muted)] italic">
                Chạm vào các ngôi sao ở trên để đánh giá
              </span>
            )}
          </div>
        </div>

        {/* 2. Comment Textarea (Chỉ hiện ra khi đã chọn số sao) */}
        {rating > 0 && (
          <div className="space-y-4 animate-fadeIn border-t border-[var(--color-line)] pt-4">
            <div>
              <label htmlFor="review-comment" className="block text-sm font-bold text-[var(--color-ink)]">
                Nhận xét chi tiết (bắt buộc)
              </label>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Món ăn ngon không, phục vụ thế nào, mức giá có hợp lý với sinh viên không?
              </p>
              <textarea
                id="review-comment"
                name="comment"
                rows={4}
                minLength={3}
                maxLength={2000}
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Chia sẻ trải nghiệm chân thật của bạn về quán ăn này..."
                className="field mt-2 min-h-28 w-full resize-y rounded-xl border border-[var(--color-line)] bg-white p-3 text-sm focus:outline-[var(--color-red)]"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--color-muted)]">
                <span>Tối thiểu 3 ký tự</span>
                <span>{commentText.length}/2.000 ký tự</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={commentText.trim().length < 3}
                className="button button-primary px-5 py-2.5 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isEditing ? "Lưu thay đổi" : "Gửi đánh giá"}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Delete Own Review Form */}
      {isEditing && ownReview && (
        <form action={deleteReview} className="border-t border-[var(--color-line)] pt-3">
          <input type="hidden" name="id" value={ownReview.id} />
          <input type="hidden" name="restaurantId" value={restaurantId} />
          <button
            type="submit"
            className="text-xs font-bold text-[var(--color-red)] hover:underline cursor-pointer"
          >
            🗑️ Xóa đánh giá này
          </button>
        </form>
      )}
    </div>
  );
}
