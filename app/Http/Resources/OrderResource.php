<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource untuk Order
 * 
 * NORMALISASI YANG DITERAPKAN:
 * - product → nested Product object
 * - buyer/seller → nested User objects
 * - history → array of OrderHistory objects
 * - Harga dari cent → Rupiah
 */
class OrderResource extends JsonResource
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
            'orderNumber' => $this->order_number,
            
            // Product (nested object)
            'product' => new ProductResource($this->whenLoaded('product')),
            'productTitle' => $this->product_title,
            'productType' => $this->product_type->value ?? $this->product_type,
            
            // Users (nested objects)
            'buyer' => new UserResource($this->whenLoaded('buyer')),
            'seller' => new UserResource($this->whenLoaded('seller')),
            
            // Status
            'status' => $this->status->value ?? $this->status,
            'paymentStatus' => $this->payment_status->value ?? $this->payment_status,
            
            // Quantity
            'quantity' => $this->quantity,
            
            // Pricing (convert from cent to Rupiah)
            'basePrice' => (int) ($this->base_price / 100),
            'negoPrice' => $this->nego_price ? (int) ($this->nego_price / 100) : null,
            'finalPrice' => (int) ($this->final_price / 100),
            'shippingFee' => (int) ($this->shipping_fee / 100),
            'adminFeePercent' => (float) $this->admin_fee_percent,
            'adminFeeDeducted' => (int) ($this->admin_fee_deducted / 100),
            'totalPrice' => (int) ($this->total_price / 100),
            'netIncome' => (int) ($this->net_income / 100),
            
            // Shipping
            'shippingMethod' => $this->shipping_method,
            'shippingType' => $this->shipping_type->value ?? $this->shipping_type,
            'shippingAddress' => $this->shipping_address,
            'shippingNotes' => $this->shipping_notes,
            'selectedAddressId' => $this->selectedAddress?->uuid,
            'trackingNumber' => $this->tracking_number,
            
            // Service (for jasa)
            'serviceDate' => $this->service_date?->format('Y-m-d'),
            'serviceTime' => $this->service_time?->format('H:i'),
            'serviceDeadline' => $this->service_deadline?->toISOString(),
            'serviceNotes' => $this->service_notes,
            
            // Variable pricing (for jasa)
            'offeredPrice' => $this->offered_price ? (int) ($this->offered_price / 100) : null,
            'priceOfferNotes' => $this->price_offer_notes,
            
            // Payment
            'paymentMethod' => $this->payment_method,
            
            // Cancellation
            'cancelReason' => $this->cancel_reason,
            
            // History
            'history' => OrderHistoryResource::collection(
                $this->whenLoaded('history')
            ),
            
            // Timestamps
            'createdAt' => $this->created_at->toISOString(),
            'updatedAt' => $this->updated_at->toISOString(),
            'completedAt' => $this->completed_at?->toISOString(),
            'cancelledAt' => $this->cancelled_at?->toISOString(),
        ];
    }

    /**
     * Get minimal order data (for listings).
     */
    public function toMinimalArray(): array
    {
        return [
            'id' => $this->uuid,
            'orderNumber' => $this->order_number,
            'productTitle' => $this->product_title,
            'productType' => $this->product_type->value ?? $this->product_type,
            'status' => $this->status->value ?? $this->status,
            'totalPrice' => (int) ($this->total_price / 100),
            'createdAt' => $this->created_at->format('Y-m-d H:i'),
        ];
    }

    /**
     * Get order data for buyer view.
     */
    public function toBuyerArray(): array
    {
        return array_merge($this->toArray(request()), [
            'seller' => (new UserResource($this->seller))->toSellerArray(),
        ]);
    }

    /**
     * Get order data for seller view.
     */
    public function toSellerArray(): array
    {
        return array_merge($this->toArray(request()), [
            'buyer' => (new UserResource($this->buyer))->toMinimalArray(),
            'netIncome' => (int) ($this->net_income / 100),
        ]);
    }
}
