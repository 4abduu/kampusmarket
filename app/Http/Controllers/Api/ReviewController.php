<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Order;
use App\Models\Product;
use App\Models\ReviewImage;
use App\Http\Resources\ReviewResource;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Requests\UpdateReviewRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Helpers\NumberGenerator;

class ReviewController extends Controller
{
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

        return response()->json([
            'success' => true,
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'total' => $reviews->total(),
            ],
        ]);
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
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke pesanan ini',
            ], 403);
        }

        // Check if order is completed
        if ($order->status->value !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan belum selesai',
            ], 400);
        }

        // Check if already reviewed
        $existingReview = Review::where('order_id', $order->id)->first();
        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memberikan ulasan untuk pesanan ini',
            ], 400);
        }

        // Create review
        $review = Review::create([
            'uuid' => NumberGenerator::uuid(),
            'order_id' => $order->id,
            'reviewer_id' => $user->id,
            'reviewee_id' => $order->seller_id,
            'product_id' => $order->product_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

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

        return response()->json([
            'success' => true,
            'message' => 'Ulasan berhasil dikirim',
            'data' => new ReviewResource($review->load(['reviewer', 'reviewee', 'product', 'images'])),
        ], 201);
    }

    /**
     * Display the specified review.
     */
    public function show(string $id): JsonResponse
    {
        $review = Review::with(['reviewer', 'reviewee', 'product', 'images'])
            ->where('uuid', $id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new ReviewResource($review),
        ]);
    }

    /**
     * Update the specified review.
     */
    public function update(UpdateReviewRequest $request, string $id): JsonResponse
    {
        $review = Review::where('uuid', $id)->firstOrFail();

        // Check ownership
        if ($review->reviewer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke ulasan ini',
            ], 403);
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

        return response()->json([
            'success' => true,
            'message' => 'Ulasan berhasil diperbarui',
            'data' => new ReviewResource($review->fresh(['reviewer', 'reviewee', 'product', 'images'])),
        ]);
    }

    /**
     * Remove the specified review.
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        $review = Review::where('uuid', $id)->firstOrFail();

        // Check ownership
        if ($review->reviewer_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke ulasan ini',
            ], 403);
        }

        $reviewee = $review->reviewee;
        $product = $review->product;

        $review->delete();

        // Recalculate ratings
        $reviewee->recalculateRating();
        $product->recalculateRating();

        return response()->json([
            'success' => true,
            'message' => 'Ulasan berhasil dihapus',
        ]);
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
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk merespon ulasan ini',
            ], 403);
        }

        // Check if already responded
        if ($review->hasSellerResponse()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah merespon ulasan ini',
            ], 400);
        }

        $review->respond($request->response);

        return response()->json([
            'success' => true,
            'message' => 'Respon berhasil dikirim',
            'data' => new ReviewResource($review->fresh()),
        ]);
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

        // Calculate rating distribution
        $distribution = Review::where('product_id', $product->id)
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'total' => $reviews->total(),
                'averageRating' => (float) $product->rating,
                'totalReviews' => $product->review_count,
                'distribution' => [
                    5 => $distribution[5] ?? 0,
                    4 => $distribution[4] ?? 0,
                    3 => $distribution[3] ?? 0,
                    2 => $distribution[2] ?? 0,
                    1 => $distribution[1] ?? 0,
                ],
            ],
        ]);
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

        return response()->json([
            'success' => true,
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'total' => $reviews->total(),
                'averageRating' => (float) $user->rating,
                'totalReviews' => $user->review_count,
            ],
        ]);
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

        return response()->json([
            'success' => true,
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }
}
