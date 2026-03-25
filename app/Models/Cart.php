<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

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
     * Get subtotal (price * quantity) in cent.
     */
    public function getSubtotalInCent(): int
    {
        return $this->product->price * $this->quantity;
    }

    /**
     * Get subtotal in Rupiah.
     */
    public function getSubtotalInRupiah(): float
    {
        return $this->getSubtotalInCent() / 100;
    }
}
