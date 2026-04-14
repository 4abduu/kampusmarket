<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'order_id',
        'actor_id',
        'status',
        'notes',
    ];

    protected $casts = [
        'actor_id' => 'integer',
    ];

    /**
     * Get the order that owns the history.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the actor (user) who made the change.
     */
    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Convert to frontend format.
     */
    public function toFrontendFormat(): array
    {
        return [
            'id' => $this->uuid,
            'orderId' => $this->order->uuid,
            'status' => $this->status,
            'notes' => $this->notes,
            'actorId' => $this->actor?->uuid,
            'actorName' => $this->actor?->name,
            'createdAt' => $this->created_at->toISOString(),
        ];
    }
}
