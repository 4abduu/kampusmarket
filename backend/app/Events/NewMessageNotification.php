<?php

namespace App\Events;

use App\Http\Resources\MessageResource;
use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast ringkas ke private channel users.{uuid}
 * untuk update list chat / unread count realtime.
 */
class NewMessageNotification implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Message $message,
        public string $receiverUuid,
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('users.' . $this->receiverUuid),
        ];
    }

    public function broadcastAs(): string
    {
        return 'NewMessageNotification';
    }

    public function broadcastWith(): array
    {
        $this->message->loadMissing(['sender', 'chat', 'attachments']);
        $chat = $this->message->chat()->first();

        return [
            'message' => (new MessageResource($this->message))->resolve(request()),
            'chatId' => $chat?->uuid,
            'chatInfo' => [
                'lastMessage' => $chat?->last_message,
                'lastMessageAt' => $chat?->last_message_at?->toISOString(),
            ],
        ];
    }
}
