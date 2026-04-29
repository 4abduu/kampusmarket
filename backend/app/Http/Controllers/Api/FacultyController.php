<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Http\Resources\FacultyResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class FacultyController extends Controller
{
    /**
     * Display a listing of faculties.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Faculty::visible();

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        } else {
            $query->where('is_active', true);
        }

        $faculties = $query->ordered()->get();

        return response()->json([
            'success' => true,
            'data' => FacultyResource::collection($faculties),
        ]);
    }

    /**
     * Display a listing of faculties for admin management.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Faculty::managed();

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $faculties = $query->ordered()->get();

        return response()->json([
            'success' => true,
            'data' => FacultyResource::collection($faculties),
        ]);
    }

    /**
     * Display the specified faculty.
     */
    public function show(string $code): JsonResponse
    {
        $faculty = Faculty::visible()
            ->where('code', $code)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new FacultyResource($faculty),
        ]);
    }

    /**
     * Store a new faculty.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9-]+$/', 'not_in:admin', 'unique:faculties,code'],
            'name' => ['required', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $faculty = Faculty::create([
            'code' => Str::of($validated['code'])->lower()->trim()->toString(),
            'name' => $validated['name'],
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Fakultas berhasil ditambahkan',
            'data' => new FacultyResource($faculty),
        ], 201);
    }

    /**
     * Update the specified faculty.
     */
    public function update(Request $request, string $code): JsonResponse
    {
        $faculty = Faculty::managed()
            ->where('code', $code)
            ->firstOrFail();

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9-]+$/', 'not_in:admin', Rule::unique('faculties', 'code')->ignore($faculty->id)],
            'name' => ['required', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $faculty->update([
            'code' => Str::of($validated['code'])->lower()->trim()->toString(),
            'name' => $validated['name'],
            'sort_order' => $validated['sort_order'] ?? $faculty->sort_order,
            'is_active' => $validated['is_active'] ?? $faculty->is_active,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Fakultas berhasil diperbarui',
            'data' => new FacultyResource($faculty->fresh()),
        ]);
    }

    /**
     * Update active status for a faculty.
     */
    public function updateStatus(Request $request, string $code): JsonResponse
    {
        $faculty = Faculty::managed()
            ->where('code', $code)
            ->firstOrFail();

        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $faculty->update([
            'is_active' => $validated['is_active'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status fakultas berhasil diperbarui',
            'data' => new FacultyResource($faculty->fresh()),
        ]);
    }

    /**
     * Remove the specified faculty.
     */
    public function destroy(string $code): JsonResponse
    {
        $faculty = Faculty::managed()
            ->where('code', $code)
            ->firstOrFail();

        $faculty->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fakultas berhasil dihapus',
        ]);
    }

    /**
     * Get faculties with user count.
     */
    public function withUserCount(): JsonResponse
    {
        $faculties = Faculty::visible()
            ->withCount('users')
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $faculties->map(function ($faculty) {
                return [
                    'id' => $faculty->code,
                    'name' => $faculty->name,
                    'userCount' => $faculty->users_count,
                ];
            }),
        ]);
    }

    /**
     * Get faculties as dropdown options.
     */
    public function dropdown(): JsonResponse
    {
        $faculties = Faculty::visible()
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $faculties->map(function ($faculty) {
                return [
                    'value' => $faculty->code,
                    'label' => $faculty->name,
                ];
            }),
        ]);
    }
}
