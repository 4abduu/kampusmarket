<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\HasUuid;

class CodInvoice extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'uuid',
        'user_id',
        'order_id',
        'amount',
        'status',
        'due_date',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'due_date' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
