<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAddressRequest extends FormRequest
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
            'label' => ['required', 'string', 'max:50'],
            'recipient' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:200'],
            'isPrimary' => ['boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'label.required' => 'Label alamat wajib diisi',
            'label.max' => 'Label maksimal 50 karakter',
            'recipient.required' => 'Nama penerima wajib diisi',
            'recipient.max' => 'Nama penerima maksimal 100 karakter',
            'address.required' => 'Alamat lengkap wajib diisi',
            'address.max' => 'Alamat maksimal 500 karakter',
            'notes.max' => 'Catatan maksimal 200 karakter',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('isPrimary')) {
            $this->merge([
                'is_primary' => $this->isPrimary,
            ]);
        }
    }
}
