<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use App\Http\Helpers\NumberGenerator;

/**
 * Admin Category Controller
 * Mengelola kategori produk dari sisi administrator
 * - Full CRUD
 * - Filter & Search
 * - Pagination
 */
class AdminCategoryController extends Controller
{
    /**
     * Display a listing of all categories for admin.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Category::query();

            // Filter by type
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            // Filter by active status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            // Search by name or slug
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%")
                      ->orWhere('uuid', '=', $search);
                });
            }

            // Sort
            $sortBy = $request->get('sort_by', 'sort_order');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginate
            $perPage = $request->get('per_page', 20);
            $categories = $query->paginate($perPage);

            Log::info('[AdminCategoryController] Categories fetched', [
                'total' => $categories->total(),
            ]);

            return response()->json([
                'success' => true,
                'data' => CategoryResource::collection($categories),
                'meta' => [
                    'current_page' => $categories->currentPage(),
                    'last_page' => $categories->lastPage(),
                    'per_page' => $categories->perPage(),
                    'total' => $categories->total(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('[AdminCategoryController] Error fetching categories', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kategori',
            ], 500);
        }
    }

    /**
     * Store a newly created category.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'type' => ['required', 'in:barang,jasa'],
                'sort_order' => ['nullable', 'integer', 'min:0'],
                'is_active' => ['nullable', 'boolean'],
            ]);

            $slug = Str::slug($validated['name']);

            // Check if slug already exists
            if (Category::where('slug', $slug)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nama kategori sudah ada',
                ], 422);
            }

            $category = Category::create([
                'uuid' => NumberGenerator::uuid(),
                'name' => $validated['name'],
                'slug' => $slug,
                'type' => $validated['type'],
                'sort_order' => $validated['sort_order'] ?? 0,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            Log::info('[AdminCategoryController] Category created', [
                'category_id' => $category->uuid,
                'name' => $category->name,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Kategori berhasil ditambahkan',
                'data' => new CategoryResource($category),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('[AdminCategoryController] Error creating category', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat kategori',
            ], 500);
        }
    }

    /**
     * Display the specified category.
     */
    public function show(string $id): JsonResponse
    {
        $category = Category::where('uuid', $id)
            ->orWhere('slug', $id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new CategoryResource($category),
        ]);
    }

    /**
     * Update the specified category.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $category = Category::where('uuid', $id)
                ->orWhere('slug', $id)
                ->firstOrFail();

            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'type' => ['required', 'in:barang,jasa'],
                'sort_order' => ['nullable', 'integer', 'min:0'],
                'is_active' => ['nullable', 'boolean'],
            ]);

            $slug = Str::slug($validated['name']);

            // Check if slug already exists (excluding current category)
            if (Category::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nama kategori sudah ada',
                ], 422);
            }

            $category->update([
                'name' => $validated['name'],
                'slug' => $slug,
                'type' => $validated['type'],
                'sort_order' => $validated['sort_order'] ?? $category->sort_order,
                'is_active' => $validated['is_active'] ?? $category->is_active,
            ]);

            Log::info('[AdminCategoryController] Category updated', [
                'category_id' => $category->uuid,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Kategori berhasil diperbarui',
                'data' => new CategoryResource($category->fresh()),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('[AdminCategoryController] Error updating category', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui kategori',
            ], 500);
        }
    }

    /**
     * Delete the specified category.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $category = Category::where('uuid', $id)
                ->orWhere('slug', $id)
                ->firstOrFail();

            // Check if category has products
            if ($category->products()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus kategori yang masih memiliki produk',
                ], 422);
            }

            $categoryName = $category->name;
            $category->delete();

            Log::info('[AdminCategoryController] Category deleted', [
                'category_name' => $categoryName,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Kategori berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            Log::error('[AdminCategoryController] Error deleting category', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus kategori',
            ], 500);
        }
    }

    /**
     * Update category status (active/inactive).
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        try {
            $category = Category::where('uuid', $id)
                ->orWhere('slug', $id)
                ->firstOrFail();

            $validated = $request->validate([
                'is_active' => ['required', 'boolean'],
            ]);

            $category->update([
                'is_active' => $validated['is_active'],
            ]);

            Log::info('[AdminCategoryController] Category status updated', [
                'category_id' => $category->uuid,
                'is_active' => $validated['is_active'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Status kategori berhasil diperbarui',
                'data' => new CategoryResource($category->fresh()),
            ]);
        } catch (\Exception $e) {
            Log::error('[AdminCategoryController] Error updating status', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui status kategori',
            ], 500);
        }
    }

    /**
     * Get category statistics.
     */
    public function stats(): JsonResponse
    {
        $barangCount = Category::where('type', 'barang')->count();
        $jasaCount = Category::where('type', 'jasa')->count();
        $activeCount = Category::where('is_active', true)->count();
        $inactiveCount = Category::where('is_active', false)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'barang' => $barangCount,
                'jasa' => $jasaCount,
                'active' => $activeCount,
                'inactive' => $inactiveCount,
                'total' => $barangCount + $jasaCount,
            ],
        ]);
    }
}
