<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TopUpRequest extends FormRequest
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
            'amount' => ['required', 'integer', 'min:10000', 'max:10000000'], // Rp 10.000 - 10.000.000
            'paymentMethod' => ['required', 'string', 'max:50'],
            'paymentReference' => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'Jumlah top up wajib diisi',
            'amount.min' => 'Minimal top up Rp 10.000',
            'amount.max' => 'Maksimal top up Rp 10.000.000',
            'paymentMethod.required' => 'Metode pembayaran wajib dipilih',
        ];
    }
}
