<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
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
        $rules = [];

        // For setting shipping fee (seller action)
        if ($this->route()->getActionMethod() === 'setShippingFee') {
            $rules['shippingFee'] = ['required', 'integer', 'min:0'];
            $rules['shippingMethod'] = ['nullable', 'string', 'max:100'];
        }

        // For offering price (seller action - variable pricing for jasa)
        if ($this->route()->getActionMethod() === 'offerPrice') {
            $rules['offeredPrice'] = ['required', 'integer', 'min:0'];
            $rules['priceOfferNotes'] = ['nullable', 'string', 'max:500'];
        }

        // For confirming price (buyer action)
        if ($this->route()->getActionMethod() === 'confirmPrice') {
            $rules['accepted'] = ['required', 'boolean'];
        }

        // For payment
        if ($this->route()->getActionMethod() === 'pay') {
            // Payment validation is handled by payment gateway
        }

        // For cancellation
        if ($this->route()->getActionMethod() === 'cancel') {
            $rules['cancelReason'] = ['required', 'string', 'max:500'];
        }

        // For completion
        if ($this->route()->getActionMethod() === 'complete') {
            $rules['notes'] = ['nullable', 'string', 'max:500'];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'shippingFee.required' => 'Ongkos kirim wajib diisi',
            'shippingFee.min' => 'Ongkos kirim minimal 0',
            'offeredPrice.required' => 'Harga penawaran wajib diisi',
            'offeredPrice.min' => 'Harga penawaran minimal 0',
            'accepted.required' => 'Konfirmasi diperlukan',
            'cancelReason.required' => 'Alasan pembatalan wajib diisi',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert prices from Rupiah to cent
        if ($this->has('shippingFee')) {
            $this->merge([
                'shipping_fee' => $this->shippingFee * 100,
            ]);
        }

        if ($this->has('offeredPrice')) {
            $this->merge([
                'offered_price' => $this->offeredPrice * 100,
            ]);
        }
    }
}
