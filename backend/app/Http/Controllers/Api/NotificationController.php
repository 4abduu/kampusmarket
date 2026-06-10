<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\ApiResponse;
use App\Models\Notification;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of notifications.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Notification::where('user_id', $request->user()->id);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        $perPage = $request->get('per_page', 20);
        $notifications = $query->latest()->paginate($perPage);

        return $this->paginated(
            $notifications,
            NotificationResource::collection($notifications->items()),
            'Notifications retrieved'
        );
    }

    /**
     * Get unread notifications.
     */
    public function unread(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->latest()
            ->limit(20)
            ->get();

        return $this->success(
            NotificationResource::collection($notifications),
            'Unread notifications retrieved'
        );
    }

    /**
     * Get unread count.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return $this->success(
            ['unreadCount' => $count],
            'Unread count retrieved'
        );
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(string $id, Request $request): JsonResponse
    {
        $notification = Notification::where('uuid', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $notification->markAsRead();

        return $this->success(
            new NotificationResource($notification),
            'Notifikasi ditandai sudah dibaca'
        );
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return $this->success(null, 'Semua notifikasi ditandai sudah dibaca');
    }

    /**
     * Remove all notifications (optionally filtered by type).
     */
    public function deleteAll(Request $request): JsonResponse
    {
        $query = Notification::where('user_id', $request->user()->id);

        if ($request->has('type') && $request->type !== 'all' && $request->type !== 'unread') {
            $query->where('type', $request->type);
        } elseif ($request->has('type') && $request->type === 'unread') {
            $query->where('is_read', false);
        }

        $query->delete();

        return $this->success(null, 'Notifikasi berhasil dihapus');
    }

    /**
     * Remove the specified notification.
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        $notification = Notification::where('uuid', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $notification->delete();

        return $this->success(null, 'Notifikasi berhasil dihapus');
    }
}
