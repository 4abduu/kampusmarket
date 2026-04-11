<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Checked by middleware 'can:sell'
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = [
            // Basic info
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'type' => ['required', 'in:barang,jasa'],

            // Category
            'categoryId' => ['required', 'exists:categories,uuid'],

            // Pricing
            'price' => ['required', 'integer', 'min:0'],
            'originalPrice' => ['nullable', 'integer', 'min:0'],
            'priceType' => ['required', 'in:fixed,range,starting'],
            'priceMin' => ['required_if:priceType,range', 'integer', 'min:0'],
            'priceMax' => ['required_if:priceType,range', 'integer', 'min:0', 'gte:priceMin'],

            // Negotiation
            'canNego' => ['boolean'],

            // Location
            'location' => ['required', 'string', 'max:255'],

            // Images
            'images' => ['required', 'array', 'min:1', 'max:10'],
            'images.*' => ['string', 'max:500'],

            // Status
            'status' => ['sometimes', 'in:draft,active,sold_out,archived'],
        ];

        // Barang specific rules
        if ($this->type === 'barang') {
            $rules['condition'] = ['required', 'in:baru,bekas'];
            $rules['stock'] = ['required', 'integer', 'min:1'];
            $rules['weight'] = ['nullable', 'integer', 'min:0'];

            // Shipping options for barang
            $rules['isCod'] = ['boolean'];
            $rules['isPickup'] = ['boolean'];
            $rules['isDelivery'] = ['boolean'];
            $rules['deliveryFeeMin'] = ['nullable', 'integer', 'min:0'];
            $rules['deliveryFeeMax'] = ['nullable', 'integer', 'min:0'];
            $rules['shippingOptions'] = ['nullable', 'array'];
            $rules['shippingOptions.*.type'] = ['required', 'in:gratis,cod,pickup,delivery'];
            $rules['shippingOptions.*.label'] = ['required', 'string', 'max:100'];
            $rules['shippingOptions.*.price'] = ['required', 'integer', 'min:0'];
            $rules['shippingOptions.*.priceMax'] = ['nullable', 'integer', 'min:0'];
        }

        // Jasa specific rules
        if ($this->type === 'jasa') {
            $rules['durationMin'] = ['nullable', 'integer', 'min:1'];
            $rules['durationMax'] = ['nullable', 'integer', 'min:1', 'gte:durationMin'];
            $rules['durationUnit'] = ['nullable', 'in:jam,hari,minggu,bulan'];
            $rules['durationIsPlus'] = ['boolean'];
            $rules['availabilityStatus'] = ['nullable', 'in:available,busy,full'];

            // Service modes
            $rules['isOnline'] = ['boolean'];
            $rules['isOnsite'] = ['boolean'];
            $rules['isHomeService'] = ['boolean'];
            $rules['shippingOptions'] = ['nullable', 'array'];
            $rules['shippingOptions.*.type'] = ['required', 'in:online,onsite,home_service'];
            $rules['shippingOptions.*.label'] = ['required', 'string', 'max:100'];
            $rules['shippingOptions.*.price'] = ['required', 'integer', 'min:0'];
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
            'title.required' => 'Judul produk wajib diisi',
            'description.required' => 'Deskripsi produk wajib diisi',
            'type.required' => 'Tipe produk wajib dipilih',
            'type.in' => 'Tipe produk harus barang atau jasa',
            'categoryId.required' => 'Kategori wajib dipilih',
            'categoryId.exists' => 'Kategori tidak ditemukan',
            'price.required' => 'Harga wajib diisi',
            'price.min' => 'Harga minimal 0',
            'priceType.required' => 'Tipe harga wajib dipilih',
            'priceMin.required_if' => 'Harga minimum wajib untuk tipe range',
            'priceMax.required_if' => 'Harga maksimum wajib untuk tipe range',
            'priceMax.gte' => 'Harga maksimum harus lebih besar dari minimum',
            'location.required' => 'Lokasi wajib diisi',
            'images.required' => 'Minimal 1 gambar wajib diupload',
            'images.min' => 'Minimal 1 gambar wajib diupload',
            'images.max' => 'Maksimal 10 gambar',
            'condition.required' => 'Kondisi barang wajib dipilih',
            'stock.required' => 'Stok wajib diisi',
            'stock.min' => 'Stok minimal 1',
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
