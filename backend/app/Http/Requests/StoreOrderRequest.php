<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
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
            // Product
            'productId' => ['required', 'exists:products,uuid'],

            // Quantity
            'quantity' => ['required', 'integer', 'min:1'],

            // Negotiated price (if applicable)
            'negoPrice' => ['nullable', 'integer', 'min:0'],

            // Shipping
            'shippingType' => ['required', 'in:gratis,cod,pickup,delivery,online,onsite,home_service'],
            'selectedShippingOptionId' => ['nullable', 'exists:shipping_options,uuid'],
            'selectedAddressId' => ['required_if:shippingType,delivery', 'exists:addresses,uuid'],
            'shippingNotes' => ['nullable', 'string', 'max:500'],

            // Payment
            'paymentMethod' => ['required', 'in:balance,cod,transfer,midtrans'],

            // Notes
            'notes' => ['nullable', 'string', 'max:500'],
        ];

        // Service-specific rules
        if ($this->input('productType') === 'jasa') {
            $rules['serviceDate'] = ['nullable', 'date', 'after:today'];
            $rules['serviceTime'] = ['nullable', 'date_format:H:i'];
            $rules['serviceNotes'] = ['nullable', 'string', 'max:500'];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'productId.required' => 'Produk wajib dipilih',
            'productId.exists' => 'Produk tidak ditemukan',
            'quantity.required' => 'Jumlah wajib diisi',
            'quantity.min' => 'Jumlah minimal 1',
            'shippingType.required' => 'Metode pengiriman wajib dipilih',
            'shippingType.in' => 'Metode pengiriman tidak valid',
            'selectedShippingOptionId.required' => 'Opsi pengiriman wajib dipilih',
            'selectedShippingOptionId.exists' => 'Opsi pengiriman tidak ditemukan',
            'selectedAddressId.required_if' => 'Alamat pengiriman wajib dipilih',
            'selectedAddressId.exists' => 'Alamat tidak ditemukan',
            'paymentMethod.required' => 'Metode pembayaran wajib dipilih',
            'paymentMethod.in' => 'Metode pembayaran tidak valid',
            'serviceDate.after' => 'Tanggal layanan harus setelah hari ini',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Custom validation: Check if product exists and is available
            // This will be handled in the controller
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('negoPrice') && $this->negoPrice) {
            $this->merge([
                'nego_price' => $this->negoPrice * 100, // Convert to cent
            ]);
        }

        if ($this->has('productId')) {
            $this->merge([
                'product_id' => $this->productId,
            ]);
        }

        if ($this->has('selectedAddressId')) {
            $this->merge([
                'selected_address_id' => $this->selectedAddressId,
            ]);
        }

        if ($this->has('selectedShippingOptionId')) {
            $this->merge([
                'selected_shipping_option_id' => $this->selectedShippingOptionId,
            ]);
        }
    }
}
