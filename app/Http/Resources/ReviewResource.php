<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource untuk Review
 * 
 * NORMALISASI YANG DITERAPKAN:
 * - images: dari tabel review_images → array of strings
 * - reviewer/reviewee → nested User objects
 * - product → nested Product object
 */
class ReviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // Primary identifier
            'id' => $this->uuid,
            
            // Order reference
            'orderId' => $this->order->uuid,
            
            // Users (nested objects)
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'reviewee' => new UserResource($this->whenLoaded('reviewee')),
            
            // Product
            'productId' => $this->product->uuid,
            'product' => new ProductResource($this->whenLoaded('product')),
            
            // Review content
            'rating' => $this->rating,
            'comment' => $this->comment,
            
            // Images (1NF - dari tabel terpisah ke array)
            'images' => $this->getImageUrls(),
            
            // Seller response
            'sellerResponse' => $this->seller_response,
            'sellerRespondedAt' => $this->seller_responded_at?->toISOString(),
            
            // Timestamps
            'createdAt' => $this->created_at->toISOString(),
            'updatedAt' => $this->updated_at->toISOString(),
        ];
    }

    /**
     * Get image URLs as array.
     */
    protected function getImageUrls(): array
    {
        if ($this->relationLoaded('images')) {
            return $this->images->pluck('url')->toArray();
        }
        return [];
    }

    /**
     * Get minimal review data.
     */
    public function toMinimalArray(): array
    {
        return [
            'id' => $this->uuid,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'reviewer' => (new UserResource($this->reviewer))->toMinimalArray(),
            'createdAt' => $this->created_at->format('Y-m-d'),
        ];
    }
}
