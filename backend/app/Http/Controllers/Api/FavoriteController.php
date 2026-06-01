<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\ApiResponse;
use App\Models\Product;
use App\Models\Favorite;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FavoriteController extends Controller
{
    use ApiResponse;

    /**
     * Get user's favorites.
     */
    public function index(Request $request): JsonResponse
    {
        $favorites = Favorite::with(['product.category', 'product.images', 'product.seller.faculty'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return $this->success(
            $favorites->map(function ($fav) {
                return new ProductResource($fav->product);
            }),
            'Favorites retrieved'
        );
    }

    /**
     * Add a product to favorites.
     */
    public function store(string $productId, Request $request): JsonResponse
    {
        $product = Product::where('uuid', $productId)->firstOrFail();

        $favorite = Favorite::createForUser($request->user()->id, $product->id);

        return $this->success(
            ['isFavorited' => true],
            $favorite->wasRecentlyCreated ? 'Ditambahkan ke favorit' : 'Sudah ada di favorit',
            $favorite->wasRecentlyCreated ? 201 : 200
        );
    }

    /**
     * Remove a product from favorites.
     */
    public function destroy(string $productId, Request $request): JsonResponse
    {
        $product = Product::where('uuid', $productId)->firstOrFail();

        Favorite::removeForUser($request->user()->id, $product->id);

        return $this->success(
            ['isFavorited' => false],
            'Dihapus dari favorit'
        );
    }

    /**
     * Check whether a product is favorited by the current user.
     */
    public function check(string $productId, Request $request): JsonResponse
    {
        $product = Product::where('uuid', $productId)->firstOrFail();

        return $this->success([
            'isFavorited' => Favorite::isFavorited($request->user()->id, $product->id),
        ], 'Check completed');
    }
}
