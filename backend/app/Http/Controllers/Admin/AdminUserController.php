<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Faculty;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

/**
 * Admin User Controller
 * Mengelola pengguna dari sisi administrator
 * - Melihat semua pengguna (tidak termasuk admin)
 * - Ban/Unban users
 * - Verify users
 * - Filter & Search
 * - Pagination
 */
class AdminUserController extends Controller
{
    /**
     * Display a listing of all users (excluding admins).
     */
    public function index(Request $request): JsonResponse
    {
        try {
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
            if ($request->has('faculty_id')) {
                $query->where('faculty_id', $request->faculty_id);
            }

            if ($request->has('faculty_code')) {
                $faculty = Faculty::managed()->where('code', $request->faculty_code)->first();
                if ($faculty) {
                    $query->where('faculty_id', $faculty->id);
                }
            }

            // Search by name or email
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('uuid', '=', $search);
                });
            }

            // Sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginate
            $perPage = $request->get('per_page', 20);
            $users = $query->paginate($perPage);

            Log::info('[AdminUserController] Users fetched', [
                'total' => $users->total(),
            ]);

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
        } catch (\Exception $e) {
            Log::error('[AdminUserController] Error fetching users', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pengguna',
            ], 500);
        }
    }

    /**
     * Show a specific user.
     */
    public function show(string $id): JsonResponse
    {
        $user = User::with(['faculty', 'addresses'])
            ->where('uuid', $id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Ban a user.
     */
    public function ban(Request $request, string $id): JsonResponse
    {
        try {
            $user = User::where('uuid', $id)->firstOrFail();

            // Prevent banning admins
            if ($user->role->value === 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat memblokir pengguna admin',
                ], 403);
            }

            // Prevent banning already banned users
            if ($user->is_banned) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengguna sudah diblokir sebelumnya',
                ], 422);
            }

            $validated = $request->validate([
                'ban_reason' => ['required', 'string', 'max:500'],
            ]);

            $user->update([
                'is_banned' => true,
                'ban_reason' => $validated['ban_reason'],
            ]);

            // Revoke all tokens to force logout
            $user->tokens()->delete();

            Log::info('[AdminUserController] User banned', [
                'user_id' => $user->uuid,
                'user_email' => $user->email,
                'reason' => $validated['ban_reason'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil diblokir',
                'data' => new UserResource($user->fresh()),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('[AdminUserController] Error banning user', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal memblokir pengguna',
            ], 500);
        }
    }

    /**
     * Unban a user.
     */
    public function unban(string $id): JsonResponse
    {
        try {
            $user = User::where('uuid', $id)->firstOrFail();

            // Prevent unbanning already unbanned users
            if (!$user->is_banned) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengguna tidak dalam status diblokir',
                ], 422);
            }

            $user->update([
                'is_banned' => false,
                'ban_reason' => null,
            ]);

            Log::info('[AdminUserController] User unbanned', [
                'user_id' => $user->uuid,
                'user_email' => $user->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil dibuka blokirnya',
                'data' => new UserResource($user->fresh()),
            ]);
        } catch (\Exception $e) {
            Log::error('[AdminUserController] Error unbanning user', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuka blokir pengguna',
            ], 500);
        }
    }

    /**
     * Warn a user.
     */
    public function warn(Request $request, string $id): JsonResponse
    {
        try {
            $user = User::where('uuid', $id)->firstOrFail();

            $validated = $request->validate([
                'warning_reason' => ['required', 'string', 'max:500'],
            ]);

            $user->update([
                'is_warned' => true,
                'warning_reason' => $validated['warning_reason'],
                'warning_count' => $user->warning_count + 1,
            ]);

            \App\Models\Notification::create([
                'user_id' => $user->id,
                'type' => \App\Enums\NotificationType::SYSTEM,
                'title' => 'Peringatan Akun',
                'message' => "Akun Anda mendapat peringatan dari Admin: " . $validated['warning_reason'],
                'link' => null,
                'data' => null,
                'is_read' => false,
            ]);

            Log::info('[AdminUserController] User warned', [
                'user_id' => $user->uuid,
                'reason' => $validated['warning_reason'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil diberi peringatan',
                'data' => new UserResource($user->fresh()),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('[AdminUserController] Error warning user', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal memberi peringatan kepada pengguna',
            ], 500);
        }
    }

    /**
     * Remove warning from a user.
     */
    public function removeWarning(string $id): JsonResponse
    {
        try {
            $user = User::where('uuid', $id)->firstOrFail();

            $user->update([
                'is_warned' => false,
                'warning_reason' => null,
            ]);

            Log::info('[AdminUserController] User warning removed', [
                'user_id' => $user->uuid,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Peringatan pengguna berhasil dihapus',
                'data' => new UserResource($user->fresh()),
            ]);
        } catch (\Exception $e) {
            Log::error('[AdminUserController] Error removing warning', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus peringatan',
            ], 500);
        }
    }

    /**
     * Verify a user account.
     */
    public function verify(string $id): JsonResponse
    {
        try {
            $user = User::where('uuid', $id)->firstOrFail();

            if ($user->is_verified) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengguna sudah terverifikasi',
                ], 422);
            }

            $user->update([
                'is_verified' => true,
                'email_verified_at' => now(),
            ]);

            Log::info('[AdminUserController] User verified', [
                'user_id' => $user->uuid,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pengguna berhasil diverifikasi',
                'data' => new UserResource($user->fresh()),
            ]);
        } catch (\Exception $e) {
            Log::error('[AdminUserController] Error verifying user', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal memverifikasi pengguna',
            ], 500);
        }
    }

    /**
     * Get user statistics.
     */
    public function stats(): JsonResponse
    {
        $totalUsers = User::where('role', 'user')->count();
        $bannedCount = User::where('role', 'user')->where('is_banned', true)->count();
        $verifiedCount = User::where('role', 'user')->where('is_verified', true)->count();
        $warnedCount = User::where('role', 'user')->where('is_warned', true)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $totalUsers,
                'banned' => $bannedCount,
                'verified' => $verifiedCount,
                'warned' => $warnedCount,
                'active' => $totalUsers - $bannedCount,
            ],
        ]);
    }

    /**
     * Get all user addresses for admin.
     */
    public function addresses(Request $request): JsonResponse
    {
        try {
            // 1. Ambil pengguna reguler yang memiliki minimal satu alamat, urutkan A-Z berdasarkan nama
            $users = User::where('role', \App\Enums\UserRole::USER->value)
                ->whereHas('addresses')
                ->with(['addresses'])
                ->orderBy('name', 'asc')
                ->get();

            $formatted = $users->map(function ($user) {
                // 2. Urutkan alamat dengan callback universal: Utama (is_primary) dahulu, kemudian Label A-Z
                $sortedAddresses = $user->addresses->sort(function ($a, $b) {
                    if ($a->is_primary !== $b->is_primary) {
                        return $b->is_primary <=> $a->is_primary;
                    }
                    return strcasecmp($a->label, $b->label);
                });

                return [
                    'user' => [
                        'id' => $user->uuid,
                        'name' => $user->name,
                        'email' => $user->email,
                        'avatar' => $user->avatar,
                    ],
                    'addresses' => $sortedAddresses->map(function ($address) {
                        return [
                            'id' => $address->uuid,
                            'label' => $address->label,
                            'recipient_name' => $address->recipient,
                            'phone' => $address->phone,
                            'address' => $address->address,
                            'note' => $address->notes,
                            'is_primary' => (bool)$address->is_primary,
                        ];
                    })->values()->all(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formatted,
            ]);
        } catch (\Exception $e) {
            Log::error('[AdminUserController] Error fetching all user addresses', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data alamat',
            ], 500);
        }
    }
}
