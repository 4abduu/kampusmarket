<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\NotificationType;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'type',
        'title',
        'message',
        'link',
        'data',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'type' => NotificationType::class,
    ];

    /**
     * Get the user that owns the notification.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark as read.
     */
    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->is_read = true;
            $this->read_at = now();
            $this->save();
        }
    }

    /**
     * Scope unread.
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope by type.
     */
    public function scopeByType($query, NotificationType $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Create order notification.
     */
    public static function createOrderNotification(int $userId, string $title, string $message, ?int $orderId = null): self
    {
        return static::create([
            'user_id' => $userId,
            'type' => NotificationType::ORDER,
            'title' => $title,
            'message' => $message,
            'link' => $orderId ? "/orders/{$orderId}" : null,
            'data' => $orderId ? ['order_id' => $orderId] : null,
        ]);
    }

    /**
     * Create chat notification.
     */
    public static function createChatNotification(int $userId, string $title, string $message, ?int $chatId = null): self
    {
        return static::create([
            'user_id' => $userId,
            'type' => NotificationType::CHAT,
            'title' => $title,
            'message' => $message,
            'link' => $chatId ? "/chats/{$chatId}" : null,
            'data' => $chatId ? ['chat_id' => $chatId] : null,
        ]);
    }

    /**
     * Convert to frontend format.
     */
    public function toFrontendFormat(): array
    {
        return [
            'id' => $this->uuid,
            'userId' => $this->user->uuid,
            'type' => $this->type->value,
            'title' => $this->title,
            'message' => $this->message,
            'link' => $this->link,
            'data' => $this->data,
            'isRead' => $this->is_read,
            'readAt' => $this->read_at?->toISOString(),
            'createdAt' => $this->created_at->toISOString(),
        ];
    }
}
