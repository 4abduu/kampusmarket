<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Enums\CancelReason;

class StoreCancelRequestRequest extends FormRequest
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
        return [
            'orderId' => ['required', 'exists:orders,uuid'],
            'reason' => ['required', 'in:changed_mind,found_better_price,seller_not_responding,other'],
            'description' => ['required', 'string', 'max:1000'],
            // 'evidence' => ['nullable', 'array', 'max:5'],
            // 'evidence.*' => ['string', 'max:500'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'orderId.required' => 'Pesanan wajib dipilih',
            'orderId.exists' => 'Pesanan tidak ditemukan',
            'reason.required' => 'Alasan pembatalan wajib dipilih',
            'reason.in' => 'Alasan pembatalan tidak valid',
            'description.required' => 'Deskripsi wajib diisi',
            'description.max' => 'Deskripsi maksimal 1000 karakter',
            // 'evidence.max' => 'Maksimal 5 bukti',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('orderId')) {
            $this->merge([
                'order_id' => $this->orderId,
            ]);
        }
    }
}
