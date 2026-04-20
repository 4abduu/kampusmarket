<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductImage;
use App\Models\ShippingOption;
use App\Models\Favorite;
use App\Models\Cart;
use App\Http\Resources\ProductResource;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Helpers\CurrencyHelper;
use App\Http\Helpers\NumberGenerator;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    /**
     * Display a listing of products (Public).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            Log::info('[ProductController] Fetching products', [
                'type' => $request->type,
                'category' => $request->category,
                'user' => $request->user()?->id
            ]);

            $query = Product::with(['category', 'images', 'seller.faculty', 'shippingOptions'])
                ->where('status', 'active');

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by category
        if ($request->has('category')) {
            $category = Category::where('slug', $request->category)->first();
            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        // Filter by condition (for barang)
        if ($request->has('condition')) {
            $query->where('condition', $request->condition);
        }

        // Filter by price range
        if ($request->has('price_min')) {
            $query->where('price', '>=', CurrencyHelper::toCent($request->price_min));
        }
        if ($request->has('price_max')) {
            $query->where('price', '<=', CurrencyHelper::toCent($request->price_max));
        }

        // Filter by location
        if ($request->has('location')) {
            $query->where('location', 'like', "%{$request->location}%");
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if ($sortBy === 'price') {
            $query->orderBy('price', $sortOrder);
        } elseif ($sortBy === 'rating') {
            $query->orderBy('rating', $sortOrder);
        } elseif ($sortBy === 'popular') {
            $query->orderBy('sold_count', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Paginate
        $perPage = $request->get('per_page', 12);
        $products = $query->paginate($perPage);

        Log::info('[ProductController] Products fetched successfully', [
            'count' => $products->total(),
            'per_page' => $perPage
        ]);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
        } catch (\Exception $e) {
            Log::error('[ProductController] Error fetching products', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products'
            ], 500);
        }
    }

    /**
     * Store a newly created product.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $user = $request->user();

        // Check if user can sell
        if (!$user->canSell()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menjual produk',
            ], 403);
        }

        // Generate slug
        $slug = NumberGenerator::uniqueSlug($request->title, Product::class);

        // Create product
        $product = Product::create([
            'uuid' => NumberGenerator::uuid(),
            'seller_id' => $user->id,
            'category_id' => $request->category_id,
            'title' => $request->title,
            'slug' => $slug,
            'description' => $request->description,
            'price' => $request->price,
            'original_price' => $request->original_price,
            'price_min' => $request->price_min,
            'price_max' => $request->price_max,
            'price_type' => $request->priceType,
            'type' => $request->type,
            'condition' => $request->condition,
            'stock' => $request->stock ?? 1,
            'weight' => $request->weight,
            'duration_min' => $request->durationMin,
            'duration_max' => $request->durationMax,
            'duration_unit' => $request->durationUnit,
            'duration_is_plus' => $request->durationIsPlus ?? false,
            'availability_status' => $request->availabilityStatus,
            'can_nego' => $request->canNego ?? true,
            'location' => $request->location,
            'status' => $request->status ?? 'active',
        ]);

        // Save images
        if ($request->has('images')) {
            foreach ($request->images as $index => $imageUrl) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'url' => $imageUrl,
                    'sort_order' => $index,
                    'is_primary' => $index === 0,
                ]);
            }
        }

        // Save shipping/service options (source-of-truth in shipping_options).
        $options = $request->input('shippingOptions', []);

        if (empty($options)) {
            if ($request->type === 'barang') {
                if ($request->isCod) {
                    $options[] = ['type' => 'cod', 'label' => 'COD / Ketemuan', 'price' => 0];
                }
                if ($request->isPickup) {
                    $options[] = ['type' => 'pickup', 'label' => 'Ambil Sendiri', 'price' => 0];
                }
                if ($request->isDelivery) {
                    $options[] = [
                        'type' => 'delivery',
                        'label' => 'Antar Manual',
                        'price' => $request->deliveryFeeMin ?? 0,
                        'priceMax' => $request->deliveryFeeMax,
                    ];
                }
            }

            if ($request->type === 'jasa') {
                if ($request->isOnline) {
                    $options[] = ['type' => 'online', 'label' => 'Online', 'price' => 0];
                }
                if ($request->isOnsite) {
                    $options[] = ['type' => 'onsite', 'label' => 'Ke Lokasi Penyedia Jasa', 'price' => 0];
                }
                if ($request->isHomeService) {
                    $options[] = ['type' => 'home_service', 'label' => 'Home Service', 'price' => 0];
                }
            }
        }

        foreach ($options as $option) {
            ShippingOption::create([
                'uuid' => NumberGenerator::uuid(),
                'product_id' => $product->id,
                'type' => $option['type'],
                'label' => $option['label'] ?? $option['type'],
                'price' => CurrencyHelper::toCent((int) ($option['price'] ?? 0)),
                'price_max' => isset($option['priceMax']) ? CurrencyHelper::toCent((int) $option['priceMax']) : null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dibuat',
            'data' => new ProductResource($product->load(['category', 'images', 'shippingOptions', 'seller.faculty'])),
        ], 201);
    }

    /**
     * Display the specified product.
     */
    public function show(string $slug): JsonResponse
    {
        $product = Product::with(['category', 'images', 'seller.faculty', 'shippingOptions', 'reviews.reviewer'])
            ->where('slug', $slug)
            ->orWhere('uuid', $slug)
            ->firstOrFail();

        // Increment views
        $product->incrementViews();

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product),
        ]);
    }

    /**
     * Update the specified product.
     */
    public function update(UpdateProductRequest $request, string $id): JsonResponse
    {
        $product = Product::where('uuid', $id)->firstOrFail();

        // Check ownership
        if ($product->seller_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke produk ini',
            ], 403);
        }

        $updateData = [];

        if ($request->has('title')) {
            $updateData['title'] = $request->title;
        }
        if ($request->has('description')) {
            $updateData['description'] = $request->description;
        }
        if ($request->has('categoryId')) {
            $updateData['category_id'] = $request->categoryId;
        }
        if ($request->has('price')) {
            $updateData['price'] = $request->price;
        }
        if ($request->has('originalPrice')) {
            $updateData['original_price'] = $request->originalPrice ? CurrencyHelper::toCent($request->originalPrice) : null;
        }
        if ($request->has('priceMin')) {
            $updateData['price_min'] = $request->priceMin ? CurrencyHelper::toCent($request->priceMin) : null;
        }
        if ($request->has('priceMax')) {
            $updateData['price_max'] = $request->priceMax ? CurrencyHelper::toCent($request->priceMax) : null;
        }
        if ($request->has('priceType')) {
            $updateData['price_type'] = $request->priceType;
        }
        if ($request->has('condition')) {
            $updateData['condition'] = $request->condition;
        }
        if ($request->has('stock')) {
            $updateData['stock'] = $request->stock;
        }
        if ($request->has('weight')) {
            $updateData['weight'] = $request->weight;
        }
        if ($request->has('durationMin')) {
            $updateData['duration_min'] = $request->durationMin;
        }
        if ($request->has('durationMax')) {
            $updateData['duration_max'] = $request->durationMax;
        }
        if ($request->has('durationUnit')) {
            $updateData['duration_unit'] = $request->durationUnit;
        }
        if ($request->has('durationIsPlus')) {
            $updateData['duration_is_plus'] = $request->durationIsPlus;
        }
        if ($request->has('availabilityStatus')) {
            $updateData['availability_status'] = $request->availabilityStatus;
        }
        if ($request->has('canNego')) {
            $updateData['can_nego'] = $request->canNego;
        }
        if ($request->has('location')) {
            $updateData['location'] = $request->location;
        }
        if ($request->has('status')) {
            $updateData['status'] = $request->status;
        }

        if (!empty($updateData)) {
            $product->update($updateData);
        }

        // Update images if provided
        if ($request->has('images')) {
            $product->images()->delete();
            foreach ($request->images as $index => $imageUrl) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'url' => $imageUrl,
                    'sort_order' => $index,
                    'is_primary' => $index === 0,
                ]);
            }
        }

        if ($request->has('shippingOptions')) {
            $product->shippingOptions()->delete();

            foreach ($request->shippingOptions as $option) {
                ShippingOption::create([
                    'uuid' => NumberGenerator::uuid(),
                    'product_id' => $product->id,
                    'type' => $option['type'],
                    'label' => $option['label'] ?? $option['type'],
                    'price' => CurrencyHelper::toCent((int) ($option['price'] ?? 0)),
                    'price_max' => isset($option['priceMax']) ? CurrencyHelper::toCent((int) $option['priceMax']) : null,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil diperbarui',
            'data' => new ProductResource($product->fresh(['category', 'images', 'shippingOptions', 'seller.faculty'])),
        ]);
    }

    /**
     * Remove the specified product.
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        $product = Product::where('uuid', $id)->firstOrFail();

        // Check ownership
        if ($product->seller_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke produk ini',
            ], 403);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus',
        ]);
    }

    /**
     * Update product status.
     */
    public function updateStatus(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:draft,active,sold_out,archived',
        ]);

        $product = Product::where('uuid', $id)->firstOrFail();

        // Check ownership
        if ($product->seller_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke produk ini',
            ], 403);
        }

        $product->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Status produk berhasil diperbarui',
            'data' => new ProductResource($product->fresh()),
        ]);
    }

    /**
     * Get products by category.
     */
    public function byCategory(string $category, Request $request): JsonResponse
    {
        $categoryModel = Category::where('slug', $category)->firstOrFail();

        $query = Product::with(['category', 'images', 'seller.faculty'])
            ->where('category_id', $categoryModel->id)
            ->where('status', 'active');

        $perPage = $request->get('per_page', 12);
        $products = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
                'category' => new \App\Http\Resources\CategoryResource($categoryModel),
            ],
        ]);
    }

    /**
     * Get products by seller.
     */
    public function bySeller(string $sellerId, Request $request): JsonResponse
    {
        $seller = \App\Models\User::where('uuid', $sellerId)->firstOrFail();

        $query = Product::with(['category', 'images'])
            ->where('seller_id', $seller->id)
            ->where('status', 'active');

        $perPage = $request->get('per_page', 12);
        $products = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
                'seller' => new \App\Http\Resources\UserResource($seller),
            ],
        ]);
    }

    /**
     * Get my products.
     */
    public function myProducts(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Product::with(['category', 'images', 'shippingOptions'])
            ->where('seller_id', $user->id);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 10);
        $products = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Search products.
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2',
        ]);

        $search = $request->q;

        $query = Product::with(['category', 'images', 'seller.faculty'])
            ->where('status', 'active')
            ->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });

        $perPage = $request->get('per_page', 12);
        $products = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
                'query' => $search,
            ],
        ]);
    }

    // ============================================
    // CART & FAVORITES
    // ============================================

    /**
     * Get user's cart.
     */
    public function getCart(Request $request): JsonResponse
    {
        $cartItems = Cart::with(['product.category', 'product.images'])
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $cartItems->map(function ($item) {
                return [
                    'id' => $item->uuid,
                    'product' => new ProductResource($item->product),
                    'quantity' => $item->quantity,
                    'notes' => $item->notes,
                    'subtotal' => (int) ($item->getSubtotalInCent() / 100),
                ];
            }),
            'total' => (int) ($cartItems->sum(fn($item) => $item->getSubtotalInCent()) / 100),
        ]);
    }

    /**
     * Add to cart.
     */
    public function addToCart(Request $request): JsonResponse
    {
        $request->validate([
            'productId' => 'required|exists:products,uuid',
            'quantity' => 'integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $product = Product::where('uuid', $request->productId)->firstOrFail();

        // Check stock
        if ($product->stock < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Stok tidak mencukupi',
            ], 400);
        }

        $cart = Cart::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'product_id' => $product->id,
            ],
            [
                'uuid' => NumberGenerator::uuid(),
                'quantity' => $request->quantity ?? 1,
                'notes' => $request->notes,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Produk ditambahkan ke keranjang',
        ]);
    }

    /**
     * Add a product to favorites.
     */
    public function addFavorite(string $productId, Request $request): JsonResponse
    {
        $product = Product::where('uuid', $productId)->firstOrFail();

        $favorite = Favorite::createForUser($request->user()->id, $product->id);

        return response()->json([
            'success' => true,
            'message' => $favorite->wasRecentlyCreated ? 'Ditambahkan ke favorit' : 'Sudah ada di favorit',
            'data' => [
                'isFavorited' => true,
            ],
        ], $favorite->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Remove a product from favorites.
     */
    public function removeFavorite(string $productId, Request $request): JsonResponse
    {
        $product = Product::where('uuid', $productId)->firstOrFail();

        Favorite::removeForUser($request->user()->id, $product->id);

        return response()->json([
            'success' => true,
            'message' => 'Dihapus dari favorit',
            'data' => [
                'isFavorited' => false,
            ],
        ]);
    }

    /**
     * Check whether a product is favorited by the current user.
     */
    public function checkFavorite(string $productId, Request $request): JsonResponse
    {
        $product = Product::where('uuid', $productId)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'isFavorited' => Favorite::isFavorited($request->user()->id, $product->id),
            ],
        ]);
    }

    /**
     * Get user's favorites.
     */
    public function getFavorites(Request $request): JsonResponse
    {
        $favorites = Favorite::with(['product.category', 'product.images', 'product.seller.faculty'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $favorites->map(function ($fav) {
                return new ProductResource($fav->product);
            }),
        ]);
    }
}
