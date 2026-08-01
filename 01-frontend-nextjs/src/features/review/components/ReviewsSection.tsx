import type { Review } from "../types/review.types";

interface ReviewsSectionProps {
  reviews: Review[];
  total: number;
}

export function ReviewsSection({ reviews, total }: ReviewsSectionProps) {
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }));
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold font-sora text-neutral-900">
        Đánh giá sản phẩm ({total})
      </h2>

      {reviews.length === 0 ? (
        <p className="text-sm text-neutral-500 font-manrope">
          Chưa có đánh giá nào cho sản phẩm này.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-4 rounded-2xl bg-neutral-50 p-4">
            <div className="text-center">
              <p className="text-3xl font-bold font-sora text-neutral-900">
                {average.toFixed(1)}
              </p>
              <p className="text-xs text-neutral-500 font-manrope">/ 5</p>
            </div>
            <div className="flex flex-1 flex-col gap-1">
              {breakdown.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2 text-xs font-manrope text-neutral-600">
                  <span className="w-8 shrink-0">{star} sao</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-4 shrink-0 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <ul className="flex flex-col gap-4">
            {reviews.map((review) => (
              <li key={review.id} className="border-b border-neutral-100 pb-4">
                <p className="text-xs font-manrope text-amber-500">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </p>
                {review.comment && (
                  <p className="mt-1 text-sm font-manrope text-neutral-700">{review.comment}</p>
                )}
                {review.sellerReply && (
                  <p className="mt-2 rounded-lg bg-neutral-50 p-2 text-xs font-manrope text-neutral-600">
                    Phản hồi từ người bán: {review.sellerReply}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
