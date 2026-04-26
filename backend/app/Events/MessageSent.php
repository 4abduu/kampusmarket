<?php

namespace App\Events;

use App\Models\Message;
use App\Http\Resources\MessageResource;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event: MessageSent [BARU]
 *
 * Dipanggil setelah pesan berhasil disimpan ke database.
 * Broadcast ke private channel "chat.{uuid}" agar frontend bisa
 * menerima pesan secara realtime via Laravel Echo + Reverb.
 */
class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message)
    {
    }

    /**
     * Broadcast ke channel private berdasarkan UUID chat.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->message->chat->uuid),
        ];
    }

    /**
     * Nama event yang didengar oleh Echo di frontend.
     */
    public function broadcastAs(): string
    {
        return 'MessageSent';
    }

    /**
     * Data yang dikirim ke frontend — sama persis dengan REST API response.
     */
    public function broadcastWith(): array
    {
        $this->message->loadMissing(['sender', 'chat', 'attachments']);

        return [
            'message' => (new MessageResource($this->message))->toArray(request()),
        ];
    }
}
