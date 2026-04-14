<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource untuk ShippingOption
 */
class ShippingOptionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'type' => $this->type->value ?? $this->type,
            'label' => $this->label,
            'price' => (int) ($this->price / 100), // Convert from cent to Rupiah
            'priceMax' => $this->price_max ? (int) ($this->price_max / 100) : null,
        ];
    }
}
