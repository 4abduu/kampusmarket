<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\ProductType;
use App\Enums\ProductStatus;
use App\Enums\ProductCondition;
use App\Enums\PriceType;
use App\Enums\AvailabilityStatus;
use App\Enums\DurationUnit;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'seller_id',
        'category_id',
        'title',
        'slug',
        'description',
        'price',
        'original_price',
        'price_min',
        'price_max',
        'price_type',
        'type',
        'condition',
        'stock',
        'weight',
        'duration_min',
        'duration_max',
        'duration_unit',
        'duration_is_plus',
        'availability_status',
        'can_nego',
        'location',
        'views',
        'rating',
        'review_count',
        'sold_count',
        'status',
    ];

    protected $casts = [
        'stock' => 'integer',
        'weight' => 'integer',
        'duration_min' => 'integer',
        'duration_max' => 'integer',
        'duration_is_plus' => 'boolean',
        'can_nego' => 'boolean',
        'views' => 'integer',
        'rating' => 'decimal:2',
        'review_count' => 'integer',
        'sold_count' => 'integer',
        'price' => 'integer',
        'original_price' => 'integer',
        'price_min' => 'integer',
        'price_max' => 'integer',
        'type' => ProductType::class,
        'status' => ProductStatus::class,
        'condition' => ProductCondition::class,
        'price_type' => PriceType::class,
        'availability_status' => AvailabilityStatus::class,
        'duration_unit' => DurationUnit::class,
    ];

    /**
     * Get the seller (user) that owns the product.
     */
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Get the category of the product.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the images for the product.
     */
    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    /**
     * Get the primary image for the product.
     */
    public function primaryImage()
    {
        return $this->images()->where('is_primary', true)->first() 
            ?? $this->images()->first();
    }

    /**
     * Get the shipping options for the product.
     */
    public function shippingOptions()
    {
        return $this->hasMany(ShippingOption::class);
    }

    /**
     * Get the orders for the product.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the chats for the product.
     */
    public function chats()
    {
        return $this->hasMany(Chat::class);
    }

    /**
     * Get the reviews for the product.
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the cart items for the product.
     */
    public function cartItems()
    {
        return $this->hasMany(Cart::class);
    }

    /**
     * Get the favorites for the product.
     */
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('status', ProductStatus::ACTIVE);
    }

    public function scopeBarang($query)
    {
        return $query->where('type', ProductType::BARANG);
    }

    public function scopeJasa($query)
    {
        return $query->where('type', ProductType::JASA);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeBySeller($query, $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    // Helper Methods

    /**
     * Check if product is barang.
     */
    public function isBarang(): bool
    {
        return $this->type === ProductType::BARANG;
    }

    /**
     * Check if product is jasa.
     */
    public function isJasa(): bool
    {
        return $this->type === ProductType::JASA;
    }

    /**
     * Check if product is available.
     */
    public function isAvailable(): bool
    {
        return $this->status === ProductStatus::ACTIVE && $this->stock > 0;
    }

    /**
     * Get price in Rupiah (from cent).
     */
    public function getPriceInRupiah(): float
    {
        return $this->price / 100;
    }

    /**
     * Get formatted price string.
     */
    public function getFormattedPrice(): string
    {
        if ($this->price_type === PriceType::RANGE) {
            return 'Rp ' . number_format($this->price_min ?? 0, 0, ',', '.') 
                . ' - Rp ' . number_format($this->price_max ?? 0, 0, ',', '.');
        } elseif ($this->price_type === PriceType::STARTING) {
            return 'Mulai Rp ' . number_format($this->price, 0, ',', '.');
        }
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get image URLs as array (for frontend compatibility).
     */
    public function getImageUrls(): array
    {
        return $this->images->pluck('url')->toArray();
    }

    /**
     * Increment view count.
     */
    public function incrementViews(): void
    {
        $this->increment('views');
    }

    /**
     * Recalculate rating from reviews.
     */
    public function recalculateRating(): void
    {
        $this->rating = $this->reviews()->avg('rating') ?? 0;
        $this->review_count = $this->reviews()->count();
        $this->save();
    }

    /**
     * Update sold count.
     */
    public function incrementSoldCount(int $quantity = 1): void
    {
        $this->increment('sold_count', $quantity);
        $this->decrement('stock', $quantity);
    }

    /**
     * Get duration string.
     */
    public function getDurationString(): ?string
    {
        if (!$this->duration_min) {
            return null;
        }

        $unit = $this->duration_unit?->label() ?? 'Hari';
        $plus = $this->duration_is_plus ? '+' : '';

        if ($this->duration_max && $this->duration_max !== $this->duration_min) {
            return "{$this->duration_min} - {$this->duration_max} {$unit}{$plus}";
        }

        return "{$this->duration_min} {$unit}{$plus}";
    }
}
