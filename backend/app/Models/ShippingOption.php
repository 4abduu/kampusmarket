<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\ShippingOptionType;

class ShippingOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'product_id',
        'type',
        'label',
        'price',
        'price_max',
    ];

    protected $casts = [
        'price' => 'integer',
        'price_max' => 'integer',
        'type' => ShippingOptionType::class,
    ];

    /**
     * Get the product that owns the shipping option.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Check if free shipping.
     */
    public function isFree(): bool
    {
        return $this->type === ShippingOptionType::GRATIS || $this->price === 0;
    }

    /**
     * Get formatted price.
     */
    public function getFormattedPrice(): string
    {
        if ($this->isFree()) {
            return 'Gratis';
        }

        if ($this->price_max && $this->price_max !== $this->price) {
            return 'Rp ' . number_format($this->price, 0, ',', '.') 
                . ' - Rp ' . number_format($this->price_max, 0, ',', '.');
        }

        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Convert to frontend format.
     */
    public function toFrontendFormat(): array
    {
        return [
            'type' => $this->type->value,
            'label' => $this->label,
            'price' => $this->price,  // Already in IDR
            'priceMax' => $this->price_max,
        ];
    }
}
