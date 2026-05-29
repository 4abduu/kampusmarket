<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Http\Resources\FacultyResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

/**
 * Admin Faculty Controller
 * Mengelola fakultas dari sisi administrator
 * - Full CRUD
 * - Filter & Search
 * - Pagination
 */
class AdminFacultyController extends Controller
{
    /**
     * Display a listing of all faculties for admin.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Faculty::managed()->withCount('users');

            // Filter by active status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            // Search by name or code
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            }

            // Sort
            $sortBy = $request->get('sort_by', 'sort_order');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginate
            $perPage = $request->get('per_page', 20);
            $faculties = $query->paginate($perPage);

            Log::info('[AdminFacultyController] Faculties fetched', [
                'total' => $faculties->total(),
            ]);

            return response()->json([
                'success' => true,
                'data' => FacultyResource::collection($faculties),
                'meta' => [
                    'current_page' => $faculties->currentPage(),
                    'last_page' => $faculties->lastPage(),
                    'per_page' => $faculties->perPage(),
                    'total' => $faculties->total(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('[AdminFacultyController] Error fetching faculties', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data fakultas',
            ], 500);
        }
    }

    /**
     * Store a newly created faculty.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'code' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9-]+$/', 'not_in:admin', 'unique:faculties,code'],
                'name' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string', 'max:1000'],
                'sort_order' => ['nullable', 'integer', 'min:0'],
                'is_active' => ['nullable', 'boolean'],
            ]);

            $faculty = Faculty::create([
                'code' => Str::of($validated['code'])->lower()->trim()->toString(),
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'sort_order' => $validated['sort_order'] ?? 0,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            Log::info('[AdminFacultyController] Faculty created', [
                'faculty_id' => $faculty->id,
                'code' => $faculty->code,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Fakultas berhasil ditambahkan',
                'data' => new FacultyResource($faculty),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('[AdminFacultyController] Error creating faculty', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat fakultas',
            ], 500);
        }
    }

    /**
     * Display the specified faculty.
     */
    public function show(string $code): JsonResponse
    {
        $faculty = Faculty::managed()
            ->where('code', $code)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new FacultyResource($faculty),
        ]);
    }

    /**
     * Update the specified faculty.
     */
    public function update(Request $request, string $code): JsonResponse
    {
        try {
            $faculty = Faculty::managed()
                ->where('code', $code)
                ->firstOrFail();

            $validated = $request->validate([
                'code' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9-]+$/', 'not_in:admin', Rule::unique('faculties', 'code')->ignore($faculty->id)],
                'name' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string', 'max:1000'],
                'sort_order' => ['nullable', 'integer', 'min:0'],
                'is_active' => ['nullable', 'boolean'],
            ]);

            $faculty->update([
                'code' => Str::of($validated['code'])->lower()->trim()->toString(),
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'sort_order' => $validated['sort_order'] ?? $faculty->sort_order,
                'is_active' => $validated['is_active'] ?? $faculty->is_active,
            ]);

            Log::info('[AdminFacultyController] Faculty updated', [
                'faculty_id' => $faculty->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Fakultas berhasil diperbarui',
                'data' => new FacultyResource($faculty->fresh()),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('[AdminFacultyController] Error updating faculty', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui fakultas',
            ], 500);
        }
    }

    /**
     * Update the active status of a faculty.
     */
    public function updateStatus(Request $request, string $code): JsonResponse
    {
        try {
            $faculty = Faculty::managed()
                ->where('code', $code)
                ->firstOrFail();

            $validated = $request->validate([
                'is_active' => ['required', 'boolean'],
            ]);

            $faculty->update([
                'is_active' => $validated['is_active'],
            ]);

            Log::info('[AdminFacultyController] Faculty status updated', [
                'faculty_id' => $faculty->id,
                'is_active' => $validated['is_active'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Status fakultas berhasil diperbarui',
                'data' => new FacultyResource($faculty->fresh()),
            ]);
        } catch (\Exception $e) {
            Log::error('[AdminFacultyController] Error updating status', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui status fakultas',
            ], 500);
        }
    }

    /**
     * Delete the specified faculty.
     */
    public function destroy(string $code): JsonResponse
    {
        try {
            $faculty = Faculty::managed()
                ->where('code', $code)
                ->firstOrFail();

            // Check if faculty has users
            if ($faculty->users()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus fakultas yang masih memiliki pengguna',
                ], 422);
            }

            $facultyName = $faculty->name;
            $faculty->delete();

            Log::info('[AdminFacultyController] Faculty deleted', [
                'faculty_name' => $facultyName,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Fakultas berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            Log::error('[AdminFacultyController] Error deleting faculty', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus fakultas',
            ], 500);
        }
    }

    /**
     * Get faculty statistics.
     */
    public function stats(): JsonResponse
    {
        $activeCount = Faculty::managed()->where('is_active', true)->count();
        $inactiveCount = Faculty::managed()->where('is_active', false)->count();
        $totalUsers = 0;

        return response()->json([
            'success' => true,
            'data' => [
                'active' => $activeCount,
                'inactive' => $inactiveCount,
                'total' => $activeCount + $inactiveCount,
            ],
        ]);
    }
}
