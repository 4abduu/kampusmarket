<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Resources\ProductResource;
use App\Helpers\NotificationHelper;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Admin Product Controller
 * Mengelola produk (barang/jasa) dari sisi administrator
 * - Melihat semua produk
 * - Menghapus produk (soft delete)
 * - Filter & Search
 * - Pagination
 */
class AdminProductController extends Controller
{
    /**
     * Display a listing of all products for admin (with soft deleted).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Product::withTrashed()->with(['category', 'images', 'seller.faculty']);

            // Filter by type
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            // Filter by category
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by seller
            if ($request->has('seller_id')) {
                $query->where('seller_id', $request->seller_id);
            }

            // Filter by condition
            if ($request->has('condition')) {
                $query->where('condition', $request->condition);
            }

            // Filter by price range
            if ($request->has('price_min')) {
                $query->where('price', '>=', $request->price_min);
            }
            if ($request->has('price_max')) {
                $query->where('price', '<=', $request->price_max);
            }

            // Search by title or description
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('uuid', '=', $search);
                });
            }

            // Filter by seller name (optional)
            if ($request->has('seller_name')) {
                $sellerName = $request->seller_name;
                $query->whereHas('seller', function ($q) use ($sellerName) {
                    $q->where('name', 'like', "%{$sellerName}%")
                      ->orWhere('email', 'like', "%{$sellerName}%");
                });
            }

            // Sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            
            if ($sortBy === 'price') {
                $query->orderBy('price', $sortOrder);
            } elseif ($sortBy === 'rating') {
                $query->orderBy('rating', $sortOrder);
            } elseif ($sortBy === 'views') {
                $query->orderBy('views', $sortOrder);
            } elseif ($sortBy === 'sold') {
                $query->orderBy('sold_count', $sortOrder);
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }

            // Paginate
            $perPage = $request->get('per_page', 20);
            $products = $query->paginate($perPage);

            Log::info('[AdminProductController] Products fetched', [
                'total' => $products->total(),
                'per_page' => $perPage,
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
            Log::error('[AdminProductController] Error fetching products', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data produk',
            ], 500);
        }
    }

    /**
     * Show a specific product.
     */
    public function show(string $id): JsonResponse
    {
        $product = Product::with(['category', 'images', 'seller.faculty', 'shippingOptions'])
            ->where('uuid', $id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product),
        ]);
    }

    /**
     * Delete a product (soft delete).
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $product = Product::where('uuid', $id)->firstOrFail();

        $validated = $request->validate([
            'delete_reason' => ['required', 'string', 'max:500'],
        ]);

        $product->update([
            'delete_reason' => $validated['delete_reason'],
            'deleted_by' => 'admin',
        ]);

        // Soft delete the product
        $product->delete();

        // Notify seller (async via queue)
        NotificationHelper::adminProductDeleted($product->seller_id, $product, $validated['delete_reason']);

        Log::info('[AdminProductController] Product deleted', [
            'product_id' => $product->uuid,
            'seller_id' => $product->seller_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus',
        ]);
    }

    /**
     * Get deleted/trashed products.
     */
    public function trashed(Request $request): JsonResponse
    {
        try {
            $query = Product::onlyTrashed()->with(['category', 'images', 'seller.faculty']);

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('uuid', '=', $search);
                });
            }

            // Sort
            $sortBy = $request->get('sort_by', 'deleted_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginate
            $perPage = $request->get('per_page', 20);
            $products = $query->paginate($perPage);

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
            Log::error('[AdminProductController] Error fetching trashed products', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data produk yang dihapus',
            ], 500);
        }
    }

    /**
     * Restore a soft-deleted product.
     */
    public function restore(string $id): JsonResponse
    {
        $product = Product::onlyTrashed()
            ->where('uuid', $id)
            ->firstOrFail();

        $product->restore();
        
        // Optional: clear deleted_by and delete_reason
        $product->update([
            'deleted_by' => null,
            'delete_reason' => null
        ]);

        // Notify seller (async via queue)
        NotificationHelper::adminProductRestored($product->seller_id, $product);

        Log::info('[AdminProductController] Product restored', [
            'product_id' => $product->uuid,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dipulihkan',
            'data' => new ProductResource($product),
        ]);
    }

    /**
     * Permanently delete a product (hard delete).
     */
    public function forceDelete(string $id): JsonResponse
    {
        $product = Product::withTrashed()
            ->where('uuid', $id)
            ->firstOrFail();

        $product->forceDelete();

        Log::info('[AdminProductController] Product force deleted', [
            'product_id' => $product->uuid,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus permanen',
        ]);
    }
}
