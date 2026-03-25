<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'product_id',
        'buyer_id',
        'seller_id',
        'order_id',
        'last_message',
        'last_message_at',
        'buyer_unread',
        'seller_unread',
        'is_active',
    ];

    protected $casts = [
        'buyer_unread' => 'integer',
        'seller_unread' => 'integer',
        'is_active' => 'boolean',
        'last_message_at' => 'datetime',
    ];

    /**
     * Get the product for the chat.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the buyer.
     */
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    /**
     * Get the seller.
     */
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Get the order (if any).
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the messages for the chat.
     */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get latest messages.
     */
    public function latestMessages($limit = 50)
    {
        return $this->messages()->latest()->take($limit)->get()->reverse()->values();
    }

    /**
     * Get the other participant in the chat.
     */
    public function getOtherParticipant(int $userId): User
    {
        return $this->buyer_id === $userId ? $this->seller : $this->buyer;
    }

    /**
     * Update last message.
     */
    public function updateLastMessage(string $message): void
    {
        $this->last_message = $message;
        $this->last_message_at = now();
        $this->save();
    }

    /**
     * Increment unread for other user.
     */
    public function incrementUnreadFor(int $senderId): void
    {
        if ($senderId === $this->buyer_id) {
            $this->increment('seller_unread');
        } else {
            $this->increment('buyer_unread');
        }
    }

    /**
     * Mark as read for user.
     */
    public function markAsReadFor(int $userId): void
    {
        if ($userId === $this->buyer_id) {
            $this->buyer_unread = 0;
        } else {
            $this->seller_unread = 0;
        }
        $this->save();
    }

    /**
     * Get unread count for user.
     */
    public function getUnreadCountFor(int $userId): int
    {
        return $userId === $this->buyer_id ? $this->buyer_unread : $this->seller_unread;
    }

    /**
     * Find or create chat for product and users.
     */
    public static function findOrCreate(int $productId, int $buyerId, int $sellerId): self
    {
        return static::firstOrCreate(
            [
                'product_id' => $productId,
                'buyer_id' => $buyerId,
                'seller_id' => $sellerId,
            ],
            [
                'is_active' => true,
            ]
        );
    }
}
