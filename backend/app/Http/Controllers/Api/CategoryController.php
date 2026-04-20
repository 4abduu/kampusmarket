<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Resources\CategoryResource;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            Log::info('[CategoryController] Fetching categories', [
                'type' => $request->type,
                'user' => $request->user()?->id
            ]);

            $query = Category::query();

            // Filter by type
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            // Filter by active status
            if ($request->has('active')) {
                $query->where('is_active', $request->boolean('active'));
            } else {
                $query->where('is_active', true);
            }

            $categories = $query->ordered()->get();

            Log::info('[CategoryController] Categories fetched successfully', [
                'count' => $categories->count()
            ]);

            return response()->json([
                'success' => true,
                'data' => CategoryResource::collection($categories),
            ]);
        } catch (\Exception $e) {
            Log::error('[CategoryController] Error fetching categories', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories'
            ], 500);
        }
    }

    /**
     * Display the specified category.
     */
    public function show(string $slug): JsonResponse
    {
        try {
            Log::info('[CategoryController] Fetching category', ['slug' => $slug]);

            $category = Category::where('slug', $slug)
                ->orWhere('uuid', $slug)
                ->firstOrFail();

            Log::info('[CategoryController] Category fetched', [
                'id' => $category->id,
                'slug' => $category->slug,
            ]);

            return response()->json([
                'success' => true,
                'data' => new CategoryResource($category),
            ]);
        } catch (\Exception $e) {
            Log::error('[CategoryController] Error fetching category', [
                'slug' => $slug,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan',
            ], 404);
        }
    }

    /**
     * Get categories by type.
     */
    public function byType(string $type): JsonResponse
    {
        try {
            Log::info('[CategoryController] Fetching categories by type', ['type' => $type]);

            if (!in_array($type, ['barang', 'jasa'])) {
                Log::warning('[CategoryController] Invalid category type requested', ['type' => $type]);

                return response()->json([
                    'success' => false,
                    'message' => 'Tipe kategori tidak valid',
                ], 400);
            }

            $categories = Category::where('type', $type)
                ->where('is_active', true)
                ->ordered()
                ->get();

            Log::info('[CategoryController] Categories by type fetched', ['type' => $type, 'count' => $categories->count()]);

            return response()->json([
                'success' => true,
                'data' => CategoryResource::collection($categories),
            ]);
        } catch (\Exception $e) {
            Log::error('[CategoryController] Error fetching categories by type', [
                'type' => $type,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil kategori',
            ], 500);
        }
    }

    /**
     * Get category with product count.
     */
    public function withProductCount(Request $request): JsonResponse
    {
        try {
            $type = $request->get('type');

            Log::info('[CategoryController] Fetching categories with product counts', ['type' => $type]);

            $categories = Category::withCount(['products' => function ($query) {
                $query->where('status', 'active');
            }])
                ->when($type, fn($q) => $q->where('type', $type))
                ->where('is_active', true)
                ->ordered()
                ->get();

            Log::info('[CategoryController] Categories with counts fetched', ['count' => $categories->count()]);

            return response()->json([
                'success' => true,
                'data' => $categories->map(function ($category) {
                    return [
                        'id' => $category->uuid,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'icon' => $category->icon,
                        'type' => $category->type,
                        'productCount' => $category->products_count,
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            Log::error('[CategoryController] Error fetching categories with product counts', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil kategori dengan jumlah produk',
            ], 500);
        }
    }
}
