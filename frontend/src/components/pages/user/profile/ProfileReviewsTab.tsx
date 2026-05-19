import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { getUserReviews, type Review, type ReviewsMeta } from "@/lib/api/reviews";
import ImageLightbox from "@/components/common/ImageLightbox";

interface ProfileReviewsTabProps {
  avgRating: number;
  totalReviews: number;
  userId?: string;
  onNavigate?: (page: string, data?: string | { productId?: string }) => void;
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : star - 0.5 <= rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-slate-300"
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  if (diffWeeks < 5) return `${diffWeeks} minggu yang lalu`;
  if (diffMonths < 12) return `${diffMonths} bulan yang lalu`;
  return date.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
}

export default function ProfileReviewsTab({ avgRating, totalReviews, userId, onNavigate }: ProfileReviewsTabProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<ReviewsMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeReview, setActiveReview] = useState<Review | null>(null);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchReviews = async () => {
      setLoading(true);
      setError(false);
      try {
        const result = await getUserReviews(userId, { per_page: 20 });
        setReviews(result.data || []);
        setMeta(result.meta || null);
      } catch (err) {
        console.error("[ProfileReviewsTab] Failed to fetch reviews:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  if (totalReviews === 0 && !loading && reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <Star className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Belum ada rating atau ulasan untuk user ini</p>
        </CardContent>
      </Card>
    );
  }

  const handleProductClick = (review: Review) => {
    if (!onNavigate || !review.product) return;
    const productType = review.product.type === "jasa" ? "service-detail" : "product";
    onNavigate(productType, review.product.id);
  };

  // Use meta distribution if available, otherwise fall back to calculated from reviews
  const distribution = meta?.distribution || {};

  return (
    <Card>
      <CardContent className="p-6">
        {/* Rating summary */}
        <div className="flex items-center gap-6 mb-6 pb-6 border-b">
          <div className="text-center">
            <p className="text-4xl font-bold">{avgRating.toFixed(1)}</p>
            {renderStars(avgRating)}
            <p className="text-sm text-muted-foreground mt-1">{totalReviews} ulasan</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-4">{star}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{count > 0 ? `${Math.round(percentage)}%` : "0%"}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b pb-4 last:border-0 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Gagal memuat ulasan. Silakan coba lagi.</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Belum ada ulasan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const reviewerName = review.reviewer?.name || "Anonim";
              const reviewerAvatar = review.reviewer?.avatar;
              const initials = reviewerName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
              const productName = review.product?.title;
              const hasProduct = !!review.product?.id;

              return (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      {reviewerAvatar && <AvatarImage src={reviewerAvatar} alt={reviewerName} />}
                      <AvatarFallback className="bg-slate-100 text-slate-600">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{reviewerName}</p>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {review.comment}
                      </p>
                      {/* Review images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-2 flex-wrap">
                          {review.images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setActiveReview(review);
                                setSelectedImgIdx(idx);
                              }}
                              className="relative h-16 w-16 rounded-md overflow-hidden border bg-slate-100 dark:bg-slate-800 hover:opacity-85 transition-opacity"
                            >
                              <img src={img} alt={`Review ${idx + 1}`} className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(review.createdAt)}
                        {productName && (
                          <>
                            {" • "}
                            {hasProduct && onNavigate ? (
                              <button
                                onClick={() => handleProductClick(review)}
                                className="text-primary-600 hover:text-primary-700 hover:underline transition-colors font-medium"
                              >
                                {productName}
                              </button>
                            ) : (
                              <span className="text-primary-600">{productName}</span>
                            )}
                          </>
                        )}
                      </p>
                      {/* Seller response */}
                      {review.sellerResponse && (
                        <div className="mt-2 ml-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-l-2 border-primary-500">
                          <p className="text-xs font-medium text-primary-600 mb-1">Balasan Penjual</p>
                          <p className="text-sm text-muted-foreground">{review.sellerResponse}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      {activeReview && activeReview.images && activeReview.images.length > 0 && (
        <ImageLightbox
          src={activeReview.images[selectedImgIdx]}
          alt={`Review image ${selectedImgIdx + 1}`}
          onClose={() => setActiveReview(null)}
          onPrev={selectedImgIdx > 0 ? () => setSelectedImgIdx(selectedImgIdx - 1) : null}
          onNext={selectedImgIdx < activeReview.images.length - 1 ? () => setSelectedImgIdx(selectedImgIdx + 1) : null}
          currentIndex={selectedImgIdx}
          totalCount={activeReview.images.length}
          reviewInfo={{
            reviewerName: activeReview.reviewer?.name || "Anonim",
            reviewerAvatar: activeReview.reviewer?.avatar,
            rating: activeReview.rating,
            comment: activeReview.comment,
            createdAt: activeReview.createdAt,
            productName: activeReview.product?.title,
          }}
        />
      )}
    </Card>
  );
}
