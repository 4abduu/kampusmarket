<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;


class Cart extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'uuid',
        'user_id',
        'product_id',
        'quantity',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    /**
     * Get the user that owns the cart item.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product in the cart.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get subtotal (price * quantity) in direct IDR format.
     */
    public function getSubtotal(): int
    {
        return $this->product->price * $this->quantity;
    }

    /**
     * Get subtotal in Rupiah (same as getSubtotal).
     */
    public function getSubtotalInRupiah(): int
    {
        return $this->getSubtotal();
    }
}
