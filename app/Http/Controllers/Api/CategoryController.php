<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(Request $request): JsonResponse
    {
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

        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Display the specified category.
     */
    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->orWhere('uuid', $slug)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new CategoryResource($category),
        ]);
    }

    /**
     * Get categories by type.
     */
    public function byType(string $type): JsonResponse
    {
        if (!in_array($type, ['barang', 'jasa'])) {
            return response()->json([
                'success' => false,
                'message' => 'Tipe kategori tidak valid',
            ], 400);
        }

        $categories = Category::where('type', $type)
            ->where('is_active', true)
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Get category with product count.
     */
    public function withProductCount(Request $request): JsonResponse
    {
        $type = $request->get('type');

        $categories = Category::withCount(['products' => function ($query) {
            $query->where('status', 'active');
        }])
            ->when($type, fn($q) => $q->where('type', $type))
            ->where('is_active', true)
            ->ordered()
            ->get();

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
    }
}
