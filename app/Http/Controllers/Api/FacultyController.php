<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Http\Resources\FacultyResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FacultyController extends Controller
{
    /**
     * Display a listing of faculties.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Faculty::query();

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
     * Display the specified faculty.
     */
    public function show(string $code): JsonResponse
    {
        $faculty = Faculty::where('code', $code)
            ->orWhere('id', $code)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new FacultyResource($faculty),
        ]);
    }

    /**
     * Get faculties with user count.
     */
    public function withUserCount(): JsonResponse
    {
        $faculties = Faculty::withCount('users')
            ->where('is_active', true)
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $faculties->map(function ($faculty) {
                return [
                    'id' => $faculty->code,
                    'name' => $faculty->name,
                    'icon' => $faculty->icon,
                    'color' => $faculty->color,
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
        $faculties = Faculty::where('is_active', true)
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $faculties->map(function ($faculty) {
                return [
                    'value' => $faculty->code,
                    'label' => $faculty->name,
                    'icon' => $faculty->icon,
                ];
            }),
        ]);
    }
}
