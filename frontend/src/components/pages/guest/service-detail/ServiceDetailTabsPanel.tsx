import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Smartphone, Home, MessageSquare } from "lucide-react";
import { getProductReviews, type Review, type ReviewsMeta } from "@/lib/api/reviews";
import ImageLightbox from "@/components/common/ImageLightbox";

interface ServiceDetailTabsPanelProps {
  description?: string;
  service?: any;
  productId?: string;
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

export default function ServiceDetailTabsPanel({ description, service, productId }: ServiceDetailTabsPanelProps) {
  const shippingOptions = service?.shippingOptions || [];
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<ReviewsMeta | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const [activeReview, setActiveReview] = useState<Review | null>(null);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  // Use the passed productId or fallback to service.id
  const resolvedProductId = productId || service?.id;

  useEffect(() => {
    if (!resolvedProductId || activeTab !== "reviews") return;

    const fetchReviews = async () => {
      setLoadingReviews(true);
      setReviewsError(false);
      try {
        const result = await getProductReviews(resolvedProductId, { per_page: 10 });
        setReviews(result.data || []);
        setMeta(result.meta || null);
      } catch (err) {
        console.error("[ServiceDetailTabsPanel] Failed to fetch reviews:", err);
        setReviewsError(true);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [resolvedProductId, activeTab]);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "online":
        return <Smartphone className="h-5 w-5 text-muted-foreground" />;
      case "onsite":
        return <MapPin className="h-5 w-5 text-muted-foreground" />;
      case "home_service":
        return <Home className="h-5 w-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <CardHeader className="pb-0">
          <TabsList className="w-full">
            <TabsTrigger value="description" className="flex-1">Deskripsi</TabsTrigger>
            <TabsTrigger value="methods" className="flex-1">Metode Layanan</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">
              Ulasan{meta ? ` (${meta.total})` : ""}
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="pt-4">
          <TabsContent value="description" className="mt-0">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-line">{description}</p>
            </div>
          </TabsContent>

          <TabsContent value="methods" className="mt-0">
            <div className="space-y-4">
              {shippingOptions && shippingOptions.length > 0 ? (
                shippingOptions.map((option: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      {option.type === "online" ? (
                        <Badge className="bg-primary-500">GRATIS</Badge>
                      ) : (
                        getServiceIcon(option.type)
                      )}
                      <div>
                        <p className="font-medium">{option.label}</p>
                        {option.description && (
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="font-medium">
                      {option.type === "online" || option.price === 0 ? "Gratis" : `Rp ${option.price.toLocaleString("id-ID")}`}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 text-center">
                  <p className="text-sm text-muted-foreground">Belum ada metode layanan tersedia</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            {loadingReviews ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b pb-4 last:border-0 animate-pulse">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                      <div className="space-y-1">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                ))}
              </div>
            ) : reviewsError ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Gagal memuat ulasan. Silakan coba lagi.</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Belum ada ulasan untuk layanan ini</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Rating summary */}
                {meta && meta.totalReviews !== undefined && meta.totalReviews > 0 && (
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 mb-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{meta.averageRating?.toFixed(1) ?? "0.0"}</p>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= Math.round(meta.averageRating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{meta.totalReviews} ulasan</p>
                    </div>
                    {meta.distribution && (
                      <div className="flex-1 space-y-1">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = meta.distribution?.[star] || 0;
                          const percentage = meta.totalReviews ? (count / meta.totalReviews!) * 100 : 0;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-xs w-3">{star}</span>
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-400 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-6">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews list */}
                {reviews.map((review) => {
                  const reviewerName = review.reviewer?.name || "Anonim";
                  const reviewerAvatar = review.reviewer?.avatar;
                  const initials = reviewerName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

                  return (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          {reviewerAvatar && <AvatarImage src={reviewerAvatar} alt={reviewerName} />}
                          <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{reviewerName}</p>
                            <div className="flex items-center gap-0.5">
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
                          <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
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
          </TabsContent>
        </CardContent>
      </Tabs>
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
          }}
        />
      )}
    </Card>
  );
}
