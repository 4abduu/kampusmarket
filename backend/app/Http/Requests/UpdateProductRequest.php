<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = [
            // Basic info
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],

            // Category
            'categoryId' => ['sometimes', 'exists:categories,uuid'],

            // Pricing
            'price' => ['sometimes', 'integer', 'min:0'],
            'originalPrice' => ['nullable', 'integer', 'min:0'],
            'priceType' => ['sometimes', 'in:fixed,range,starting'],
            'priceMin' => ['nullable', 'integer', 'min:0'],
            'priceMax' => ['nullable', 'integer', 'min:0', 'gte:priceMin'],

            // Negotiation
            'canNego' => ['sometimes', 'boolean'],

            // Location
            'location' => ['sometimes', 'string', 'max:255'],

            // Images
            'images' => ['sometimes', 'array', 'min:1', 'max:10'],
            'images.*' => ['string', 'max:500'],

            // Status
            'status' => ['sometimes', 'in:draft,active,sold_out,archived'],
        ];

        // Barang specific rules
        if ($this->product?->type === 'barang' || $this->type === 'barang') {
            $rules['condition'] = ['sometimes', 'in:baru,bekas'];
            $rules['stock'] = ['sometimes', 'integer', 'min:0'];
            $rules['weight'] = ['nullable', 'integer', 'min:0'];
            $rules['isCod'] = ['sometimes', 'boolean'];
            $rules['isPickup'] = ['sometimes', 'boolean'];
            $rules['isDelivery'] = ['sometimes', 'boolean'];
            $rules['deliveryFeeMin'] = ['nullable', 'integer', 'min:0'];
            $rules['deliveryFeeMax'] = ['nullable', 'integer', 'min:0'];
            $rules['shippingOptions'] = ['nullable', 'array'];
            $rules['shippingOptions.*.type'] = ['required_with:shippingOptions', 'in:gratis,cod,pickup,delivery'];
            $rules['shippingOptions.*.label'] = ['required_with:shippingOptions', 'string', 'max:100'];
            $rules['shippingOptions.*.price'] = ['required_with:shippingOptions', 'integer', 'min:0'];
            $rules['shippingOptions.*.priceMax'] = ['nullable', 'integer', 'min:0'];
        }

        // Jasa specific rules
        if ($this->product?->type === 'jasa' || $this->type === 'jasa') {
            $rules['durationMin'] = ['nullable', 'integer', 'min:1'];
            $rules['durationMax'] = ['nullable', 'integer', 'min:1'];
            $rules['durationUnit'] = ['nullable', 'in:jam,hari,minggu,bulan'];
            $rules['durationIsPlus'] = ['sometimes', 'boolean'];
            $rules['availabilityStatus'] = ['nullable', 'in:available,busy,full'];
            $rules['isOnline'] = ['sometimes', 'boolean'];
            $rules['isOnsite'] = ['sometimes', 'boolean'];
            $rules['isHomeService'] = ['sometimes', 'boolean'];
            $rules['shippingOptions'] = ['nullable', 'array'];
            $rules['shippingOptions.*.type'] = ['required_with:shippingOptions', 'in:online,onsite,home_service'];
            $rules['shippingOptions.*.label'] = ['required_with:shippingOptions', 'string', 'max:100'];
            $rules['shippingOptions.*.price'] = ['required_with:shippingOptions', 'integer', 'min:0'];
            $rules['shippingOptions.*.priceMax'] = ['nullable', 'integer', 'min:0'];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.string' => 'Judul produk harus berupa teks',
            'description.string' => 'Deskripsi produk harus berupa teks',
            'categoryId.exists' => 'Kategori tidak ditemukan',
            'price.min' => 'Harga minimal 0',
            'priceMax.gte' => 'Harga maksimum harus lebih besar dari minimum',
            'images.min' => 'Minimal 1 gambar',
            'images.max' => 'Maksimal 10 gambar',
            'stock.min' => 'Stok minimal 0',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $snakeToCamel = [
            'category_id' => 'categoryId',
            'price_type' => 'priceType',
            'original_price' => 'originalPrice',
            'price_min' => 'priceMin',
            'price_max' => 'priceMax',
            'can_nego' => 'canNego',
            'is_cod' => 'isCod',
            'is_pickup' => 'isPickup',
            'is_delivery' => 'isDelivery',
            'delivery_fee_min' => 'deliveryFeeMin',
            'delivery_fee_max' => 'deliveryFeeMax',
            'duration_min' => 'durationMin',
            'duration_max' => 'durationMax',
            'duration_unit' => 'durationUnit',
            'duration_is_plus' => 'durationIsPlus',
            'availability_status' => 'availabilityStatus',
            'is_online' => 'isOnline',
            'is_onsite' => 'isOnsite',
            'is_home_service' => 'isHomeService',
            'shipping_options' => 'shippingOptions',
        ];

        $normalized = [];
        foreach ($snakeToCamel as $snake => $camel) {
            if ($this->has($snake) && !$this->has($camel)) {
                $normalized[$camel] = $this->input($snake);
            }
        }

        if (!empty($normalized)) {
            $this->merge($normalized);
        }

        // Convert price from Rupiah to cent
        if ($this->has('price')) {
            $this->merge([
                'price' => $this->price * 100,
            ]);
        }

        if ($this->has('originalPrice') && $this->originalPrice) {
            $this->merge([
                'original_price' => $this->originalPrice * 100,
            ]);
        }

        if ($this->has('priceMin')) {
            $this->merge([
                'price_min' => $this->priceMin * 100,
            ]);
        }

        if ($this->has('priceMax')) {
            $this->merge([
                'price_max' => $this->priceMax * 100,
            ]);
        }

        if ($this->has('categoryId')) {
            $this->merge([
                'category_id' => $this->categoryId,
            ]);
        }
    }
}
