<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast notifikasi baru untuk user tertentu.
 * Dipakai agar unread count di navbar langsung update realtime.
 */
class NewNotification implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public $notification
    ) {
    }

    public function broadcastOn(): array
    {
        // Broadcast ke channel users.{uuid}
        $userId = is_array($this->notification) 
            ? ($this->notification['userId'] ?? null)
            : ($this->notification->user->uuid ?? null);

        return [
            new PrivateChannel('users.' . $userId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'NewNotification';
    }

    public function broadcastWith(): array
    {
        if (is_array($this->notification)) {
            return $this->notification;
        }

        return $this->notification->toFrontendFormat();
    }
}
