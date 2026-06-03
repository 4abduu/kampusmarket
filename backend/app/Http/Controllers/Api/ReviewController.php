<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\ApiResponse;
use App\Models\Review;
use App\Models\Order;
use App\Models\Product;
use App\Models\ReviewImage;
use App\Http\Resources\ReviewResource;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Requests\UpdateReviewRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Helpers\NotificationHelper;

class ReviewController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of reviews.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Review::with(['reviewer', 'reviewee', 'product', 'images']);

        // Filter by rating
        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        // Filter by product
        if ($request->has('productId')) {
            $product = Product::where('uuid', $request->productId)->first();
            if ($product) {
                $query->where('product_id', $product->id);
            }
        }

        $perPage = $request->get('per_page', 10);
        $reviews = $query->latest()->paginate($perPage);

        return $this->paginated(
            $reviews,
            ReviewResource::collection($reviews->items()),
            'Reviews retrieved'
        );
    }

    /**
     * Store a newly created review.
     */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        $user = $request->user();
        $order = Order::where('uuid', $request->orderId)->firstOrFail();

        // Check if order belongs to user
        if ($order->buyer_id !== $user->id) {
            return $this->forbidden('Anda tidak memiliki akses ke pesanan ini');
        }

        // Check if order is completed
        if ($order->status->value !== 'completed') {
            return $this->unprocessable('Pesanan belum selesai');
        }

        // Check if already reviewed (including soft-deleted)
        $existingReview = Review::withTrashed()->where('order_id', $order->id)->first();
        if ($existingReview) {
            if ($existingReview->trashed()) {
                // Force delete soft-deleted review so user can re-submit
                $existingReview->forceDelete();
            } else {
                return $this->unprocessable('Anda sudah memberikan ulasan untuk pesanan ini');
            }
        }

        // Create review
        $review = new Review();
        $review->order_id = $order->id;
        $review->reviewer_id = $user->id;
        // Explicitly set reviewee_id with fallback to product seller
        $review->reviewee_id = $order->seller_id ?? $order->product->seller_id;
        $review->product_id = $order->product_id;
        $review->rating = $request->rating;
        $review->comment = $request->comment;
        $review->save();

        // Save images
        if ($request->has('images')) {
            foreach ($request->images as $index => $imageUrl) {
                ReviewImage::create([
                    'review_id' => $review->id,
                    'url' => $imageUrl,
                    'sort_order' => $index,
                ]);
            }
        }

        // Update user and product ratings
        $order->seller->recalculateRating();
        $order->product->recalculateRating();

        NotificationHelper::reviewReceived($review->reviewee_id, $review);

        return $this->created(
            new ReviewResource($review->load(['reviewer', 'reviewee', 'product', 'images'])),
            'Ulasan berhasil dikirim'
        );
    }

    /**
     * Display the specified review.
     */
    public function show(string $id): JsonResponse
    {
        $review = Review::with(['reviewer', 'reviewee', 'product', 'images'])
            ->where('uuid', $id)
            ->firstOrFail();

        return $this->success(
            new ReviewResource($review),
            'Review retrieved'
        );
    }

    /**
     * Update the specified review.
     */
    public function update(UpdateReviewRequest $request, string $id): JsonResponse
    {
        $review = Review::where('uuid', $id)->firstOrFail();

        // Check ownership
        if ($review->reviewer_id !== $request->user()->id) {
            return $this->forbidden('Anda tidak memiliki akses ke ulasan ini');
        }

        $review->update($request->validated());

        // Update images if provided
        if ($request->has('images')) {
            $review->images()->delete();
            foreach ($request->images as $index => $imageUrl) {
                ReviewImage::create([
                    'review_id' => $review->id,
                    'url' => $imageUrl,
                    'sort_order' => $index,
                ]);
            }
        }

        // Recalculate ratings
        $review->reviewee->recalculateRating();
        $review->product->recalculateRating();

        return $this->success(
            new ReviewResource($review->fresh(['reviewer', 'reviewee', 'product', 'images'])),
            'Ulasan berhasil diperbarui'
        );
    }

    /**
     * Remove the specified review.
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        $review = Review::where('uuid', $id)->firstOrFail();

        // Check ownership
        if ($review->reviewer_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return $this->forbidden('Anda tidak memiliki akses ke ulasan ini');
        }

        $reviewee = $review->reviewee;
        $product = $review->product;

        $review->delete();

        // Recalculate ratings
        $reviewee->recalculateRating();
        $product->recalculateRating();

        return $this->success(null, 'Ulasan berhasil dihapus');
    }

    /**
     * Respond to review (Seller).
     */
    public function respond(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'response' => 'required|string|max:500',
        ]);

        $review = Review::where('uuid', $id)->firstOrFail();

        // Check if user is the reviewee
        if ($review->reviewee_id !== $request->user()->id) {
            return $this->forbidden('Anda tidak memiliki akses untuk merespon ulasan ini');
        }

        // Check if already responded
        if ($review->hasSellerResponse()) {
            return $this->unprocessable('Anda sudah merespon ulasan ini');
        }

        $review->respond($request->response);

        // Notify the original reviewer that their review got a reply
        NotificationHelper::reviewReplyReceived($review->reviewer_id, $review->fresh());

        return $this->success(
            new ReviewResource($review->fresh()),
            'Respon berhasil dikirim'
        );
    }

    /**
     * Get reviews for a product.
     */
    public function productReviews(string $productId, Request $request): JsonResponse
    {
        $product = Product::where('uuid', $productId)->firstOrFail();

        $query = Review::with(['reviewer', 'images'])
            ->where('product_id', $product->id);

        // Filter by rating
        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        $perPage = $request->get('per_page', 10);
        $reviews = $query->latest()->paginate($perPage);

        // Calculate rating distribution with all 5 rating keys guaranteed
        $distribution = Review::where('product_id', $product->id)
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        $ratingDistribution = array_replace(
            [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0],
            $distribution
        );

        return $this->paginated(
            $reviews,
            ReviewResource::collection($reviews->items()),
            'Product reviews retrieved',
            [
                'averageRating' => (float) $product->rating,
                'totalReviews' => $product->review_count,
                'distribution' => $ratingDistribution,
            ]
        );
    }

    /**
     * Get reviews received by a user.
     */
    public function receivedReviews(string $userId, Request $request): JsonResponse
    {
        $user = \App\Models\User::where('uuid', $userId)->firstOrFail();

        $query = Review::with(['reviewer', 'product.images', 'images'])
            ->where('reviewee_id', $user->id);

        $perPage = $request->get('per_page', 10);
        $reviews = $query->latest()->paginate($perPage);

        return $this->paginated(
            $reviews,
            ReviewResource::collection($reviews->items()),
            'Received reviews retrieved',
            [
                'averageRating' => (float) $user->rating,
                'totalReviews' => $user->review_count,
            ]
        );
    }

    /**
     * Get reviews given by a user.
     */
    public function givenReviews(Request $request): JsonResponse
    {
        $query = Review::with(['reviewee', 'product.images', 'images'])
            ->where('reviewer_id', $request->user()->id);

        $perPage = $request->get('per_page', 10);
        $reviews = $query->latest()->paginate($perPage);

        return $this->paginated(
            $reviews,
            ReviewResource::collection($reviews->items()),
            'Given reviews retrieved'
        );
    }
}
