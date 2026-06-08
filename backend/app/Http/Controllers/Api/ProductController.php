<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\ApiResponse;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductImage;
use App\Models\ShippingOption;
use App\Http\Resources\ProductResource;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Helpers\NumberGenerator;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of products (Public).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Product::with(['category', 'images', 'seller.faculty', 'shippingOptions'])
                ->where('status', 'active')
                // Hide 'barang' products with 0 stock from public listing
                ->where(function ($q) {
                    $q->where('type', 'jasa')
                      ->orWhere('stock', '>', 0);
                });

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
            $query->where('price', '>=', (int) $request->price_min);
        }
        if ($request->has('price_max')) {
            $query->where('price', '<=', (int) $request->price_max);
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
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhereHas('seller', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
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

        $maxPrice = Product::where('status', 'active')->max('price') ?? 20000000;

        return $this->paginated(
            $products,
            ProductResource::collection($products),
            'Products fetched',
            ['max_price' => (int) $maxPrice]
        );
        } catch (\Exception $e) {
            return $this->serverError('Failed to fetch products');
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
            return $this->forbidden('Anda tidak dapat menjual produk');
        }

        // Find category by UUID
        $category = Category::where('uuid', $request->category_id)->first();
        if (!$category) {
            return $this->notFound('Kategori tidak ditemukan');
        }

        // Generate slug
        $slug = NumberGenerator::uniqueSlug($request->title, Product::class);

        // Determine initial status
        $initialStatus = $this->resolveInitialStatus(
            $request->type,
            $request->status ?? 'active',
            $request->stock ?? 1
        );

        $priceType = $request->priceType ?? 'fixed';
        $priceMin = $request->price_min ?? $request->priceMin;
        $priceMax = $request->price_max ?? $request->priceMax;
        $price = $request->price;

        if ($priceType === 'starting' && $priceMin && !$price) {
            $price = $priceMin;
        }

        // Create product
        $product = Product::create([
            'seller_id' => $user->id,
            'category_id' => $category->id,
            'title' => $request->title,
            'slug' => $slug,
            'description' => $request->description,
            'price' => (int) $price,
            'original_price' => $request->original_price ? (int) $request->original_price : null,
            'price_min' => $priceMin ? (int) $priceMin : null,
            'price_max' => $priceMax ? (int) $priceMax : null,
            'price_type' => $priceType,
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
            'status' => $initialStatus,
        ]);

        // Sync images and shipping options
        $this->syncImages($product, $request->images ?? []);
        $this->syncShippingOptions($product, $request);

        // Notifikasi ke Admin jika butuh verifikasi
        if ($initialStatus === 'review') {
            \App\Helpers\NotificationHelper::adminProductVerification($product);
        }

        return $this->created(
            new ProductResource($product->load(['category', 'images', 'shippingOptions', 'seller.faculty'])),
            'Produk berhasil dibuat'
        );
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

        return $this->success(new ProductResource($product), 'Product retrieved');
    }

    /**
     * Update the specified product.
     */
    public function update(UpdateProductRequest $request, string $id): JsonResponse
    {
        $product = Product::where('uuid', $id)->firstOrFail();

        // Check ownership
        if ($product->seller_id !== $request->user()->id) {
            return $this->forbidden('Anda tidak memiliki akses ke produk ini');
        }

        // Build update data using helper
        $updateData = $this->buildUpdateData($product, $request);

        // Perform basic info update
        if (!empty($updateData)) {
            $product->update($updateData);
        }

        // Update images
        if ($request->has('images')) {
            $this->syncImages($product, $request->images);
        }

        // Update shipping/service options
        $this->updateShippingOptions($product, $request);

        return $this->success(
            new ProductResource($product->fresh(['category', 'images', 'shippingOptions', 'seller.faculty'])),
            'Produk berhasil diperbarui'
        );
    }

    /**
     * Remove the specified product.
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        $product = Product::where('uuid', $id)->firstOrFail();

        // Check ownership
        if ($product->seller_id !== $request->user()->id) {
            return $this->forbidden('Anda tidak memiliki akses ke produk ini');
        }

        $product->update([
            'delete_reason' => 'Dihapus oleh pengguna',
            'deleted_by' => 'user',
        ]);

        $product->delete();

        return $this->success(null, 'Produk berhasil dihapus');
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
            return $this->forbidden('Anda tidak memiliki akses ke produk ini');
        }

        // Validate status change for barang products
        if ($product->type === 'barang') {
            if ($request->status === 'sold_out' && $product->stock > 0) {
                return $this->unprocessable(
                    'Status "Terjual" hanya bisa digunakan ketika stok = 0. Silakan kurangi stok menjadi 0 terlebih dahulu.'
                );
            }

            if ($request->status === 'active' && $product->stock === 0) {
                return $this->unprocessable('Status "Aktif" hanya bisa digunakan ketika stok > 0.');
            }
        }

        $product->update(['status' => $request->status]);

        return $this->success(
            new ProductResource($product->fresh()),
            'Status produk berhasil diperbarui'
        );
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

        return $this->success([
            'products' => ProductResource::collection($products),
            'category' => new \App\Http\Resources\CategoryResource($categoryModel),
        ], 'Products by category retrieved');
    }

    /**
     * Get products by seller.
     */
    public function bySeller(string $sellerId, Request $request): JsonResponse
    {
        $seller = \App\Models\User::where('uuid', $sellerId)->firstOrFail();

        $query = Product::with(['category', 'images'])
            ->where('seller_id', $seller->id)
            ->whereIn('status', ['active', 'sold_out']);

        $perPage = $request->get('per_page', 12);
        $products = $query->latest()->paginate($perPage);

        return $this->success([
            'products' => ProductResource::collection($products),
            'seller' => new \App\Http\Resources\UserResource($seller),
        ], 'Products by seller retrieved');
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

        return $this->paginated(
            $products,
            ProductResource::collection($products),
            'My products retrieved'
        );
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
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhereHas('seller', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });

        $perPage = $request->get('per_page', 48);
        $products = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
            'query' => $search,
        ]);
    }

    // ============================================
    // PRIVATE HELPER METHODS
    // ============================================

    /**
     * Resolve initial status for product based on type and stock.
     */
    private function resolveInitialStatus(string $type, string $requestedStatus, int $stock): string
    {
        if ($type === 'barang') {
            // If stock is 0, force status to sold_out
            if ($stock === 0) {
                return 'sold_out';
            }
            // If status is sold_out but stock > 0, correct to active
            elseif ($requestedStatus === 'sold_out' && $stock > 0) {
                return 'active';
            }
        }

        return $requestedStatus;
    }

    /**
     * Sync product images.
     */
    private function syncImages(Product $product, array $images): void
    {
        $product->images()->delete();
        foreach ($images as $index => $imageUrl) {
            ProductImage::create([
                'product_id' => $product->id,
                'url' => $imageUrl,
                'sort_order' => $index,
                'is_primary' => $index === 0,
            ]);
        }
    }

    /**
     * Build update data from request.
     */
    private function buildUpdateData(Product $product, UpdateProductRequest $request): array
    {
        $updateData = [];

        // Title & Slug
        if ($request->has('title')) {
            $updateData['title'] = $request->title;
            $updateData['slug'] = Str::slug($request->title) . '-' . Str::random(5);
        }

        // Description, Location, Condition
        if ($request->has('description')) $updateData['description'] = $request->description;
        if ($request->has('location')) $updateData['location'] = $request->location;
        if ($request->has('condition')) $updateData['condition'] = $request->condition;
        
        // Category
        if ($request->has('categoryId')) {
            $category = Category::where('uuid', $request->categoryId)->first();
            if ($category) $updateData['category_id'] = $category->id;
        }

        // Pricing
        $price = $request->price;
        $priceMin = $request->has('priceMin') ? $request->priceMin : ($request->has('price_min') ? $request->price_min : null);
        $priceMax = $request->has('priceMax') ? $request->priceMax : ($request->has('price_max') ? $request->price_max : null);
        $priceType = $request->has('priceType') ? $request->priceType : ($request->has('price_type') ? $request->price_type : null);

        $finalPriceType = $priceType ?? $product->price_type?->value;
        if ($finalPriceType === 'starting' && $priceMin !== null && empty($price)) {
            $price = $priceMin;
        }

        if ($price !== null && $price !== '') $updateData['price'] = (int) $price;
        if ($priceMin !== null && $priceMin !== '') $updateData['price_min'] = (int) $priceMin;
        if ($priceMax !== null && $priceMax !== '') $updateData['price_max'] = (int) $priceMax;
        if ($request->has('originalPrice')) $updateData['original_price'] = $request->originalPrice;
        if ($priceType !== null) $updateData['price_type'] = $priceType;
        if ($request->has('canNego')) $updateData['can_nego'] = $request->canNego;

        // Stock & Weight
        if ($request->has('stock')) $updateData['stock'] = $request->stock;
        if ($request->has('weight')) $updateData['weight'] = $request->weight;

        // Jasa specific
        if ($request->has('durationMin')) $updateData['duration_min'] = $request->durationMin;
        if ($request->has('durationMax')) $updateData['duration_max'] = $request->durationMax;
        if ($request->has('durationUnit')) $updateData['duration_unit'] = $request->durationUnit;
        if ($request->has('durationIsPlus')) $updateData['duration_is_plus'] = $request->durationIsPlus;
        if ($request->has('availabilityStatus')) $updateData['availability_status'] = $request->availabilityStatus;

        // Status (basic)
        if ($request->has('status')) $updateData['status'] = $request->status;

        // Auto-correct status based on stock (for barang only)
        if ($product->type === 'barang') {
            $newStock = $updateData['stock'] ?? $product->stock;
            $newStatus = $updateData['status'] ?? $product->status;

            if ($newStock === 0 && $newStatus === 'active') {
                $updateData['status'] = 'sold_out';
            } elseif ($newStock > 0 && $newStatus === 'sold_out') {
                $updateData['status'] = 'active';
            }
        }

        return $updateData;
    }

    /**
     * Sync shipping options for store().
     */
    private function syncShippingOptions(Product $product, StoreProductRequest $request): void
    {
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
                        'price' => $request->deliveryFeeMin ? (int) $request->deliveryFeeMin : 0,
                        'priceMax' => $request->deliveryFeeMax ? (int) $request->deliveryFeeMax : null,
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
                'product_id' => $product->id,
                'type' => $option['type'],
                'label' => $option['label'] ?? $option['type'],
                'price' => (int) ($option['price'] ?? 0),
                'price_max' => isset($option['priceMax']) ? (int) ($option['priceMax']) : (isset($option['price_max']) ? (int) ($option['price_max']) : null),
            ]);
        }
    }

    /**
     * Update shipping options for update().
     */
    private function updateShippingOptions(Product $product, UpdateProductRequest $request): void
    {
        $options = $request->input('shippingOptions') ?? $request->input('shipping_options');

        // Fallback to individual fields if shippingOptions not provided
        if (is_null($options)) {
            $hasAnyMethod = $request->hasAny([
                'isCod', 'isPickup', 'isDelivery', 
                'isOnline', 'isOnsite', 'isHomeService',
                'is_cod', 'is_pickup', 'is_delivery',
                'is_online', 'is_onsite', 'is_home_service'
            ]);

            if ($hasAnyMethod) {
                $options = [];
                if ($request->isCod) $options[] = ['type' => 'cod', 'label' => 'COD (Bayar di Tempat)', 'price' => 0];
                if ($request->isPickup) $options[] = ['type' => 'pickup', 'label' => 'Ambil di Kampus (Gratis)', 'price' => 0];
                if ($request->isDelivery) {
                    $options[] = [
                        'type' => 'delivery',
                        'label' => 'Antar ke Lokasi (Berbayar)',
                        'price' => $request->deliveryFeeMin ? (int) $request->deliveryFeeMin : 0,
                        'price_max' => $request->deliveryFeeMax ? (int) $request->deliveryFeeMax : null
                    ];
                }

                if ($request->isOnline) $options[] = ['type' => 'online', 'label' => 'Layanan Online', 'price' => 0];
                if ($request->isOnsite) $options[] = ['type' => 'onsite', 'label' => 'Datang ke Lokasi Provider', 'price' => 0];
                if ($request->isHomeService) $options[] = ['type' => 'home_service', 'label' => 'Provider Datang ke Lokasi Anda', 'price' => 0];
            }
        }

        // Apply shipping options update if they were provided or inferred
        if (!is_null($options)) {
            $product->shippingOptions()->delete();
            foreach ($options as $option) {
                ShippingOption::create([
                    'product_id' => $product->id,
                    'type' => $option['type'],
                    'label' => $option['label'] ?? $option['type'],
                    'price' => (int) ($option['price'] ?? 0),
                    'price_max' => isset($option['priceMax']) ? (int) ($option['priceMax']) : (isset($option['price_max']) ? (int) ($option['price_max']) : null),
                ]);
            }
        }
    }
}
