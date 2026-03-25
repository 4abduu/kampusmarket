<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Faculty;
use App\Http\Resources\UserResource;
use App\Http\Resources\FacultyResource;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Display a listing of users (Admin only).
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['faculty'])
            ->where('role', 'user');

        // Filter by status
        if ($request->has('is_banned')) {
            $query->where('is_banned', $request->boolean('is_banned'));
        }

        if ($request->has('is_warned')) {
            $query->where('is_warned', $request->boolean('is_warned'));
        }

        if ($request->has('is_verified')) {
            $query->where('is_verified', $request->boolean('is_verified'));
        }

        // Filter by faculty
        if ($request->has('faculty')) {
            $faculty = Faculty::where('code', $request->faculty)->first();
            if ($faculty) {
                $query->where('faculty_id', $faculty->id);
            }
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Display the specified user (Public profile).
     */
    public function show(string $id): JsonResponse
    {
        $user = User::with(['faculty'])
            ->where('uuid', $id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Get current user profile.
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load(['faculty', 'addresses']);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Update current user profile.
     */
    public function updateProfile(UpdateUserRequest $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validated();

        // Handle faculty_id conversion
        if ($request->has('facultyId')) {
            $faculty = Faculty::where('code', $request->facultyId)->first();
            $data['faculty_id'] = $faculty?->id;
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui',
            'data' => new UserResource($user->fresh(['faculty'])),
        ]);
    }

    /**
     * Get user's products.
     */
    public function products(string $id, Request $request): JsonResponse
    {
        $user = User::where('uuid', $id)->firstOrFail();

        $query = $user->products()
            ->with(['category', 'images', 'shippingOptions'])
            ->where('status', 'active');

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 12);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => \App\Http\Resources\ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Get user's reviews.
     */
    public function reviews(string $id, Request $request): JsonResponse
    {
        $user = User::where('uuid', $id)->firstOrFail();

        $query = $user->reviewsReceived()
            ->with(['reviewer', 'product', 'images', 'order']);

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 10);
        $reviews = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => \App\Http\Resources\ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    /**
     * Get user stats.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'totalProducts' => $user->products()->count(),
                'totalSales' => $user->ordersAsSeller()->where('status', 'completed')->count(),
                'totalPurchases' => $user->ordersAsBuyer()->where('status', 'completed')->count(),
                'walletBalance' => (int) ($user->wallet_balance / 100),
                'rating' => (float) $user->rating,
                'reviewCount' => $user->review_count,
            ],
        ]);
    }

    // ============================================
    // ADMIN ACTIONS
    // ============================================

    /**
     * Ban a user (Admin only).
     */
    public function ban(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'banReason' => 'required|string|max:500',
        ]);

        $user = User::where('uuid', $id)->firstOrFail();

        $user->update([
            'is_banned' => true,
            'ban_reason' => $request->banReason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dibanned',
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Unban a user (Admin only).
     */
    public function unban(string $id): JsonResponse
    {
        $user = User::where('uuid', $id)->firstOrFail();

        $user->update([
            'is_banned' => false,
            'ban_reason' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil di-unban',
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Warn a user (Admin only).
     */
    public function warn(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'warningReason' => 'required|string|max:500',
        ]);

        $user = User::where('uuid', $id)->firstOrFail();

        $user->update([
            'is_warned' => true,
            'warning_reason' => $request->warningReason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil diberi peringatan',
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Verify a user (Admin only).
     */
    public function verify(string $id): JsonResponse
    {
        $user = User::where('uuid', $id)->firstOrFail();

        $user->update([
            'is_verified' => true,
            'email_verified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil diverifikasi',
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Get admin dashboard stats.
     */
    public function adminStats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'totalUsers' => User::where('role', 'user')->count(),
                'verifiedUsers' => User::where('role', 'user')->where('is_verified', true)->count(),
                'bannedUsers' => User::where('is_banned', true)->count(),
                'warnedUsers' => User::where('is_warned', true)->count(),
                'totalProducts' => \App\Models\Product::count(),
                'activeProducts' => \App\Models\Product::where('status', 'active')->count(),
                'totalOrders' => \App\Models\Order::count(),
                'completedOrders' => \App\Models\Order::where('status', 'completed')->count(),
                'pendingReports' => \App\Models\Report::where('status', 'pending')->count(),
                'pendingWithdrawals' => \App\Models\Withdrawal::where('status', 'pending')->count(),
            ],
        ]);
    }
}
