<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource untuk Product
 * 
 * NORMALISASI YANG DITERAPKAN:
 * - images: dari tabel product_images → array of strings
 * - shippingOptions: dari tabel shipping_options → array of objects
 * - category_id → category string + categoryId
 * - seller_id → seller: User object
 * - Harga dari cent → Rupiah
 */
class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Convert price from cent to Rupiah
        $priceInRupiah = (int) ($this->price / 100);
        $originalPriceInRupiah = $this->original_price ? (int) ($this->original_price / 100) : null;
        $priceMinInRupiah = $this->price_min ? (int) ($this->price_min / 100) : null;
        $priceMaxInRupiah = $this->price_max ? (int) ($this->price_max / 100) : null;

        return [
            // Primary identifier
            'id' => $this->uuid,
            
            // Basic info
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            
            // Pricing (convert from cent to Rupiah)
            'price' => $priceInRupiah,
            'originalPrice' => $originalPriceInRupiah,
            'priceMin' => $priceMinInRupiah,
            'priceMax' => $priceMaxInRupiah,
            'priceType' => $this->price_type->value ?? 'fixed',
            
            // Product type
            'type' => $this->type->value ?? 'barang',
            'condition' => $this->condition?->value,
            
            // Category (3NF - dari foreign key)
            'category' => $this->category?->name,
            'categoryId' => $this->category?->uuid,
            
            // Images (1NF - dari tabel terpisah ke array)
            'images' => $this->getImageUrls(),
            
            // Seller
            'seller' => new UserResource($this->whenLoaded('seller')),
            'sellerId' => $this->seller->uuid,
            
            // Location & Stock
            'location' => $this->location,
            'stock' => $this->stock,
            'weight' => $this->weight,
            
            // Duration (for jasa)
            'durationMin' => $this->duration_min,
            'durationMax' => $this->duration_max,
            'durationUnit' => $this->duration_unit?->value,
            'durationIsPlus' => $this->duration_is_plus,
            'availabilityStatus' => $this->availability_status?->value,
            
            // Service modes (for jasa)
            'isOnline' => $this->is_online,
            'isOnsite' => $this->is_onsite,
            'isHomeService' => $this->is_home_service,
            
            // Shipping (for barang)
            'canNego' => $this->can_nego,
            'isCod' => $this->is_cod,
            'isPickup' => $this->is_pickup,
            'isDelivery' => $this->is_delivery,
            'deliveryFeeMin' => $this->delivery_fee_min ? (int) ($this->delivery_fee_min / 100) : null,
            'deliveryFeeMax' => $this->delivery_fee_max ? (int) ($this->delivery_fee_max / 100) : null,
            
            // Shipping Options (1NF - dari tabel terpisah ke array)
            'shippingOptions' => ShippingOptionResource::collection(
                $this->whenLoaded('shippingOptions')
            ),
            
            // Stats
            'views' => $this->views,
            'rating' => (float) $this->rating,
            'reviewCount' => $this->review_count,
            'soldCount' => $this->sold_count,
            
            // Status
            'status' => $this->status->value ?? 'active',
            
            // Timestamps
            'createdAt' => $this->created_at->format('Y-m-d'),
        ];
    }

    /**
     * Get image URLs as array (1NF → Array).
     */
    protected function getImageUrls(): array
    {
        if ($this->relationLoaded('images')) {
            return $this->images->pluck('url')->toArray();
        }
        return [];
    }

    /**
     * Get minimal product data (for listings).
     */
    public function toMinimalArray(): array
    {
        return [
            'id' => $this->uuid,
            'title' => $this->title,
            'slug' => $this->slug,
            'price' => (int) ($this->price / 100),
            'originalPrice' => $this->original_price ? (int) ($this->original_price / 100) : null,
            'images' => $this->getImageUrls(),
            'location' => $this->location,
            'rating' => (float) $this->rating,
            'reviewCount' => $this->review_count,
            'soldCount' => $this->sold_count,
            'type' => $this->type->value ?? 'barang',
            'condition' => $this->condition?->value,
            'category' => $this->category?->name,
        ];
    }

    /**
     *type' => $this->type->value ?? 'barang',
            'condition' => $this->condition?->value,
            'category' => $this->category?->name,
        ];
    }

    /**
     * Get card product data (for product cards).
     */
    public function toCardArray(): array
    {
        $primaryImage = $this->images->first()?->url ?? '';

        return [
            'id' => $this->uuid,
            'title' => $this->title,
            'slug' => $this->slug,
            'price' => (int) ($this->price / 100),
            'originalPrice' => $this->original_price ? (int) ($this->original_price / 100) : null,
            'image' => $primaryImage,
            'location' => $this->location,
            'rating' => (float) $this->rating,
            'soldCount' => $this->sold_count,
            'type' => $this->type->value ?? 'barang',
        ];
    }
}
