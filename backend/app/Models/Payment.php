<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'order_id',
        'payment_gateway',
        'payment_method',
        'transaction_id',
        'gross_amount',
        'currency',
        'status',
        'raw_response',
        'paid_at',
    ];

    protected $casts = [
        'gross_amount' => 'integer',
        'raw_response' => 'array',
        'paid_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
